// Exercise 46.1, variant b (the alternative): a pure reducer turns (state, event) into the next state and a list of
// effects; a small runner performs the effect (one API load) and turns its answer back into an event. Every
// decision is in `reduce`, which could be called without a fake API; the runner holds the only mutable fields.
import {
  farthestPage,
  isListed,
  orderedView,
  restoredFrom,
  snapshotOf,
  type CreateFeedSession,
  type LoadedPage,
  type Page,
  type Post,
  type Snapshot,
  type Status,
} from '../feed-session';

export interface State {
  readonly maxPages: number;
  readonly pages: readonly LoadedPage[];
  readonly live: readonly Post[];
  readonly buffer: readonly Post[];
  readonly dropped: readonly (string | null)[];
  readonly next: string | null;
  readonly status: Status;
  readonly anchorId: string | null;
  readonly seq: number;
}

export type Event =
  | { readonly type: 'loadRequested' }
  | { readonly type: 'pageLoaded'; readonly cursor: string | null; readonly page: Page }
  | { readonly type: 'pageFailed' }
  | { readonly type: 'liveArrived'; readonly post: Post }
  | { readonly type: 'newShown' }
  | { readonly type: 'anchorSet'; readonly id: string | null }
  | { readonly type: 'restored'; readonly snapshot: Snapshot; readonly cache: ReadonlyMap<string, Post> };

export interface Effect {
  readonly type: 'load';
  readonly cursor: string | null;
}

export interface Step {
  readonly state: State;
  readonly effects: readonly Effect[];
}

const stay = (state: State): Step => ({ state, effects: [] });

function trim(state: State): State {
  if (state.pages.length <= state.maxPages) return state;
  const far = farthestPage(state.pages, state.anchorId);
  const pages = state.pages.filter((page) => page !== far);
  return trim({ ...state, pages, dropped: [...state.dropped, far.cursor] });
}

function loaded(state: State, cursor: string | null, page: Page): State {
  const ids = new Set(page.items.map((post) => post.id));
  return trim({
    ...state,
    pages: [...state.pages, { cursor, seq: state.seq, posts: page.items }],
    buffer: state.buffer.filter((post) => !ids.has(post.id)),
    next: page.nextCursor,
    status: page.nextCursor === null ? 'ended' : 'idle',
    seq: state.seq + 1,
  });
}

export function reduce(state: State, event: Event): Step {
  switch (event.type) {
    case 'loadRequested':
      if (state.status === 'loading' || state.status === 'ended') return stay(state);
      return { state: { ...state, status: 'loading' }, effects: [{ type: 'load', cursor: state.next }] };
    case 'pageLoaded':
      return stay(loaded(state, event.cursor, event.page));
    case 'pageFailed':
      return stay({ ...state, status: 'failed' });
    case 'liveArrived': {
      const known = isListed(state.pages, state.live, event.post.id) || state.buffer.some((p) => p.id === event.post.id);
      return stay(known ? state : { ...state, buffer: [...state.buffer, event.post] });
    }
    case 'newShown':
      return stay({ ...state, live: [...state.live, ...state.buffer], buffer: [] });
    case 'anchorSet':
      return stay({ ...state, anchorId: event.id });
    case 'restored': {
      const restored = restoredFrom(event.snapshot, event.cache);
      return stay({
        ...state,
        ...restored,
        buffer: [],
        dropped: [],
        next: event.snapshot.next,
        status: event.snapshot.ended ? 'ended' : 'idle',
        anchorId: event.snapshot.anchorId,
        seq: restored.pages.length,
      });
    }
  }
}

export const createFeedSession: CreateFeedSession = (api, { maxPages }) => {
  let state: State = {
    maxPages,
    pages: [],
    live: [],
    buffer: [],
    dropped: [],
    next: null,
    status: 'idle',
    anchorId: null,
    seq: 0,
  };
  let inflight: Promise<void> = Promise.resolve();

  const dispatch = (event: Event): void => {
    const step = reduce(state, event);
    state = step.state;
    for (const effect of step.effects) inflight = run(effect);
  };

  const run = (effect: Effect): Promise<void> =>
    api.load(effect.cursor).then(
      (page) => dispatch({ type: 'pageLoaded', cursor: effect.cursor, page }),
      () => dispatch({ type: 'pageFailed' }),
    );

  return {
    loadNext() {
      dispatch({ type: 'loadRequested' });
      return inflight;
    },
    receiveLive: (post) => dispatch({ type: 'liveArrived', post }),
    showNew() {
      const count = state.buffer.length;
      dispatch({ type: 'newShown' });
      return count;
    },
    setAnchor: (id) => dispatch({ type: 'anchorSet', id }),
    view: () => orderedView(state.pages, state.live),
    pendingCount: () => state.buffer.length,
    status: () => state.status,
    droppedCursors: () => state.dropped,
    snapshot: () => snapshotOf(state.pages, state.live, state.anchorId, state.next, state.status === 'ended'),
    restore: (snapshot, cache) => dispatch({ type: 'restored', snapshot, cache }),
  };
};
