import { computed } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { getState, patchState, signalState, watchState } from '@ngrx/signals';
import { State, Store, createAction, createFeature, createReducer, on, props, provideState, provideStore } from '@ngrx/store';

interface LabM28PairState {
  a: number;
  b: number;
}

interface LabM28RootState {
  pair: LabM28PairState;
}

const labM28Add = createAction('[Section 12] Add', props<{ n: number }>());
const labM28AddB = createAction('[Section 12] Add B', props<{ n: number }>());
const labM28Other = createAction('[Section 12] Other');

const labM28PairFeature = createFeature({
  name: 'pair',
  reducer: createReducer<LabM28PairState>(
    { a: 0, b: 0 },
    on(labM28Add, (state, { n }) => ({ ...state, a: state.a + n })),
    on(labM28AddB, (state, { n }) => ({ ...state, b: state.b + n })),
  ),
});

/** Provides a store holding the pair feature; returns the Store and its State, the BehaviorSubject the reducer feeds. */
function labM28Setup() {
  TestBed.configureTestingModule({ providers: [provideStore(), provideState(labM28PairFeature)] });
  return { store: TestBed.inject(Store), state: TestBed.inject(State) };
}

describe('Section 12: under the hood', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Section 12: a dispatch from inside a state subscriber is reduced after the current emission finishes', () => {
    const { store, state } = labM28Setup();
    const log: string[] = [];
    const subscription = state.subscribe(({ pair }: LabM28RootState) => {
      log.push(`state a=${pair.a} b=${pair.b}`);
      if (pair.a === 1 && pair.b === 0) {
        store.dispatch(labM28AddB({ n: 1 }));
        log.push('inner dispatch returned');
      }
    });
    log.length = 0;

    store.dispatch(labM28Add({ n: 1 }));
    subscription.unsubscribe();

    expect(log).toEqual(['state a=1 b=0', 'inner dispatch returned', 'state a=1 b=1']);
  });

  it('Section 12: one dispatch produces one state emission and one selector emission', () => {
    const { store, state } = labM28Setup();
    const log: string[] = [];
    const subscriptions = [
      state.subscribe(() => log.push('state')),
      store.select(labM28PairFeature.selectA).subscribe((a) => log.push(`a=${a}`)),
    ];
    log.length = 0;

    store.dispatch(labM28Add({ n: 2 }));
    log.push(`returned a=${store.selectSignal(labM28PairFeature.selectA)()}`);
    // The reducer keeps the state for this action: State emits again, the selector's distinctUntilChanged drops it.
    store.dispatch(labM28Other());
    subscriptions.forEach((subscription) => subscription.unsubscribe());

    expect(log).toEqual(['state', 'a=2', 'returned a=2', 'state']);
  });

  it('Section 12: patchState sets only the keys whose values changed', () => {
    const runs: string[] = [];
    const base = signalState({ a: 1, b: 2 });
    const doubledA = computed(() => {
      runs.push('a');
      return base.a() * 2;
    });
    const doubledB = computed(() => {
      runs.push('b');
      return base.b() * 2;
    });
    doubledA();
    doubledB();
    runs.length = 0;

    patchState(base, { a: 1 });
    patchState(base, { b: 3 });
    doubledA();
    doubledB();

    expect(runs).toEqual(['b']);
    expect([doubledA(), doubledB()]).toEqual([2, 6]);
  });

  it('Section 12: patchState warns about an unknown key and ignores it', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const base = signalState({ a: 1, b: 2 });

    // The type of patchState rejects the unknown key; the cast lets it reach the runtime check.
    patchState(base, { zz: 1 } as unknown as { a: number });

    expect(warn.mock.calls.map((call) => call[0])).toEqual([
      "@ngrx/signals: patchState was called with an unknown state slice 'zz'.",
    ]);
    expect(getState(base)).toEqual({ a: 1, b: 2 });
  });

  it('Section 12: state watchers run on every patchState call, changed or not', () => {
    const seen: string[] = [];
    const base = signalState({ a: 1, b: 2 });
    TestBed.runInInjectionContext(() => watchState(base, (state) => seen.push(JSON.stringify(state))));
    // watchState also runs the watcher once when it is registered.
    expect(seen).toEqual(['{"a":1,"b":2}']);
    seen.length = 0;

    patchState(base, { a: 1 });
    patchState(base, { b: 3 });

    expect(seen).toEqual(['{"a":1,"b":2}', '{"a":1,"b":3}']);
  });
});
