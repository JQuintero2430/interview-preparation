import { ErrorHandler, computed, inject, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Actions, createEffect, ofType, provideEffects } from '@ngrx/effects';
import { createEntityAdapter } from '@ngrx/entity';
import { getState, patchState, signalState, signalStore, watchState, withMethods, withState } from '@ngrx/signals';
import { addEntity, updateEntity, withEntities } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import {
  Store,
  createAction,
  createActionGroup,
  createFeature,
  createReducer,
  createSelector,
  emptyProps,
  on,
  props,
  provideState,
  provideStore,
} from '@ngrx/store';
import { BehaviorSubject, Subject, distinctUntilChanged, map, tap } from 'rxjs';

// Output questions of module 28: each test body is the snippet of its question, with console.log where it asserts.
describe('Module 28 Output questions', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Q28.05 only the flag changes: the whole-state selectors re-run, the count stays', () => {
    const state = signal({ items: ['a'], filter: '', loading: false });
    const runs = { items: 0, count: 0, loading: 0 };
    const items = computed(() => {
      runs.items++;
      return state().items;
    });
    const count = computed(() => {
      runs.count++;
      return items().length;
    });
    const loading = computed(() => {
      runs.loading++;
      return state().loading;
    });
    const readAll = (): void => {
      items();
      count();
      loading();
    };

    readAll();
    state.update((s) => ({ ...s, loading: true }));
    readAll();

    expect(runs).toEqual({ items: 2, count: 1, loading: 2 });
    expect(loading()).toBe(true);
  });

  it('Q28.07 the BehaviorSubject select emits on a new items array only, not on a flag change or an in-place push', () => {
    interface ListState {
      items: string[];
      loading: boolean;
    }
    const subject = new BehaviorSubject<ListState>({ items: ['a'], loading: false });
    const select = <T>(pick: (state: ListState) => T) => subject.pipe(map(pick), distinctUntilChanged());
    const received: string[][] = [];
    select((s) => s.items).subscribe((items) => received.push([...items]));

    subject.next({ ...subject.getValue(), loading: true });
    subject.next({ ...subject.getValue(), items: ['a', 'b'] });
    subject.getValue().items.push('c');
    subject.next({ ...subject.getValue() });

    expect(received).toEqual([['a'], ['a', 'b']]);
    expect(subject.getValue().items).toEqual(['a', 'b', 'c']);
  });

  it('Q28.09 createActionGroup gives camelCase creators and bracketed types', () => {
    const TodosPage = createActionGroup({
      source: 'Todos Page',
      events: {
        'Add Todo': props<{ title: string }>(),
        'Clear All': emptyProps(),
      },
    });

    expect([Object.keys(TodosPage), TodosPage.addTodo({ title: 'a' }), TodosPage.clearAll().type]).toEqual([
      ['addTodo', 'clearAll'],
      { title: 'a', type: '[Todos Page] Add Todo' },
      '[Todos Page] Clear All',
    ]);
  });

  it('Q28.11 createFeature returns its name, its reducer, a feature selector and one selector per key', () => {
    interface TodosState {
      items: string[];
      n: number;
    }
    const feature = createFeature({
      name: 'todos',
      reducer: createReducer<TodosState>({ items: [], n: 0 }),
    });

    expect(Object.keys(feature)).toEqual(['name', 'reducer', 'selectTodosState', 'selectItems', 'selectN']);
  });

  it('Q28.12 the projector runs twice over four calls', () => {
    interface TodosState {
      items: string[];
      n: number;
    }
    const feature = createFeature({
      name: 'todos',
      reducer: createReducer<TodosState>({ items: [], n: 0 }),
    });
    let runs = 0;
    const selectCount = createSelector(feature.selectItems, (items) => {
      runs += 1;
      return items.length;
    });
    const st1 = { todos: { items: ['a'], n: 0 } };
    selectCount(st1);
    selectCount(st1);
    selectCount({ todos: st1.todos });
    selectCount({ todos: { ...st1.todos, items: [...st1.todos.items] } });

    expect(runs).toBe(2);
  });

  it('Q28.16 the effect is resubscribed after the error and still sees the third action', () => {
    const load = createAction('Load', props<{ n: number }>());
    const log: string[] = [];
    const throwOnSecond = createEffect(
      (actions$ = inject(Actions)) =>
        actions$.pipe(
          ofType(load),
          tap(({ n }) => {
            log.push(`fx ${n}`);
            if (n === 2) throw new Error('boom');
          }),
        ),
      { functional: true, dispatch: false },
    );
    const recordingHandler = { handleError: (error: Error) => log.push(`handled ${error.message}`) };
    TestBed.configureTestingModule({
      providers: [provideStore(), provideEffects({ throwOnSecond }), { provide: ErrorHandler, useValue: recordingHandler }],
    });
    const store = TestBed.inject(Store);
    store.dispatch(load({ n: 1 }));
    store.dispatch(load({ n: 2 }));
    store.dispatch(load({ n: 3 }));

    expect(log).toEqual(['fx 1', 'fx 2', 'handled boom', 'fx 3']);
  });

  it('Q28.18 the comparer sorts ids and updateOne keeps the untouched entity', () => {
    interface Order {
      id: number;
      title: string;
    }
    const adapter = createEntityAdapter<Order>({
      sortComparer: (a, b) => a.title.localeCompare(b.title),
    });
    const s1 = adapter.addMany(
      [
        { id: 2, title: 'b' },
        { id: 1, title: 'a' },
      ],
      adapter.getInitialState(),
    );
    const s2 = adapter.updateOne({ id: 2, changes: { title: 'c' } }, s1);

    expect([s1.ids, Object.keys(s1.entities), s2.entities[1] === s1.entities[1]]).toEqual([[1, 2], ['1', '2'], true]);
  });

  it('Q28.22 only the frozen NgRx state throws, and patchState from outside writes despite its type error', () => {
    const log: string[] = [];
    const addTodo = createAction('[Todos Page] Add Todo', props<{ title: string }>());
    const feature = createFeature({
      name: 'todos',
      reducer: createReducer<{ items: string[] }>(
        { items: [] },
        on(addTodo, (state, { title }) => ({ items: [...state.items, title] })),
      ),
    });
    const UserStore = signalStore({ providedIn: 'root' }, withState({ a: 1, user: { name: 'a' } }));
    TestBed.configureTestingModule({ providers: [provideStore(), provideState(feature)] });
    const ngrxStore = TestBed.inject(Store);
    ngrxStore.dispatch(addTodo({ title: 'a' }));
    const items = ngrxStore.selectSignal(feature.selectItems)();
    try {
      items.push('x');
    } catch (error) {
      log.push(String(error));
    }
    const store = TestBed.inject(UserStore);
    getState(store).user.name = 'b';
    // @ts-expect-error a store's state is protected outside it (TS2345)
    patchState(store, { a: 2 });
    log.push(JSON.stringify(getState(store)));

    expect(log).toEqual(['TypeError: Cannot add property 1, object is not extensible', '{"a":2,"user":{"name":"b"}}']);
  });

  it('Q28.24 a value, a signal and an Observable reach the pipeline, and creation outside a context throws NG0203', () => {
    const got: number[] = [];
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const RunStore = signalStore(
      { providedIn: 'root' },
      withMethods(() => ({ run: rxMethod<number>(tap((v) => got.push(v))) })),
    );
    const store = TestBed.inject(RunStore);
    const level = signal(5);
    store.run(1);
    const warningsAfterValue = warn.mock.calls.length;
    store.run(level);
    TestBed.tick();
    level.set(6);
    TestBed.tick();
    const feed = new Subject<number>();
    store.run(feed);
    feed.next(7);
    feed.next(8);

    expect([got, warningsAfterValue, warn.mock.calls.length]).toEqual([[1, 5, 6, 7, 8], 0, 2]);
    expect(() => rxMethod<number>(tap(() => undefined))).toThrow(
      /NG0203: rxMethod\(\) can only be used within an injection context/,
    );
  });

  it('Q28.25 two adds and a toggle leave ids, entityMap and entities in step', () => {
    interface Todo {
      id: number;
      title: string;
      done: boolean;
    }
    const TodoStore = signalStore(
      { providedIn: 'root' },
      withEntities<Todo>(),
      withMethods((store) => ({
        add(id: number, title: string): void {
          const todo: Todo = { id, title, done: false };
          patchState(store, addEntity(todo));
        },
        addLiteral(id: number): void {
          // @ts-expect-error the literal infers `done: false`, which is not the store's `done: boolean` (TS2345)
          patchState(store, addEntity({ id, title: 'x', done: false }));
        },
        toggle(id: number): void {
          patchState(store, updateEntity<Todo>({ id, changes: (todo) => ({ done: !todo.done }) }));
        },
      })),
    );
    const store = TestBed.inject(TodoStore);
    store.add(1, 'x');
    store.add(2, 'y');
    store.toggle(2);

    expect([store.ids(), JSON.stringify(store.entityMap()), store.entities()]).toEqual([
      [1, 2],
      '{"1":{"id":1,"title":"x","done":false},"2":{"id":2,"title":"y","done":true}}',
      [
        { id: 1, title: 'x', done: false },
        { id: 2, title: 'y', done: true },
      ],
    ]);
  });

  it('Q28.30 edit, edit, undo, edit leaves past [0, 1], present 3 and an empty future', () => {
    interface History {
      readonly past: readonly number[];
      readonly present: number;
      readonly future: readonly number[];
    }
    const edit = (h: History, next: number): History => ({ past: [...h.past, h.present], present: next, future: [] });
    const undo = (h: History): History => {
      const previous = h.past.at(-1);
      if (previous === undefined) {
        return h;
      }
      return { past: h.past.slice(0, -1), present: previous, future: [h.present, ...h.future] };
    };
    const redo = (h: History): History => {
      const [next, ...rest] = h.future;
      if (next === undefined) {
        return h;
      }
      return { past: [...h.past, h.present], present: next, future: rest };
    };
    const stacks = (h: History): [readonly number[], number, readonly number[]] => [h.past, h.present, h.future];

    const start: History = { past: [], present: 0, future: [] };
    const twoEdits = edit(edit(start, 1), 2);
    const undone = undo(twoEdits);
    const branched = edit(undone, 3);

    expect(stacks(twoEdits)).toEqual([[0, 1], 2, []]);
    expect(stacks(undone)).toEqual([[0], 1, [2]]);
    expect(stacks(branched)).toEqual([[0, 1], 3, []]);
    expect(redo(branched)).toBe(branched);
  });

  it('Q28.34 an unchanged and an unknown key re-run no computed, but the watcher runs for both', () => {
    const runs: string[] = [];
    const seen: string[] = [];
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const state = signalState({ a: 1, b: 2 });
    const doubledA = computed(() => {
      runs.push('a');
      return state.a() * 2;
    });
    TestBed.runInInjectionContext(() => watchState(state, () => seen.push('watcher')));
    doubledA();
    runs.length = 0;
    seen.length = 0;
    patchState(state, { a: 1 }); // unchanged
    patchState(state, { zz: 1 } as unknown as { a: number }); // unknown key; the cast gets it past the compiler
    doubledA();

    expect([runs, seen, warn.mock.calls.map((call) => call[0]), getState(state)]).toEqual([
      [],
      ['watcher', 'watcher'],
      ["@ngrx/signals: patchState was called with an unknown state slice 'zz'."],
      { a: 1, b: 2 },
    ]);
  });
});
