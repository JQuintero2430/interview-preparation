import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { type Observable, map } from 'rxjs';
import { toPageParams } from '../../concepts/page-params';
import { ContractError, type ListPage, type ListQuery, type ListSource } from '../list-source';
import { type Order, checkOrders, member } from '../order.schema';

/** The two members of Spring Data's `PagedModel` page metadata this client reads. */
interface PageMetadata {
  readonly number: number;
  readonly totalPages: number;
}

function isPageMetadata(value: unknown): value is PageMetadata {
  return typeof member(value, 'number') === 'number' && typeof member(value, 'totalPages') === 'number';
}

/** `{ content, page }` to a list page; the next position is the next zero-based page number. */
function fromPagedModel(body: unknown): ListPage<Order> {
  const page = member(body, 'page');
  if (!isPageMetadata(page)) throw new ContractError('#/page');
  const items = checkOrders(member(body, 'content'), '#/content');
  return { items, next: page.number + 1 < page.totalPages ? String(page.number + 1) : null };
}

/** Variant a: offset pages, rendered as `PagedModel` by our Spring endpoint. */
@Injectable()
export class OffsetOrderSource implements ListSource<Order> {
  private readonly http = inject(HttpClient);

  page(query: ListQuery, position: string | null): Observable<ListPage<Order>> {
    const params = toPageParams({ ...query, page: Number(position ?? 0) });
    return this.http.get<unknown>('/api/orders', { params }).pipe(map(fromPagedModel));
  }
}
