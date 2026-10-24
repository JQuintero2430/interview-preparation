import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { type Observable, map } from 'rxjs';
import { toPageParams } from '../../concepts/page-params';
import { ContractError, type ListPage, type ListQuery, type ListSource } from '../list-source';
import { type Order, checkOrders, member } from '../order.schema';

function isCursor(value: unknown): value is string | null {
  return value === null || typeof value === 'string';
}

/** Our cursor DTO `{ items, next }` to a list page; `next` is the key to send as `after`. */
function fromWindow(body: unknown): ListPage<Order> {
  const next = member(body, 'next');
  if (!isCursor(next)) throw new ContractError('#/next');
  return { items: checkOrders(member(body, 'items'), '#/items'), next };
}

/** Variant b: cursor windows; the same size, sort and filters, with `after` instead of `page`. */
@Injectable()
export class CursorOrderSource implements ListSource<Order> {
  private readonly http = inject(HttpClient);

  page(query: ListQuery, position: string | null): Observable<ListPage<Order>> {
    const first = toPageParams({ ...query, page: 0 }).delete('page');
    const params = position === null ? first : first.set('after', position);
    return this.http.get<unknown>('/api/orders', { params }).pipe(map(fromWindow));
  }
}
