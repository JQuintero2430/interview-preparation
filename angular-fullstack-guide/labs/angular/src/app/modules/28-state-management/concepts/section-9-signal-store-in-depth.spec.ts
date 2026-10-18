import { computed, inject, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  patchState,
  signalStore,
  signalStoreFeature,
  type,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { addEntity, updateEntity, withEntities } from '@ngrx/signals/entities';
import { Events, eventGroup, injectDispatch, on, withEventHandlers, withReducer } from '@ngrx/signals/events';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { Subject, pipe, switchMap, tap } from 'rxjs';

type LabM28Status = 'idle' | 'loading' | 'loaded';

interface LabM28Todo {
  id: number;
  title: string;
  done: boolean;
}

/** A reusable feature: the state a request needs and a flag derived from it. */
function labM28WithRequestStatus() {
  return signalStoreFeature(
    withState<{ status: LabM28Status }>({ status: 'idle' }),
    withComputed(({ status }) => ({ isLoading: computed(() => status() === 'loading') })),
  );
}

/** A feature that needs `status` in its host: `type<>()` states the requirement for the compiler only. */
function labM28WithRetry() {
  return signalStoreFeature(
    { state: type<{ status: LabM28Status }>() },
    withMethods((store) => ({
      retry(): void {
        patchState(store, { status: 'loading' });
      },
    })),
  );
}

const LabM28BooksStore = signalStore(
  { providedIn: 'root' },
  withState<{ books: string[] }>({ books: [] }),
  labM28WithRequestStatus(),
  labM28WithRetry(),
);
const LabM28AuthorsStore = signalStore({ providedIn: 'root' }, labM28WithRequestStatus(), labM28WithRetry());

/** Never called: the requirement of `withRetry()` is checked in the order the features are listed (TS2769). */
function labM28HostWithoutStatus(): void {
  // @ts-expect-error the host has no `status` before withRetry() (TS2769)
  signalStore(withState({ count: 0 }), labM28WithRetry());
  // @ts-expect-error withRetry() is listed before the feature that adds `status` (TS2769)
  signalStore(labM28WithRetry(), labM28WithRequestStatus());
}

const LabM28TodoStore = signalStore(
  { providedIn: 'root' },
  withEntities<LabM28Todo>(),
  withMethods((store) => ({
    add(id: number, title: string): void {
      const todo: LabM28Todo = { id, title, done: false };
      patchState(store, addEntity(todo));
    },
    addLiteral(id: number): void {
      // @ts-expect-error the literal infers `done: false`, which is not the store's `done: boolean` (TS2345)
      patchState(store, addEntity({ id, title: 'x', done: false }));
    },
    toggle(id: number): void {
      patchState(store, updateEntity<LabM28Todo>({ id, changes: (todo) => ({ done: !todo.done }) }));
    },
  })),
);

const labM28Counter = eventGroup({ source: 'Counter Page', events: { increment: type<void>(), set: type<number>() } });

/** A counter store driven by events; its handler writes what it sees into the given log. */
function labM28CreateCounterStore(log: string[]) {
  return signalStore(
    { providedIn: 'root' },
    withState({ count: 0 }),
    withReducer(
      on(labM28Counter.increment, (_event, { count }) => ({ count: count + 1 })),
      on(labM28Counter.set, ({ payload }) => ({ count: payload })),
    ),
    withEventHandlers(({ count }, events = inject(Events)) => ({
      logIt$: events.on(labM28Counter.set).pipe(tap((e) => log.push(`${e.type} ${e.payload} count=${count()}`))),
    })),
  );
}

/** A store with one method, an rxMethod that records every number that reaches its pipeline. */
function labM28CreateRunStore(got: number[]) {
  return signalStore(
    { providedIn: 'root' },
    withMethods(() => ({ run: rxMethod<number>(tap((v) => got.push(v))) })),
  );
}

describe('Section 9: SignalStore in depth', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Section 9: a custom feature adds state and computed to any store', () => {
    const books = TestBed.inject(LabM28BooksStore);
    const authors = TestBed.inject(LabM28AuthorsStore);

    expect(Object.keys(books).sort()).toEqual(['books', 'isLoading', 'retry', 'status']);
    expect(Object.keys(authors).sort()).toEqual(['isLoading', 'retry', 'status']);

    books.retry();

    expect(books.status()).toBe('loading');
    expect(books.isLoading()).toBe(true);
    expect(authors.status()).toBe('idle');
    expect(authors.isLoading()).toBe(false);
    expect(typeof labM28HostWithoutStatus).toBe('function');
  });

  it('Section 9: events reduce state and reach event handlers', () => {
    const log: string[] = [];
    const store = TestBed.inject(labM28CreateCounterStore(log));
    const dispatch = TestBed.runInInjectionContext(() => injectDispatch(labM28Counter));

    dispatch.increment();
    dispatch.increment();
    dispatch.set(10);

    expect(store.count()).toBe(10);
    expect(labM28Counter.increment.type).toBe('[Counter Page] increment');
    expect(log).toEqual(['[Counter Page] set 10 count=10']);
  });

  it('Section 9: rxMethod accepts a value, a signal and an Observable', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const got: number[] = [];
    const store = TestBed.inject(labM28CreateRunStore(got));
    const level = signal(5);

    store.run(1);
    expect(warn).not.toHaveBeenCalled();

    store.run(level);
    TestBed.tick();
    level.set(6);
    TestBed.tick();
    const feed = new Subject<number>();
    store.run(feed);
    feed.next(7);
    feed.next(8);

    expect(got).toEqual([1, 5, 6, 7, 8]);
    // The test body is not an injection context, so a signal and an Observable each log the deprecation warning once.
    expect(warn).toHaveBeenCalledTimes(2);
  });

  it('Section 9: rxMethod created outside an injection context throws NG0203', () => {
    expect(() => rxMethod<number>(tap(() => undefined))).toThrow(/NG0203: rxMethod\(\) can only be used within an injection context/);
  });

  it('Section 9: rxMethod with switchMap keeps only the latest inner request', () => {
    const requests = new Map<number, Subject<string>>();
    const answers: string[] = [];
    const load = TestBed.runInInjectionContext(() =>
      rxMethod<number>(
        pipe(
          switchMap((id) => {
            const request = new Subject<string>();
            requests.set(id, request);
            return request;
          }),
          tap((answer) => answers.push(answer)),
        ),
      ),
    );

    load(1);
    load(2);
    requests.get(2)?.next('answer 2');
    requests.get(1)?.next('late answer 1');

    expect(answers).toEqual(['answer 2']);
  });

  it('Section 9: withEntities keeps ids, entityMap and entities in step', () => {
    const store = TestBed.inject(LabM28TodoStore);

    store.add(1, 'x');
    store.add(2, 'y');
    store.add(1, 'duplicate');
    store.toggle(2);

    const first: LabM28Todo = { id: 1, title: 'x', done: false };
    const second: LabM28Todo = { id: 2, title: 'y', done: true };
    expect(store.ids()).toEqual([1, 2]);
    expect(store.entityMap()).toEqual({ 1: first, 2: second });
    expect(store.entities()).toEqual([first, second]);
    expect(typeof store.addLiteral).toBe('function');
  });
});
