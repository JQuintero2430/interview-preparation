// Upload queue as a state machine: pure reducer (all the rules) + a thin controller (side effects).
// Item lifecycle:  queued -> uploading -> done
//                              |-> queued (auto retry while attempts < maxAttempts) | failed
//                  queued|uploading -> canceled;  failed|canceled -> queued (manual retry)

export type UploadStatus = 'queued' | 'uploading' | 'done' | 'failed' | 'canceled';

export type UploadItem = {
  id: string;
  name: string;
  size: number;
  status: UploadStatus;
  progress: number; // 0..100
  attempts: number;
  error: string | null;
};

export type QueueState = { items: readonly UploadItem[]; maxAttempts: number };

export type QueueAction =
  | { type: 'add'; items: { id: string; name: string; size: number }[] }
  | { type: 'start'; id: string }
  | { type: 'progress'; id: string; percent: number }
  | { type: 'succeed'; id: string }
  | { type: 'fail'; id: string; error: string }
  | { type: 'cancel'; id: string }
  | { type: 'retry'; id: string };

export function createQueueState(maxAttempts = 3): QueueState {
  return { items: [], maxAttempts };
}

// Applies `patch` only when the item is in one of the allowed states; otherwise returns the SAME state.
function change(state: QueueState, id: string, allowed: UploadStatus[], patch: (i: UploadItem) => Partial<UploadItem>): QueueState {
  const items = state.items.map((i) => (i.id === id && allowed.includes(i.status) ? { ...i, ...patch(i) } : i));
  return items.some((item, idx) => item !== state.items[idx]) ? { ...state, items } : state;
}

export function uploadQueueReducer(state: QueueState, action: QueueAction): QueueState {
  switch (action.type) {
    case 'add':
      return {
        ...state,
        items: [...state.items, ...action.items.map((i): UploadItem => ({ ...i, status: 'queued', progress: 0, attempts: 0, error: null }))],
      };
    case 'start':
      return change(state, action.id, ['queued'], (i) => ({ status: 'uploading', attempts: i.attempts + 1, progress: 0, error: null }));
    case 'progress':
      return change(state, action.id, ['uploading'], () => ({ progress: Math.min(100, Math.max(0, action.percent)) }));
    case 'succeed':
      return change(state, action.id, ['uploading'], () => ({ status: 'done', progress: 100 }));
    case 'fail':
      return change(state, action.id, ['uploading'], (i) => ({ status: i.attempts < state.maxAttempts ? 'queued' : 'failed', error: action.error }));
    case 'cancel':
      return change(state, action.id, ['queued', 'uploading'], () => ({ status: 'canceled' }));
    case 'retry':
      return change(state, action.id, ['failed', 'canceled'], () => ({ status: 'queued', attempts: 0, progress: 0, error: null }));
  }
}

export type UploadFn = (item: UploadItem, ctx: { signal: AbortSignal; onProgress: (percent: number) => void }) => Promise<void>;

type Options = { upload: UploadFn; concurrency?: number; maxAttempts?: number };

export function createUploadQueue({ upload, concurrency = 3, maxAttempts = 3 }: Options) {
  let state = createQueueState(maxAttempts);
  let counter = 0;
  const listeners = new Set<() => void>();
  const controllers = new Map<string, AbortController>();

  function dispatch(action: QueueAction) {
    const next = uploadQueueReducer(state, action);
    if (next === state) return;
    state = next;
    listeners.forEach((l) => l());
  }

  function run(id: string) {
    const controller = new AbortController();
    controllers.set(id, controller);
    dispatch({ type: 'start', id });
    const item = state.items.find((i) => i.id === id);
    if (!item) return;
    const settle = (action: QueueAction) => {
      if (controller.signal.aborted) return; // canceled meanwhile: the answer is stale
      controllers.delete(id);
      dispatch(action);
      pump();
    };
    new Promise<void>((resolve) => resolve(upload(item, { signal: controller.signal, onProgress: (percent) => dispatch({ type: 'progress', id, percent }) }))).then(
      () => settle({ type: 'succeed', id }),
      (err: unknown) => settle({ type: 'fail', id, error: err instanceof Error ? err.message : 'Upload failed' }),
    );
  }

  function pump() {
    for (const item of state.items) {
      if (state.items.filter((i) => i.status === 'uploading').length >= concurrency) return;
      if (item.status === 'queued') run(item.id);
    }
  }

  return {
    add(files: { name: string; size: number }[]): string[] {
      const items = files.map((f) => ({ id: `u${++counter}`, name: f.name, size: f.size }));
      dispatch({ type: 'add', items });
      pump();
      return items.map((i) => i.id);
    },
    cancel(id: string) {
      controllers.get(id)?.abort();
      controllers.delete(id);
      dispatch({ type: 'cancel', id });
      pump();
    },
    retry(id: string) {
      dispatch({ type: 'retry', id });
      pump();
    },
    getState: () => state,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => void listeners.delete(listener);
    },
  };
}

export type UploadQueue = ReturnType<typeof createUploadQueue>;
