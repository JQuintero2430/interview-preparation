import { TestBed } from '@angular/core/testing';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  Store,
  createAction,
  createFeature,
  createFeatureSelector,
  createReducer,
  createSelector,
  on,
  props,
  provideState,
  provideStore,
} from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';

interface LabM28Todo {
  id: number;
  title: string;
}

interface LabM28TodosState {
  items: LabM28Todo[];
  filter: string;
  n: number;
}

const labM28SetN = createAction('[Todos Page] Set N', props<{ n: number }>());
const labM28SetFilter = createAction('[Todos Page] Set Filter', props<{ filter: string }>());

const labM28Initial: LabM28TodosState = {
  items: [
    { id: 1, title: 'a' },
    { id: 2, title: 'ab' },
  ],
  filter: '',
  n: 0,
};

const labM28TodosFeature = createFeature({
  name: 'todos',
  reducer: createReducer<LabM28TodosState>(
    labM28Initial,
    on(labM28SetN, (state, { n }) => ({ ...state, n })),
    on(labM28SetFilter, (state, { filter }) => ({ ...state, filter })),
  ),
});

function labM28Root(state: LabM28TodosState): { todos: LabM28TodosState } {
  return { todos: state };
}

describe('Section 5: selectors', () => {
  it("Section 5: the projector re-runs only when an input selector's result changes", () => {
    let runs = 0;
    const selectCount = createSelector(labM28TodosFeature.selectItems, (items) => {
      runs += 1;
      return items.length;
    });
    const st1 = labM28Root(labM28Initial);

    selectCount(st1);
    selectCount(st1);
    selectCount(labM28Root(st1.todos));
    expect(runs).toBe(1);
    selectCount(labM28Root({ ...st1.todos, items: [...st1.todos.items] }));

    expect(runs).toBe(2);
  });

  it('Section 5: a selector with props shares one cache across props', () => {
    let runs = 0;
    const selectById = createSelector(labM28TodosFeature.selectItems, (items: LabM28Todo[], selection: { id: number }) => {
      runs += 1;
      return items.find((todo) => todo.id === selection.id);
    });
    const state = labM28Root(labM28Initial);
    const first = { id: 1 };
    const runsAfter: number[] = [];

    for (const selection of [first, first, { id: 2 }, first, { id: 1 }]) {
      selectById(state, selection);
      runsAfter.push(runs);
    }

    expect(runsAfter).toEqual([1, 1, 2, 3, 4]);
  });

  it('Section 5: a factory selector created once per id keeps its memo', () => {
    let runs = 0;
    const selectByIdFactory = (id: number) =>
      createSelector(labM28TodosFeature.selectItems, (items) => {
        runs += 1;
        return items.find((todo) => todo.id === id);
      });
    const state = labM28Root(labM28Initial);

    const once = selectByIdFactory(1);
    once(state);
    once(state);
    once(labM28Root({ ...labM28Initial, n: 5 }));
    expect(runs).toBe(1);

    runs = 0;
    selectByIdFactory(1)(state);
    selectByIdFactory(1)(state);
    selectByIdFactory(1)(labM28Root({ ...labM28Initial, n: 5 }));
    expect(runs).toBe(3);
  });

  it('Section 5: a composed selector skips its projector when only an unrelated key changes', () => {
    TestBed.configureTestingModule({ providers: [provideStore(), provideState(labM28TodosFeature)] });
    const store = TestBed.inject(Store);
    let runs = 0;
    const selectVisible = createSelector(
      labM28TodosFeature.selectItems,
      labM28TodosFeature.selectFilter,
      (items, filter) => {
        runs += 1;
        return items.filter((todo) => todo.title.includes(filter));
      },
    );
    const visible = store.selectSignal(selectVisible);

    const before = visible();
    store.dispatch(labM28SetN({ n: 1 }));
    const afterUnrelated = visible();
    expect([afterUnrelated === before, runs]).toEqual([true, 1]);

    store.dispatch(labM28SetFilter({ filter: 'b' }));

    expect(visible()).toEqual([{ id: 2, title: 'ab' }]);
    expect(runs).toBe(2);
  });

  it('Section 5: selectSignal reads the current selector value', () => {
    TestBed.configureTestingModule({ providers: [provideStore(), provideState(labM28TodosFeature)] });
    const store = TestBed.inject(Store);
    let calls = 0;
    const countedN = (state: object): number => {
      calls += 1;
      return labM28TodosFeature.selectN(state);
    };
    const n = store.selectSignal(countedN);

    expect([n(), n()]).toEqual([0, 0]);
    expect(calls).toBe(1);

    store.dispatch(labM28SetN({ n: 5 }));
    expect(n()).toBe(5);
    expect(calls).toBe(2);

    const second = store.selectSignal(countedN);
    expect(second()).toBe(5);
    expect(calls).toBe(3);

    const fromObservable = TestBed.runInInjectionContext(() => toSignal(store.select(labM28TodosFeature.selectN)));
    expect(fromObservable()).toBe(5);
  });

  it('Section 5: MockStore overrides a selector value', () => {
    const selectA = createSelector(createFeatureSelector<number>('a'), (a) => a * 10);
    TestBed.configureTestingModule({
      providers: [provideMockStore({ initialState: { a: 1 }, selectors: [{ selector: selectA, value: 99 }] })],
    });
    const store = TestBed.inject(MockStore);
    const seen: number[] = [];
    const subscription = store.select(selectA).subscribe((value) => seen.push(value));

    store.overrideSelector(selectA, 5);
    store.refreshState();
    subscription.unsubscribe();

    expect(seen).toEqual([99, 5]);
  });
});
