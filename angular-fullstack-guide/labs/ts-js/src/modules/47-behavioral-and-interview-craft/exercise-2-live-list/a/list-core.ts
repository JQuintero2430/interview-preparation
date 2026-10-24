// Exercise 47.2, variant a (the solution, our model): pure functions. `view` filters, sorts and pages; `withText` and
// `withSort` return the next query and go back to page 1.
import type { ListQuery, ListView, Row } from '../list-core';

function compareText(x: string, y: string): number {
  return x < y ? -1 : x > y ? 1 : 0;
}

const BY_KEY: Record<ListQuery['sort'], (x: Row, y: Row) => number> = {
  name: (x, y) => compareText(x.name, y.name),
  createdAt: (x, y) => x.createdAt - y.createdAt,
};

/** The chosen key in the chosen direction; equal keys end by id, ascending in both directions. */
function comparator(query: ListQuery): (x: Row, y: Row) => number {
  const sign = query.dir === 'asc' ? 1 : -1;
  return (x, y) => sign * BY_KEY[query.sort](x, y) || compareText(x.id, y.id);
}

export function view(rows: readonly Row[], query: ListQuery): ListView {
  const needle = query.text.trim().toLowerCase();
  const matched = rows.filter((row) => row.name.toLowerCase().includes(needle)).sort(comparator(query));
  const pageCount = Math.max(1, Math.ceil(matched.length / query.pageSize));
  const page = Math.min(query.page, pageCount);
  const start = (page - 1) * query.pageSize;
  return { items: matched.slice(start, start + query.pageSize), page, pageCount, total: matched.length };
}

export function withText(query: ListQuery, text: string): ListQuery {
  return { ...query, text, page: 1 };
}

export function withSort(query: ListQuery, sort: ListQuery['sort'], dir: ListQuery['dir']): ListQuery {
  return { ...query, sort, dir, page: 1 };
}
