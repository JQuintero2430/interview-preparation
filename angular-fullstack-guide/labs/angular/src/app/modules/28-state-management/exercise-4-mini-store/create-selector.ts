export type Select<S, R> = (state: S) => R;

export type MemoSelector<S, R> = Select<S, R> & {
  /** How many times the projector has run, for tests. */
  readonly projectorRuns: () => number;
};

export function createSelector<S, A, R>(
  a: Select<S, A>,
  projector: (a: A) => R,
): MemoSelector<S, R>;
export function createSelector<S, A, B, R>(
  a: Select<S, A>,
  b: Select<S, B>,
  projector: (a: A, b: B) => R,
): MemoSelector<S, R>;
export function createSelector<S, R>(...args: readonly unknown[]): MemoSelector<S, R> {
  const isSelect = (value: unknown): value is Select<S, unknown> => typeof value === 'function';
  const isProjector = (value: unknown): value is (...results: unknown[]) => R =>
    typeof value === 'function';
  const projector = args.at(-1);
  const inputs = args.slice(0, -1).filter(isSelect);
  if (!isProjector(projector) || inputs.length !== args.length - 1) {
    throw new TypeError('createSelector takes input selectors and a projector last');
  }

  let lastArguments: readonly unknown[] | undefined;
  let lastResult: R;
  let runs = 0;

  const selector = (state: S): R => {
    const results = inputs.map((input) => input(state));
    const previous = lastArguments;
    if (previous && results.every((value, i) => value === previous[i])) {
      return lastResult;
    }
    runs++;
    lastArguments = results;
    lastResult = projector(...results);
    return lastResult;
  };

  return Object.assign(selector, { projectorRuns: () => runs });
}
