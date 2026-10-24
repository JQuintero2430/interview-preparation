// Exercise 47.2, variant b (the alternative, our model): the rows and the query live in one state, a reducer changes
// the query on three events, and a `view` selector builds the list from the state in three small stages.
import type { ListQuery, ListView, Row } from '../list-core';

export interface ListState {
  readonly rows: readonly Row[];
  readonly query: ListQuery;
}

export type ListEvent =
  | { readonly type: 'setText'; readonly text: string }
  | { readonly type: 'setSort'; readonly sort: ListQuery['sort']; readonly dir: ListQuery['dir'] }
  | { readonly type: 'setPage'; readonly page: number };

export function reduce(state: ListState, event: ListEvent): ListState {
  switch (event.type) {
    case 'setText':
      return { ...state, query: { ...state.query, text: event.text, page: 1 } };
    case 'setSort':
      return { ...state, query: { ...state.query, sort: event.sort, dir: event.dir, page: 1 } };
    case 'setPage':
      return { ...state, query: { ...state.query, page: event.page } };
  }
}

function matching(rows: readonly Row[], text: string): Row[] {
  const needle = text.trim().toLowerCase();
  return rows.filter((row) => row.name.toLowerCase().includes(needle));
}

function compareId(x: Row, y: Row): number {
  return x.id < y.id ? -1 : x.id > y.id ? 1 : 0;
}

function compareKey(x: Row, y: Row, sort: ListQuery['sort']): number {
  if (sort === 'createdAt') return x.createdAt - y.createdAt;
  return x.name < y.name ? -1 : x.name > y.name ? 1 : 0;
}

function ordered(rows: readonly Row[], query: ListQuery): Row[] {
  const sign = query.dir === 'asc' ? 1 : -1;
  return [...rows].sort((x, y) => sign * compareKey(x, y, query.sort) || compareId(x, y));
}

function pageOf(rows: readonly Row[], query: ListQuery): ListView {
  const pageCount = Math.max(1, Math.ceil(rows.length / query.pageSize));
  const page = Math.min(query.page, pageCount);
  const start = (page - 1) * query.pageSize;
  return { items: rows.slice(start, start + query.pageSize), page, pageCount, total: rows.length };
}

export function view(state: ListState): ListView {
  return pageOf(ordered(matching(state.rows, state.query.text), state.query), state.query);
}
