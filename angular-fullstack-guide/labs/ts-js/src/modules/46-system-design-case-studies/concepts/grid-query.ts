// Section 4 model: the query of a server-side data grid and a fake keyset server. Our model, after 41 §6's
// tiebreaker rule (a stable order needs a unique tiebreaker); not Spring Data's code. One canonical form of the
// query serves the URL and the cache key, and a cursor holds the last row's sort values, so "after this row" is exact.
// Only plain values are involved: no network, clock, randomness, router or storage. Strings compare by code units,
// because locale-aware collation is the real server's job (34 §2), not this fake's.

export interface Order {
  readonly id: string;
  readonly customer: string;
  readonly status: string;
  /** Creation time as a number the server sent; the model never reads a clock. */
  readonly createdAt: number;
  readonly total: number;
}

export type SortField = keyof Order;
export type Direction = 'asc' | 'desc';
type Cell = string | number;

export interface SortKey {
  readonly field: SortField;
  readonly direction: Direction;
}

export interface GridQuery {
  readonly filters: Readonly<Record<string, string>>;
  readonly sort: readonly SortKey[];
  readonly limit: number;
  /** The cursor of the last row seen, or `null` for the first page. */
  readonly after: string | null;
}

export interface KeysetPage {
  readonly items: readonly Order[];
  /** The cursor that continues after the last item, or `null` when no row follows. */
  readonly next: string | null;
}

export const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;
const TIEBREAKER: SortField = 'id';

// The allow-lists: a name outside them never leaves `fromParams` (41 §6: allow-list sort properties).
const SORT_FIELDS = new Map<string, SortField>([
  ['id', 'id'],
  ['customer', 'customer'],
  ['status', 'status'],
  ['createdAt', 'createdAt'],
  ['total', 'total'],
]);

const FILTERS = new Map<string, (row: Order, value: string) => boolean>([
  ['status', (row, value) => row.status === value],
  ['customer', (row, value) => row.customer === value],
  ['createdFrom', (row, value) => row.createdAt >= Number(value)],
  ['createdTo', (row, value) => row.createdAt <= Number(value)],
]);

const encode = (text: string): string => encodeURIComponent(text).replace(/%2C/g, ',');
const isCell = (value: unknown): value is Cell => typeof value === 'string' || typeof value === 'number';
const sign = (key: SortKey): number => (key.direction === 'asc' ? 1 : -1);

function compareCell(a: Cell, b: Cell): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return Number(String(a) > String(b)) - Number(String(a) < String(b));
}

/** The sort up to and including the id; with no id in it, the id is appended in the last key's direction. */
function withTiebreaker(sort: readonly SortKey[]): readonly SortKey[] {
  const at = sort.findIndex((key) => key.field === TIEBREAKER);
  if (at >= 0) return sort.slice(0, at + 1);
  return [...sort, { field: TIEBREAKER, direction: sort.at(-1)?.direction ?? 'asc' }];
}

/** One form per meaning: filters trimmed, emptied ones dropped and sorted by name; the sort ends with the id. */
export function canonical(query: GridQuery): GridQuery {
  const entries = Object.entries(query.filters)
    .map(([name, value]): [string, string] => [name, value.trim()])
    .filter(([, value]) => value !== '')
    .sort(([a], [b]) => compareCell(a, b));
  return { filters: Object.fromEntries(entries), sort: withTiebreaker(query.sort), limit: query.limit, after: query.after };
}

export function toParams(query: GridQuery): string {
  const { filters, sort, limit, after } = canonical(query);
  const cursor: [string, string][] = after === null ? [] : [['after', after]];
  const pairs: [string, string][] = [
    ...Object.entries(filters),
    ...sort.map((key): [string, string] => ['sort', `${key.field},${key.direction}`]),
    ['limit', String(limit)],
    ...cursor,
  ];
  return pairs.map(([name, value]) => `${name}=${encode(value)}`).join('&');
}

function parseSortKey(text: string): readonly SortKey[] {
  const [name = '', direction] = text.split(',');
  const field = SORT_FIELDS.get(name);
  return field !== undefined && (direction === 'asc' || direction === 'desc') ? [{ field, direction }] : [];
}

function parseLimit(text: string | null): number {
  const limit = Number(text);
  return Number.isInteger(limit) && limit >= 1 ? Math.min(limit, MAX_LIMIT) : DEFAULT_LIMIT;
}

/** Reads a URL's query string; names outside the allow-lists are dropped and a bad limit becomes the default. */
export function fromParams(search: string): GridQuery {
  const params = new URLSearchParams(search);
  const filters = Object.fromEntries([...params].filter(([name]) => FILTERS.has(name)));
  return canonical({
    filters,
    sort: params.getAll('sort').flatMap(parseSortKey),
    limit: parseLimit(params.get('limit')),
    after: params.get('after') || null,
  });
}

/** The cache key of one page: the request's method and its canonical URL, cursor included. */
export function cacheKey(query: GridQuery): string {
  return `GET /api/orders?${toParams(query)}`;
}

/** A new filter starts a new result, so the cursor is cleared; an emptied value removes the filter. */
export function withFilter(query: GridQuery, name: string, value: string): GridQuery {
  return canonical({ ...query, filters: { ...query.filters, [name]: value }, after: null });
}

/** A new sort starts a new result, so the cursor is cleared. */
export function withSort(query: GridQuery, sort: readonly SortKey[]): GridQuery {
  return canonical({ ...query, sort, after: null });
}

/** The row's values under each sort key, the id last: where the next page continues after this row. */
export function encodeCursor(row: Order, sort: readonly SortKey[]): string {
  return JSON.stringify(withTiebreaker(sort).map((key) => row[key.field]));
}

/** The values a cursor holds, or `null` when it is not one this sort could have produced. */
export function decodeCursor(cursor: string, sort: readonly SortKey[]): readonly Cell[] | null {
  try {
    const values: unknown = JSON.parse(cursor);
    if (!Array.isArray(values)) return null;
    return values.length === withTiebreaker(sort).length && values.every(isCell) ? values : null;
  } catch {
    return null;
  }
}

function zip<A, B>(as: readonly A[], bs: readonly B[]): [A, B][] {
  return as.flatMap((a, at): [A, B][] => {
    const b = bs[at];
    return b === undefined ? [] : [[a, b]];
  });
}

function compareRows(a: Order, b: Order, sort: readonly SortKey[]): number {
  for (const key of sort) {
    const result = sign(key) * compareCell(a[key.field], b[key.field]);
    if (result !== 0) return result;
  }
  return 0;
}

/** Negative before the position, positive after it, zero only for the row the position came from. */
function compareToPosition(row: Order, position: readonly Cell[], sort: readonly SortKey[]): number {
  for (const [key, cell] of zip(sort, position)) {
    const result = sign(key) * compareCell(row[key.field], cell);
    if (result !== 0) return result;
  }
  return 0;
}

/** Our fake server: the rows matching the filters, in sort order, `limit` of them after the cursor's row. */
export function keysetPage(rows: readonly Order[], query: GridQuery): KeysetPage {
  const { filters, sort, limit, after } = canonical(query);
  const position = after === null ? [] : decodeCursor(after, sort);
  if (position === null) throw new RangeError('Cursor does not match this sort');
  const matching = rows
    .filter((row) => Object.entries(filters).every(([name, value]) => FILTERS.get(name)?.(row, value) ?? true))
    .sort((a, b) => compareRows(a, b, sort));
  const rest = after === null ? matching : matching.filter((row) => compareToPosition(row, position, sort) > 0);
  const items = rest.slice(0, limit);
  const last = items.at(-1);
  return { items, next: last !== undefined && rest.length > items.length ? encodeCursor(last, sort) : null };
}
