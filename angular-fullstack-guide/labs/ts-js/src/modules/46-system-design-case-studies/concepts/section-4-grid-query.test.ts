// Section 4 claims, about our model (grid-query.ts), not Spring Data's: a query and its URL parameters agree on one
// canonical form, the cache key follows it, a new filter or sort clears the cursor, the sort ends with the id, and
// keyset pages over tied values neither repeat nor skip a row. Rows are plain values; no network, clock or router.
import { describe, expect, it } from 'vitest';
import { cacheKey, canonical, fromParams, keysetPage, toParams, withFilter, withSort, type GridQuery, type Order } from './grid-query';

const order = (id: string, createdAt: number, status = 'open'): Order => ({ id, customer: 'Ada', status, createdAt, total: 10 });
const ids = (rows: readonly Order[]): string[] => rows.map((row) => row.id);

// Four orders share the time 100, so a page of three splits a group of ties.
const rows: readonly Order[] = [
  order('o1', 100), order('o2', 100), order('o3', 100), order('o4', 100),
  order('o5', 90), order('o6', 90), order('o7', 80, 'closed'), order('o8', 80),
];

const base: GridQuery = { filters: { status: 'open' }, sort: [{ field: 'createdAt', direction: 'desc' }], limit: 3, after: null };

describe('Section 4: grid query', () => {
  it('Section 4: a query and its URL parameters round-trip to the same canonical query', () => {
    const query: GridQuery = { filters: { status: 'open', customer: ' Ada ' }, sort: [{ field: 'total', direction: 'asc' }], limit: 50, after: '[10,"o9"]' };
    expect(toParams(query)).toBe('customer=Ada&status=open&sort=total,asc&sort=id,asc&limit=50&after=%5B10,%22o9%22%5D');
    expect(fromParams(toParams(query))).toEqual(canonical(query));
  });

  it('Section 4: filters given in a different order produce one cache key', () => {
    const one = fromParams('status=open&customer=Ada&sort=total,asc');
    const other = fromParams('sort=total,asc&customer=Ada&status=open');
    expect(cacheKey(one)).toBe(cacheKey(other));
    expect(cacheKey(withFilter(one, 'status', 'closed'))).not.toBe(cacheKey(one));
    expect(cacheKey({ ...one, after: '[1,"o1"]' })).not.toBe(cacheKey(one));
  });

  it('Section 4: changing a filter or the sort clears the cursor', () => {
    const onPageThree: GridQuery = { ...base, after: '[80,"o8"]' };
    expect(withFilter(onPageThree, 'customer', 'Ada').after).toBeNull();
    expect(withSort(onPageThree, [{ field: 'total', direction: 'asc' }]).after).toBeNull();
    expect(withFilter(onPageThree, 'status', '').filters).toEqual({});
  });

  it('Section 4: the sort always ends with the id, so rows with equal sort values keep one order', () => {
    expect(canonical(base).sort).toEqual([{ field: 'createdAt', direction: 'desc' }, { field: 'id', direction: 'desc' }]);
    expect(canonical({ ...base, sort: [{ field: 'id', direction: 'asc' }, { field: 'total', direction: 'desc' }] }).sort).toEqual([{ field: 'id', direction: 'asc' }]);
    expect(ids(keysetPage([...rows].reverse(), base).items)).toEqual(ids(keysetPage(rows, base).items));
  });

  it('Section 4: keyset pages over tied values neither repeat nor skip a row', () => {
    let page = keysetPage(rows, base);
    const pages = [ids(page.items)];
    while (page.next !== null) {
      page = keysetPage(rows, { ...base, after: page.next });
      pages.push(ids(page.items));
    }
    expect(pages).toEqual([['o4', 'o3', 'o2'], ['o1', 'o6', 'o5'], ['o8']]);
  });

  it('Section 4: parameters outside the allow-list are dropped when a URL is read', () => {
    const query = fromParams('status=open&evil=1&sort=password,asc&sort=total,sideways&limit=9999');
    expect(query).toEqual({ filters: { status: 'open' }, sort: [{ field: 'id', direction: 'asc' }], limit: 100, after: null });
    expect(fromParams('limit=abc').limit).toBe(50);
  });
});
