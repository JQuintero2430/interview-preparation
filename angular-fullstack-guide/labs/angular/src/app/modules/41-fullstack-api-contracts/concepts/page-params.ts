import { HttpParams } from '@angular/common/http';

export type SortDirection = 'asc' | 'desc';

/** One sort order: Spring Data's `sort` parameter reads it as `property,direction`. */
export interface SortOrder {
  readonly property: string;
  readonly direction: SortDirection;
}

/** What an offset-paged list asks for; `page` is zero-based, as Spring Data's `page` parameter is. */
export interface PageRequest {
  readonly page: number;
  readonly size: number;
  readonly sort: readonly SortOrder[];
  readonly filters: Readonly<Record<string, string | undefined>>;
}

/** Builds the query: `page`, `size`, one `sort` per order, and a named parameter per non-empty filter. */
export function toPageParams(request: PageRequest): HttpParams {
  let params = new HttpParams().set('page', request.page).set('size', request.size);
  for (const order of request.sort) {
    params = params.append('sort', `${order.property},${order.direction}`);
  }
  for (const [name, value] of Object.entries(request.filters)) {
    if (value !== undefined && value !== '') params = params.set(name, value);
  }
  return params;
}
