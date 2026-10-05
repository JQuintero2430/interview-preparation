import { createUploadQueue, createQueueState, uploadQueueReducer, type UploadFn, type UploadQueue } from './uploadQueue';

type Call = { id: string; attempt: number; signal: AbortSignal; onProgress: (n: number) => void; resolve: () => void; reject: (e: Error) => void };

function setup(opts: { concurrency?: number; maxAttempts?: number } = {}) {
  const calls: Call[] = [];
  const upload: UploadFn = (item, ctx) =>
    new Promise<void>((resolve, reject) => {
      calls.push({ id: item.id, attempt: item.attempts, signal: ctx.signal, onProgress: ctx.onProgress, resolve, reject });
    });
  return { queue: createUploadQueue({ upload, ...opts }), calls };
}

const flush = () => new Promise<void>((r) => setTimeout(r, 0));
const statuses = (q: UploadQueue) => q.getState().items.map((i) => i.status);
const files = (n: number) => Array.from({ length: n }, (_, i) => ({ name: `f${i + 1}.png`, size: 10 }));

test('runs at most `concurrency` uploads and starts the next one when a slot frees', async () => {
  const { queue, calls } = setup({ concurrency: 2 });
  queue.add(files(3));
  expect(statuses(queue)).toEqual(['uploading', 'uploading', 'queued']);
  expect(calls).toHaveLength(2);

  calls[0]?.resolve();
  await flush();
  expect(statuses(queue)).toEqual(['done', 'uploading', 'uploading']);
  expect(calls).toHaveLength(3);
});

test('progress is recorded and clamped to 0..100', () => {
  const { queue, calls } = setup();
  queue.add(files(1));
  calls[0]?.onProgress(40);
  expect(queue.getState().items[0]?.progress).toBe(40);
  calls[0]?.onProgress(250);
  expect(queue.getState().items[0]?.progress).toBe(100);
});

test('a failure retries automatically until maxAttempts, then the item is failed with its error', async () => {
  const { queue, calls } = setup({ maxAttempts: 2 });
  queue.add(files(1));
  calls[0]?.reject(new Error('network'));
  await flush();
  expect(statuses(queue)).toEqual(['uploading']);
  expect(calls).toHaveLength(2);
  expect(calls[1]?.attempt).toBe(2);

  calls[1]?.reject(new Error('network'));
  await flush();
  expect(queue.getState().items[0]).toMatchObject({ status: 'failed', attempts: 2, error: 'network' });
});

test('manual retry restarts a failed item with a fresh attempt count', async () => {
  const { queue, calls } = setup({ maxAttempts: 1 });
  const [id] = queue.add(files(1));
  calls[0]?.reject(new Error('boom'));
  await flush();
  expect(statuses(queue)).toEqual(['failed']);

  queue.retry(id ?? '');
  expect(statuses(queue)).toEqual(['uploading']);
  expect(calls).toHaveLength(2);
  expect(queue.getState().items[0]?.attempts).toBe(1);
});

test('canceling aborts the request, frees the slot, and a late success is ignored', async () => {
  const { queue, calls } = setup({ concurrency: 1 });
  const [first] = queue.add(files(2));
  queue.cancel(first ?? '');
  expect(calls[0]?.signal.aborted).toBe(true);
  expect(statuses(queue)).toEqual(['canceled', 'uploading']);
  expect(calls).toHaveLength(2);

  calls[0]?.resolve(); // the aborted request still resolves
  await flush();
  expect(statuses(queue)).toEqual(['canceled', 'uploading']);
});

test('the reducer ignores transitions that are not legal from the current state', () => {
  let state = uploadQueueReducer(createQueueState(), { type: 'add', items: [{ id: 'a', name: 'a', size: 1 }] });
  expect(uploadQueueReducer(state, { type: 'succeed', id: 'a' })).toBe(state); // queued cannot succeed
  expect(uploadQueueReducer(state, { type: 'retry', id: 'a' })).toBe(state);
  state = uploadQueueReducer(state, { type: 'cancel', id: 'a' });
  expect(uploadQueueReducer(state, { type: 'progress', id: 'a', percent: 50 })).toBe(state);
});

test('subscribers are notified on change and can unsubscribe', () => {
  const { queue } = setup();
  const listener = vi.fn();
  const unsubscribe = queue.subscribe(listener);
  queue.add(files(1));
  expect(listener).toHaveBeenCalled();
  const n = listener.mock.calls.length;
  unsubscribe();
  queue.add(files(1));
  expect(listener).toHaveBeenCalledTimes(n);
});
