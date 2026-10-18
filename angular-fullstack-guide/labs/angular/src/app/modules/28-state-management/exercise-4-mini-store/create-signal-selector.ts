import { computed, Signal, signal, untracked, WritableSignal } from '@angular/core';
import { MemoSelector, Select } from './create-selector';

/** The signal graph behind one selector: the last state in, the projected value out. */
interface LabM28SelectorGraph<S, R> {
  readonly source: WritableSignal<S>;
  readonly result: Signal<R>;
}

/**
 * Same contract as `createSelector`, but the memo is Angular's signal graph instead of a
 * hand-written `===` loop: each input is a `computed` over a source signal holding the last
 * state, and the projector is a `computed` over those inputs. A `computed` whose new value is
 * `Object.is`-equal to its old one does not notify, so the projector reruns only when an
 * input's result changed. Each signal holds one value: still one memo entry per selector.
 * @param args Input selectors, then the projector that combines their results.
 * @returns A `(state) => value` selector with a `projectorRuns()` counter.
 */
export function createSignalSelector<S, A, R>(
  a: Select<S, A>,
  projector: (a: A) => R,
): MemoSelector<S, R>;
export function createSignalSelector<S, A, B, R>(
  a: Select<S, A>,
  b: Select<S, B>,
  projector: (a: A, b: B) => R,
): MemoSelector<S, R>;
export function createSignalSelector<S, R>(...args: readonly unknown[]): MemoSelector<S, R> {
  const isSelect = (value: unknown): value is Select<S, unknown> => typeof value === 'function';
  const isProjector = (value: unknown): value is (...results: unknown[]) => R =>
    typeof value === 'function';
  const projector = args.at(-1);
  const inputs = args.slice(0, -1).filter(isSelect);
  if (!isProjector(projector) || inputs.length !== args.length - 1) {
    throw new TypeError('createSignalSelector takes input selectors and a projector last');
  }

  let graph: LabM28SelectorGraph<S, R> | undefined;
  let runs = 0;

  // Built on the first call because a signal needs an initial value and there is no state
  // before then; a sentinel value would widen every input's type.
  const build = (state: S): LabM28SelectorGraph<S, R> => {
    const source = signal(state);
    const results = inputs.map((input) => computed(() => input(source())));
    const result = computed(() => {
      runs++;
      return projector(...results.map((read) => read()));
    });
    return { source, result };
  };

  // untracked: the selector may be called inside a caller's computed, where writing to a
  // signal throws; it also keeps the caller depending on its own state, not on this graph.
  const selector = (state: S): R =>
    untracked(() => {
      const current = graph ?? build(state);
      graph = current;
      current.source.set(state);
      return current.result();
    });

  return Object.assign(selector, { projectorRuns: () => runs });
}
