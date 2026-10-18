import { Component, InjectionToken, computed, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ComponentStore } from '@ngrx/component-store';
import {
  type WritableStateSource,
  getState,
  patchState,
  signalState,
  signalStore,
  signalStoreFeature,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { LabM28GridComponentStore, type LabM28Row } from '../legacy/grid-component-store';

interface LabM28GridState {
  rows: readonly LabM28Row[];
  page: number;
  pageSize: number;
  paging: { total: number };
}

const LabM28GridStore = signalStore(
  { providedIn: 'root' },
  withState<LabM28GridState>({ rows: [], page: 0, pageSize: 2, paging: { total: 0 } }),
  withComputed(({ rows, page, pageSize }) => ({
    pageRows: computed(() => rows().slice(page() * pageSize(), (page() + 1) * pageSize())),
  })),
  withMethods((store) => ({
    load(rows: readonly LabM28Row[]): void {
      patchState(store, { rows, paging: { total: rows.length } });
    },
    next(): void {
      patchState(store, (s) => ({ page: s.page + 1 }));
    },
  })),
);

/** A fresh list of three rows for every test, so that no test shares a mutable fixture. */
function labM28ThreeRows(): LabM28Row[] {
  return [
    { id: 1, name: 'a' },
    { id: 2, name: 'b' },
    { id: 3, name: 'c' },
  ];
}

const LabM28ProtectedStore = signalStore({ providedIn: 'root' }, withState({ a: 1 }));
const LabM28UnprotectedStore = signalStore({ providedIn: 'root', protectedState: false }, withState({ a: 1 }));

/** Never called: it exists so the compiler checks the line below; `get()` of ComponentStore is protected (TS2445). */
function labM28ReadStateFromOutside(store: ComponentStore<{ n: number }>): number {
  // @ts-expect-error get() is protected and only accessible within ComponentStore and its subclasses (TS2445)
  return store.get().n;
}

/** Never called: a feature that names a member of a later feature does not compile (TS2339). */
function labM28NameALaterFeature(): void {
  // @ts-expect-error `later` is added by the feature below, so the first factory cannot see it (TS2339)
  signalStore(withMethods(({ later }) => ({ read: () => later() })), withComputed(() => ({ later: computed(() => 1) })));
}

/** Never called: patchState needs a WritableStateSource, which the instance of a default store is not (TS2345). */
function labM28PatchFromOutside(store: InstanceType<typeof LabM28ProtectedStore>): void {
  // @ts-expect-error a protected store is not a WritableStateSource (TS2345)
  patchState(store, { a: 2 });
}

/** The recorder of the hook tests; each test provides its own array. */
const LabM28HookLog = new InjectionToken<string[]>('LabM28HookLog');

/** A feature whose hooks write `init` and `destroy` into the provided log. */
function labM28WithLogHooks() {
  return signalStoreFeature(
    withHooks(() => {
      const log = inject(LabM28HookLog);
      return {
        onInit: () => log.push('init'),
        onDestroy: () => log.push('destroy'),
      };
    }),
  );
}

const LabM28ScopedHookStore = signalStore(withState({ n: 0 }), labM28WithLogHooks());
const LabM28RootHookStore = signalStore({ providedIn: 'root' }, withState({ n: 0 }), labM28WithLogHooks());

@Component({ selector: 'lab-m28-scoped-host', template: '', providers: [LabM28ScopedHookStore] })
class LabM28ScopedHost {
  readonly store = inject(LabM28ScopedHookStore);
}

@Component({ selector: 'lab-m28-root-host', template: '' })
class LabM28RootHost {
  readonly store = inject(LabM28RootHookStore);
}

describe('Section 8: ComponentStore and SignalStore', () => {
  it('Section 8: ComponentStore updater and selectSignal agree', () => {
    const store = new ComponentStore<{ n: number }>({ n: 1 });
    const seen: number[] = [];
    store.select((s) => s.n).subscribe((n) => seen.push(n));
    const n = store.selectSignal((s) => s.n);

    store.setState((s) => ({ n: s.n + 1 }));
    store.updater((s, k: number) => ({ n: s.n + k }))(5);

    expect(seen).toEqual([1, 2, 7]);
    expect(n()).toBe(7);
    expect(typeof labM28ReadStateFromOutside).toBe('function');
  });

  it('Section 8: the legacy ComponentStore subclass advances page after next()', () => {
    TestBed.configureTestingModule({ providers: [LabM28GridComponentStore] });
    const store = TestBed.inject(LabM28GridComponentStore);

    store.load(labM28ThreeRows());
    store.next();

    expect(store.page()).toBe(1);
  });

  it('Section 8: SignalStore state is not frozen in development', () => {
    const Store = signalStore(
      { providedIn: 'root' },
      withState<{ user: { name: string }; items: readonly string[] }>({ user: { name: 'a' }, items: [] }),
      withMethods((store) => ({
        setItems(items: readonly string[]): void {
          patchState(store, { items });
        },
      })),
    );
    const store = TestBed.inject(Store);
    const items = ['x'];

    store.setItems(items);
    getState(store).user.name = 'b';

    expect(Object.isFrozen(getState(store))).toBe(false);
    expect(Object.isFrozen(getState(store).user)).toBe(false);
    expect(Object.isFrozen(items)).toBe(false);
    expect(getState(store).user.name).toBe('b');
  });

  it('Section 8: a feature sees only the members of the features before it', () => {
    const Store = signalStore(
      { providedIn: 'root' },
      withState({ count: 2 }),
      withComputed(({ count }) => ({ double: computed(() => count() * 2) })),
      withMethods(({ double }) => ({ readDouble: () => double() })),
    );

    expect(TestBed.inject(Store).readDouble()).toBe(4);
    expect(typeof labM28NameALaterFeature).toBe('function');
  });

  it('Section 8: a root store runs onDestroy at injector teardown, not with a component', () => {
    const log: string[] = [];
    TestBed.configureTestingModule({ providers: [{ provide: LabM28HookLog, useValue: log }] });
    const fixture = TestBed.createComponent(LabM28RootHost);

    fixture.destroy();
    expect(log).toEqual(['init']);

    TestBed.resetTestingModule();
    expect(log).toEqual(['init', 'destroy']);
  });

  it('Section 8: a signal store exposes state, computed and methods as one object', () => {
    TestBed.configureTestingModule({});
    const store = TestBed.inject(LabM28GridStore);

    expect(Object.keys(store).sort()).toEqual(['load', 'next', 'page', 'pageRows', 'pageSize', 'paging', 'rows']);
    expect(TestBed.inject(LabM28GridStore)).toBe(store);

    store.load(labM28ThreeRows());
    store.next();

    expect(store.pageRows()).toEqual([{ id: 3, name: 'c' }]);
  });

  it('Section 8: nested state is exposed as deep signals', () => {
    const store = TestBed.inject(LabM28GridStore);
    store.load(labM28ThreeRows());
    const state = signalState({ count: 0, nested: { a: 1 } });

    expect(store.paging.total()).toBe(3);
    expect(typeof state).toBe('function');
    expect(state.nested.a()).toBe(1);
  });

  it('Section 8: patchState from outside does not compile unless protectedState is false', () => {
    const open = TestBed.inject(LabM28UnprotectedStore);
    const closed = TestBed.inject(LabM28ProtectedStore);

    patchState(open, { a: 3 });
    // The cast is the point of the test: protection is a type, so a cast writes straight through it.
    patchState(closed as unknown as WritableStateSource<{ a: number }>, { a: 2 });

    expect(open.a()).toBe(3);
    expect(closed.a()).toBe(2);
    expect(typeof labM28PatchFromOutside).toBe('function');
  });

  it('Section 8: withHooks runs onInit on creation and onDestroy with its injector', () => {
    const log: string[] = [];
    TestBed.configureTestingModule({ providers: [{ provide: LabM28HookLog, useValue: log }] });
    const first = TestBed.createComponent(LabM28ScopedHost);
    const second = TestBed.createComponent(LabM28ScopedHost);

    expect(first.componentInstance.store).not.toBe(second.componentInstance.store);
    expect(log).toEqual(['init', 'init']);

    first.destroy();
    expect(log).toEqual(['init', 'init', 'destroy']);

    second.destroy();
    expect(log).toEqual(['init', 'init', 'destroy', 'destroy']);
  });
});
