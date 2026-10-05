// Undo/redo as a higher-order reducer: it wraps any pure reducer and keeps past and future snapshots.
// This only works because the inner reducer never mutates: every snapshot stays valid forever.
export type History<S> = {
  readonly past: readonly S[]; // oldest first
  readonly present: S;
  readonly future: readonly S[]; // next redo first
};

export type HistoryAction<A> = { type: 'undo' } | { type: 'redo' } | { type: 'apply'; action: A };

/** Builds an empty history whose present is `present`. */
export function initHistory<S>(present: S): History<S> {
  return { past: [], present, future: [] };
}

/**
 * Wraps `reducer` so that its states can be undone and redone.
 * `limit` caps how many past snapshots are kept; the oldest are dropped first.
 */
export function undoable<S, A>(reducer: (state: S, action: A) => S, limit = 50) {
  return function historyReducer(history: History<S>, action: HistoryAction<A>): History<S> {
    const { past, present, future } = history;
    switch (action.type) {
      case 'undo': {
        if (past.length === 0) return history;
        const previous = past[past.length - 1] as S; // safe: length checked above
        return { past: past.slice(0, -1), present: previous, future: [present, ...future] };
      }
      case 'redo': {
        if (future.length === 0) return history;
        const next = future[0] as S;
        return { past: [...past, present], present: next, future: future.slice(1) };
      }
      case 'apply': {
        const next = reducer(present, action.action);
        // A no-op must not create an undo step (and returning `history` lets React bail out).
        if (Object.is(next, present)) return history;
        return { past: [...past, present].slice(-limit), present: next, future: [] };
      }
    }
  };
}
