import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { type PageRequest, toPageParams } from './page-params';

/** Our TypeScript view of the JSON Spring Data's `new PagedModel<>(page)` renders: `content` and `page`. */
interface PagedModel<T> {
  readonly content: readonly T[];
  readonly page: {
    readonly size: number;
    readonly number: number;
    readonly totalElements: number;
    readonly totalPages: number;
  };
}

/** Our cursor DTO: the items, and the key to send as `after`, or `null` on the last window. */
interface CursorWindow<T> {
  readonly items: readonly T[];
  readonly next: string | null;
}

/** What the list screen reads, whichever contract is behind it. */
interface OffsetPage<T> {
  readonly items: readonly T[];
  readonly pageIndex: number;
  readonly totalElements: number;
  readonly hasNext: boolean;
}

interface CursorPage<T> {
  readonly items: readonly T[];
  readonly nextCursor: string | null;
}

function fromPagedModel<T>(body: PagedModel<T>): OffsetPage<T> {
  return {
    items: body.content,
    pageIndex: body.page.number,
    totalElements: body.page.totalElements,
    hasNext: body.page.number + 1 < body.page.totalPages,
  };
}

function fromWindow<T>(body: CursorWindow<T>): CursorPage<T> {
  return { items: body.items, nextCursor: body.next };
}

interface OrderRow {
  readonly id: number;
}

const BASE_REQUEST: PageRequest = {
  page: 2,
  size: 20,
  sort: [
    { property: 'createdAt', direction: 'desc' },
    { property: 'id', direction: 'desc' },
  ],
  filters: {},
};

describe('Section 6: pagination, sorting and filtering', () => {
  let http: HttpClient;
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    controller.verify();
  });

  it('Section 6: page, size and two sort orders become page, size and repeated sort params', () => {
    http.get('/api/orders', { params: toPageParams(BASE_REQUEST) }).subscribe();
    const { request } = controller.expectOne((req) => req.url === '/api/orders');
    expect(request.params.get('page')).toBe('2');
    expect(request.params.get('size')).toBe('20');
    expect(request.params.getAll('sort')).toEqual(['createdAt,desc', 'id,desc']);
  });

  it('Section 6: an empty filter is left out of the query', () => {
    const filters = { status: 'SHIPPED', customer: '', note: undefined };
    const params = toPageParams({ ...BASE_REQUEST, page: 0, sort: [], filters });
    expect(params.keys()).toEqual(['page', 'size', 'status']);
    expect(params.get('page')).toBe('0');
    expect(params.get('status')).toBe('SHIPPED');
  });

  it('Section 6: a PagedModel response maps to items and page metadata', () => {
    let result: OffsetPage<OrderRow> | undefined;
    http
      .get<PagedModel<OrderRow>>('/api/orders', { params: toPageParams(BASE_REQUEST) })
      .subscribe((body) => (result = fromPagedModel(body)));
    controller.expectOne((req) => req.url === '/api/orders').flush({
      content: [{ id: 41 }, { id: 40 }],
      page: { size: 20, number: 2, totalElements: 47, totalPages: 3 },
    });
    expect(result).toEqual({ items: [{ id: 41 }, { id: 40 }], pageIndex: 2, totalElements: 47, hasNext: false });
  });

  it('Section 6: a cursor response maps to items and the next cursor', () => {
    const pages: CursorPage<OrderRow>[] = [];
    const params = { after: 'k-40', size: 2 };
    http.get<CursorWindow<OrderRow>>('/api/orders', { params }).subscribe((body) => pages.push(fromWindow(body)));
    const pending = controller.expectOne((req) => req.url === '/api/orders');
    expect(pending.request.params.get('after')).toBe('k-40');
    pending.flush({ items: [{ id: 39 }, { id: 38 }], next: 'k-38' });
    http
      .get<CursorWindow<OrderRow>>('/api/orders', { params: { after: 'k-38', size: 2 } })
      .subscribe((body) => pages.push(fromWindow(body)));
    controller.expectOne((req) => req.url === '/api/orders').flush({ items: [{ id: 37 }], next: null });
    expect(pages).toEqual([
      { items: [{ id: 39 }, { id: 38 }], nextCursor: 'k-38' },
      { items: [{ id: 37 }], nextCursor: null },
    ]);
  });
});
