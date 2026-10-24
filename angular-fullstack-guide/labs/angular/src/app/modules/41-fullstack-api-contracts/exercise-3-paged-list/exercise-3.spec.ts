import { type HttpParams, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, type TestRequest, provideHttpClientTesting } from '@angular/common/http/testing';
import type { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { OffsetOrderSource } from './a/offset-source';
import { CursorOrderSource } from './b/cursor-source';
import { CONTRACT_VIOLATION, type ListSource } from './list-source';
import { ORDER_SOURCE, OrderListStore } from './order-list.store';
import type { Order } from './order.schema';

type Variant = 'a' | 'b';
const VARIANTS: readonly Variant[] = ['a', 'b'];

/** A row of our fake orders table; `placedAt` may be a number, to break the contract on purpose. */
type Row = Omit<Order, 'placedAt'> & { readonly placedAt: string | number };

function row(id: number): Row {
  return { id, status: 'PLACED', placedAt: `2026-10-${10 + id}T09:00:00Z` };
}

/** Our fake orders table, newest first, as the server's `id,desc` sort returns it. */
const TABLE: readonly Row[] = [5, 4, 3, 2, 1].map(row);

/** Variant a's server: slices the table by zero-based page and renders `PagedModel`'s `{ content, page }`. */
function serveOffset(table: readonly Row[], params: HttpParams): object {
  const size = Number(params.get('size'));
  const number = Number(params.get('page'));
  const content = table.slice(number * size, (number + 1) * size);
  const totalPages = Math.ceil(table.length / size);
  return { content, page: { size, number, totalElements: table.length, totalPages } };
}

/** Variant b's server: the rows strictly after the `after` key (exclusive position), as our `{ items, next }`. */
function serveCursor(table: readonly Row[], params: HttpParams): object {
  const size = Number(params.get('size'));
  const after = params.get('after');
  const rest = table.filter((order) => after === null || order.id < Number(after));
  const items = rest.slice(0, size);
  return { items, next: rest.length > size ? String(items[size - 1]?.id) : null };
}

const SOURCES: Record<Variant, Type<ListSource<Order>>> = { a: OffsetOrderSource, b: CursorOrderSource };
const SERVE: Record<Variant, typeof serveOffset> = { a: serveOffset, b: serveCursor };

/** Rows seen twice after an insert between two page loads: offset pages shift, a keyset position does not. */
const EXPECTED_DUPLICATES: Record<Variant, number> = { a: 1, b: 0 };

/** The parameter that marks a first-page request in each contract. */
const FIRST_PAGE: Record<Variant, [string, string | null]> = { a: ['page', '0'], b: ['after', null] };

/** Where the item check points when the second row is bad. */
const BAD_ROW_POINTER: Record<Variant, string> = { a: '#/content/1', b: '#/items/1' };

const ids = (store: OrderListStore) => store.items().map((order) => order.id);

describe.each(VARIANTS)('Exercise 41.3 variant %s', (variant) => {
  let store: OrderListStore;
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ORDER_SOURCE, useClass: SOURCES[variant] },
        OrderListStore,
      ],
    });
    store = TestBed.inject(OrderListStore);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    controller.verify();
  });

  /** Answers the one open request from `table`, the way this variant's server would. */
  function respond(table: readonly Row[] = TABLE): TestRequest {
    const pending = controller.expectOne((req) => req.url === '/api/orders');
    pending.flush(SERVE[variant](table, pending.request.params));
    return pending;
  }

  it('sends the page size, the sort orders and the non-empty filters as query parameters', () => {
    store.setQuery({
      size: 2,
      sort: [
        { property: 'placedAt', direction: 'desc' },
        { property: 'id', direction: 'desc' },
      ],
      filters: { status: 'SHIPPED', customer: '' },
    });
    const { params } = respond().request;
    expect(params.get('size')).toBe('2');
    expect(params.getAll('sort')).toEqual(['placedAt,desc', 'id,desc']);
    expect(params.get('status')).toBe('SHIPPED');
    expect(params.has('customer')).toBe(false);
  });

  it("shows the first page's items and whether more exist", () => {
    store.setQuery({ size: 2 });
    respond();
    expect(ids(store)).toEqual([5, 4]);
    expect(store.hasMore()).toBe(true);
  });

  it('counts the items seen twice when a row is inserted between two page loads', () => {
    store.setQuery({ size: 2 });
    respond();
    store.loadMore();
    respond([row(6), ...TABLE]);
    expect(store.duplicates()).toBe(EXPECTED_DUPLICATES[variant]);
  });

  it('resets to the first page when the sort or a filter changes', () => {
    store.setQuery({ size: 2 });
    respond();
    store.loadMore();
    respond();
    expect(ids(store)).toEqual([5, 4, 3, 2]);
    store.setQuery({ filters: { status: 'PLACED' } });
    const [name, value] = FIRST_PAGE[variant];
    expect(respond().request.params.get(name)).toBe(value);
    expect(ids(store)).toEqual([5, 4]);
  });

  it('turns a page response that fails the item check into a contract error instead of rendering it', () => {
    store.setQuery({ size: 2 });
    respond([row(5), { ...row(4), placedAt: 1792400400000 }, row(3)]);
    expect(store.items()).toEqual([]);
    expect(store.error()?.type).toBe(CONTRACT_VIOLATION);
    expect(store.error()?.errors).toEqual([{ pointer: BAD_ROW_POINTER[variant], detail: 'Unexpected value' }]);
  });

  it('cancels the in-flight page request when a filter changes', () => {
    store.load();
    const first = controller.expectOne((req) => req.url === '/api/orders');
    store.setQuery({ filters: { status: 'SHIPPED' } });
    expect(first.cancelled).toBe(true);
    expect(respond().request.params.get('status')).toBe('SHIPPED');
    expect(ids(store)).toEqual([5, 4, 3, 2, 1]);
  });
});
