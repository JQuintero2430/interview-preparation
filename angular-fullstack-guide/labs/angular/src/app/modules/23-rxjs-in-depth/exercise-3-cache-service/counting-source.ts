import { Observable, defer, finalize } from 'rxjs';

/** How often a source was subscribed and how often it was torn down (completed, failed or unsubscribed). */
export interface Counts {
  subscriptions: number;
  teardowns: number;
}

/**
 * Wraps `produce` so that every subscription and every teardown is counted.
 * `produce` receives the number of the subscription (1, 2, ...), so a fake loader can answer differently per run.
 */
export function countingSource<T>(produce: (run: number) => Observable<T>): { source$: Observable<T>; counts: Counts } {
  const counts: Counts = { subscriptions: 0, teardowns: 0 };
  const source$ = defer(() => {
    counts.subscriptions++;
    return produce(counts.subscriptions);
  }).pipe(finalize(() => counts.teardowns++));
  return { source$, counts };
}
