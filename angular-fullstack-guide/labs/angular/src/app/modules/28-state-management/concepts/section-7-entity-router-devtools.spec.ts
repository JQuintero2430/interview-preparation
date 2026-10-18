import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { createEntityAdapter } from '@ngrx/entity';
import { getRouterSelectors, provideRouterStore, routerReducer } from '@ngrx/router-store';
import { Action, Store, provideStore } from '@ngrx/store';
import { REDUX_DEVTOOLS_EXTENSION, StoreDevtools, provideStoreDevtools } from '@ngrx/store-devtools';

interface LabM28Order {
  id: number;
  title: string;
}

@Component({ selector: 'lab-m28-orders', template: '' })
class LabM28OrdersComponent {}

/** A factory, so each test gets its own adapter (sorted by title, or in insertion order). */
function labM28CreateAdapter(sorted: boolean) {
  return createEntityAdapter<LabM28Order>(
    sorted ? { sortComparer: (a: LabM28Order, b: LabM28Order) => a.title.localeCompare(b.title) } : {},
  );
}

/** Counts every action whose type starts with `x`, so the state changes on each dispatch. */
function labM28CountReducer(state = 0, action: Action): number {
  return action.type.startsWith('x') ? state + 1 : state;
}

describe('Section 7: NgRx Entity, Router Store and Store DevTools', () => {
  it('Section 7: the adapter keeps ids sorted and entities keyed by id', () => {
    const orders: LabM28Order[] = [
      { id: 2, title: 'b' },
      { id: 1, title: 'a' },
    ];
    const sorted = labM28CreateAdapter(true);
    const unsorted = labM28CreateAdapter(false);

    const withComparer = sorted.addMany(orders, sorted.getInitialState());
    const withoutComparer = unsorted.addMany(orders, unsorted.getInitialState());

    expect(withComparer.ids).toEqual([1, 2]);
    expect(Object.keys(withComparer.entities)).toEqual(['1', '2']);
    expect(withoutComparer.ids).toEqual([2, 1]);
    expect(sorted.getSelectors().selectAll(withComparer)).toEqual([
      { id: 1, title: 'a' },
      { id: 2, title: 'b' },
    ]);
    expect(sorted.getSelectors().selectTotal(withComparer)).toBe(2);
  });

  it('Section 7: updateOne keeps the references of untouched entities', () => {
    const adapter = labM28CreateAdapter(true);
    const s1 = adapter.addMany(
      [
        { id: 2, title: 'b' },
        { id: 1, title: 'a' },
      ],
      adapter.getInitialState(),
    );

    const s2 = adapter.updateOne({ id: 2, changes: { title: 'c' } }, s1);
    const s3 = adapter.updateOne({ id: 1, changes: { title: 'z' } }, s2);

    expect(s2).not.toBe(s1);
    expect(s2.entities[1]).toBe(s1.entities[1]);
    expect(s2.entities[2]).not.toBe(s1.entities[2]);
    expect(s2.entities[2]?.title).toBe('c');
    expect(s3.ids).toEqual([2, 1]);
  });

  it('Section 7: router store selectors read the current query parameter', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'orders', component: LabM28OrdersComponent }]),
        provideStore({ router: routerReducer }),
        provideRouterStore(),
      ],
    });
    const store = TestBed.inject(Store);
    const { selectQueryParam } = getRouterSelectors();
    const seen: (string | string[] | undefined)[] = [];
    const subscription = store.select(selectQueryParam('q')).subscribe((q) => seen.push(q));
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/orders?q=abc');
    await harness.navigateByUrl('/orders?q=def');
    subscription.unsubscribe();

    expect(seen).toEqual([undefined, 'abc', 'def']);
  });

  it('Section 7: provideStoreDevtools provides without the browser extension', () => {
    TestBed.configureTestingModule({
      providers: [provideStore({ n: labM28CountReducer }), provideStoreDevtools({ maxAge: 3 })],
    });
    const store = TestBed.inject(Store);
    const devtools = TestBed.inject(StoreDevtools);
    let recorded: string[] = [];
    const lifted = devtools.liftedState.subscribe(({ actionsById, stagedActionIds }) => {
      recorded = stagedActionIds.map((id) => actionsById[id].action.type);
    });
    let emissions = 0;
    const subscription = store.select((state: object) => state).subscribe(() => emissions++);

    for (const type of ['x1', 'x2', 'x3', 'x4', 'x5']) store.dispatch({ type });
    subscription.unsubscribe();
    lifted.unsubscribe();

    expect(TestBed.inject(REDUX_DEVTOOLS_EXTENSION)).toBeNull();
    expect(emissions).toBe(6);
    expect(recorded).toEqual(['@ngrx/store/init', 'x4', 'x5']);
  });

  it('Section 7: provideStoreDevtools rejects a maxAge below two', () => {
    TestBed.configureTestingModule({
      providers: [provideStore({ n: labM28CountReducer }), provideStoreDevtools({ maxAge: 1 })],
    });

    expect(() => TestBed.inject(StoreDevtools)).toThrow("Devtools 'maxAge' cannot be less than 2, got 1");
  });
});
