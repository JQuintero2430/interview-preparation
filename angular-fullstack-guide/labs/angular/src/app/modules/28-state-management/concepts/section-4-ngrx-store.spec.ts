import { inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Actions, createEffect, ofType, provideEffects } from '@ngrx/effects';
import {
  Store,
  createActionGroup,
  createFeature,
  createReducer,
  emptyProps,
  on,
  props,
  provideState,
  provideStore,
} from '@ngrx/store';
import { config, map } from 'rxjs';

interface LabM28TodosState {
  items: string[];
  n: number;
}

interface LabM28ListState {
  items: string[];
}

const LabM28TodosPage = createActionGroup({
  source: 'Todos Page',
  events: {
    'Add Todo': props<{ title: string }>(),
    'Clear All': emptyProps(),
    Load: emptyProps(),
    Loaded: props<{ n: number }>(),
  },
});

const labM28TodosFeature = createFeature({
  name: 'todos',
  reducer: createReducer<LabM28TodosState>(
    { items: [], n: 0 },
    on(LabM28TodosPage.addTodo, (state, { title }) => ({ ...state, items: [...state.items, title] })),
    on(LabM28TodosPage.clearAll, (state) => ({ ...state, items: [] })),
    on(LabM28TodosPage.loaded, (state, { n }) => ({ ...state, n })),
  ),
});

/**
 * A reducer that breaks the rule: it writes into the array it was given and returns the same state.
 * A factory, so each test gets an unfrozen initial state (the development checks freeze it).
 */
function labM28CreateMutatingFeature() {
  return createFeature({
    name: 'mutating',
    reducer: createReducer<LabM28ListState>(
      { items: [] },
      on(LabM28TodosPage.addTodo, (state, { title }) => {
        state.items.push(title);
        return state;
      }),
    ),
  });
}

const labM28LoadEffect = createEffect(
  (actions$ = inject(Actions)) =>
    actions$.pipe(
      ofType(LabM28TodosPage.load),
      map(() => LabM28TodosPage.loaded({ n: 7 })),
    ),
  { functional: true },
);

/** Runs the callback with RxJS's unhandled-error hook recording into an array, then restores the hook. */
async function recordUnhandledErrors(run: () => void): Promise<unknown[]> {
  const errors: unknown[] = [];
  const previous = config.onUnhandledError;
  config.onUnhandledError = (error) => errors.push(error);
  try {
    run();
    // RxJS reports an unhandled error from a timeout, so the hook fires after the synchronous code.
    await new Promise<void>((resolve) => setTimeout(resolve));
  } finally {
    config.onUnhandledError = previous;
  }
  return errors;
}

describe('Section 4: NgRx Store', () => {
  it('Section 4: createActionGroup derives camelCase creators and bracketed types', () => {
    expect(Object.keys(LabM28TodosPage)).toEqual(['addTodo', 'clearAll', 'load', 'loaded']);
    expect(LabM28TodosPage.addTodo({ title: 'a' })).toEqual({ title: 'a', type: '[Todos Page] Add Todo' });
    expect(LabM28TodosPage.addTodo.type).toBe('[Todos Page] Add Todo');
    expect(LabM28TodosPage.clearAll().type).toBe('[Todos Page] Clear All');
  });

  it('Section 4: a reducer handles an action and returns a new state', () => {
    const { reducer } = labM28TodosFeature;
    const before = reducer(undefined, { type: '[Test] Init' });

    const after = reducer(before, LabM28TodosPage.addTodo({ title: 'a' }));

    expect(after).not.toBe(before);
    expect(after.items).toEqual(['a']);
    expect(before.items).toEqual([]);
    expect(reducer(after, { type: '[Test] Unknown' })).toBe(after);
  });

  it('Section 4: createFeature returns the reducer and one selector per state key', () => {
    expect(Object.keys(labM28TodosFeature)).toEqual([
      'name',
      'reducer',
      'selectTodosState',
      'selectItems',
      'selectN',
    ]);
    expect(labM28TodosFeature.name).toBe('todos');
  });

  it("Section 4: an effect's action is reduced before dispatch returns", () => {
    TestBed.configureTestingModule({
      providers: [provideStore(), provideState(labM28TodosFeature), provideEffects({ loadEffect: labM28LoadEffect })],
    });
    const store = TestBed.inject(Store);
    const n = store.selectSignal(labM28TodosFeature.selectN);
    expect(n()).toBe(0);

    store.dispatch(LabM28TodosPage.load());

    expect(n()).toBe(7);
  });

  it('Section 4: in development the store state is frozen and a push throws', () => {
    TestBed.configureTestingModule({ providers: [provideStore(), provideState(labM28TodosFeature)] });
    const store = TestBed.inject(Store);

    store.dispatch(LabM28TodosPage.addTodo({ title: 'a' }));
    const state = store.selectSignal(labM28TodosFeature.selectTodosState)();

    expect(JSON.stringify(state)).toBe('{"items":["a"],"n":0}');
    expect(Object.isFrozen(state)).toBe(true);
    expect(Object.isFrozen(state.items)).toBe(true);
    expect(() => state.items.push('x')).toThrow(TypeError);
    expect(() => state.items.push('x')).toThrow('Cannot add property 1, object is not extensible');
  });

  it('Section 4: in development a reducer that mutates the state fails inside dispatch, not in the caller', async () => {
    const labM28MutatingFeature = labM28CreateMutatingFeature();
    TestBed.configureTestingModule({ providers: [provideStore(), provideState(labM28MutatingFeature)] });
    const store = TestBed.inject(Store);

    const errors = await recordUnhandledErrors(() => {
      expect(() => store.dispatch(LabM28TodosPage.addTodo({ title: 'b' }))).not.toThrow();
    });

    expect(errors).toHaveLength(1);
    expect(errors[0]).toBeInstanceOf(TypeError);
    expect(String(errors[0])).toContain('Cannot add property 0, object is not extensible');
  });

  it('Section 4: with the immutability checks off, an in-place reducer changes the state but notifies nobody', () => {
    const labM28MutatingFeature = labM28CreateMutatingFeature();
    TestBed.configureTestingModule({
      providers: [
        provideStore({}, { runtimeChecks: { strictStateImmutability: false, strictActionImmutability: false } }),
        provideState(labM28MutatingFeature),
      ],
    });
    const store = TestBed.inject(Store);
    const seen: string[][] = [];
    const subscription = store.select(labM28MutatingFeature.selectItems).subscribe((items) => seen.push([...items]));

    store.dispatch(LabM28TodosPage.addTodo({ title: 'b' }));
    store.dispatch(LabM28TodosPage.addTodo({ title: 'c' }));
    subscription.unsubscribe();

    expect(JSON.stringify(store.selectSignal(labM28MutatingFeature.selectMutatingState)())).toBe(
      '{"items":["b","c"]}',
    );
    expect(seen).toEqual([[]]);
  });
});
