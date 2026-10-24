// Exercise 47.2: seven criteria run over both variants (a: pure functions; b: a reducer with a `view` selector)
// through one small session wrapper. Fixed rows, no network, clock, randomness or locale.
import { view as viewA, withSort, withText } from './a/list-core';
import { reduce, view as viewB, type ListEvent, type ListState } from './b/list-core';
import type { ListQuery, ListView, Row } from './list-core';

// Ties: r1 and r3 share the name Anna; r3, r4 and r6 share createdAt 20.
const ROWS: readonly Row[] = [
  { id: 'r1', name: 'Anna', createdAt: 30 },
  { id: 'r2', name: 'Bruno', createdAt: 10 },
  { id: 'r3', name: 'Anna', createdAt: 20 },
  { id: 'r4', name: 'Carla', createdAt: 20 },
  { id: 'r5', name: 'Hannah', createdAt: 40 },
  { id: 'r6', name: 'Dana', createdAt: 20 },
  { id: 'r7', name: 'Evan', createdAt: 50 },
];

interface Session {
  text(value: string): void;
  sort(key: ListQuery['sort'], dir: ListQuery['dir']): void;
  page(target: number): void;
  view(): ListView;
}
type Start = (rows: readonly Row[], pageSize: number) => Session;

const firstQuery = (pageSize: number): ListQuery => ({ text: '', sort: 'name', dir: 'asc', page: 1, pageSize });
const ids = (list: ListView): string[] => list.items.map((row) => row.id);

const startA: Start = (rows, pageSize) => {
  let query = firstQuery(pageSize);
  return {
    text: (value) => {
      query = withText(query, value);
    },
    sort: (key, dir) => {
      query = withSort(query, key, dir);
    },
    page: (target) => {
      query = { ...query, page: target };
    },
    view: () => viewA(rows, query),
  };
};

const startB: Start = (rows, pageSize) => {
  let state: ListState = { rows, query: firstQuery(pageSize) };
  const send = (event: ListEvent): void => {
    state = reduce(state, event);
  };
  return {
    text: (text) => send({ type: 'setText', text }),
    sort: (sort, dir) => send({ type: 'setSort', sort, dir }),
    page: (page) => send({ type: 'setPage', page }),
    view: () => viewB(state),
  };
};

describe.each(['a', 'b'])('Exercise 47.2, variant %s', (variant) => {
  const start: Start = variant === 'a' ? startA : startB;

  it('filters by a trimmed, case-insensitive substring of the name', () => {
    const list = start(ROWS, 10);
    list.text('  ANN ');
    expect(ids(list.view())).toEqual(['r1', 'r3', 'r5']);
    list.text('   ');
    expect(list.view().total).toBe(7);
  });

  it('sorts by the chosen key and direction, breaking ties by id', () => {
    const list = start(ROWS, 10);
    list.sort('name', 'asc');
    expect(ids(list.view())).toEqual(['r1', 'r3', 'r2', 'r4', 'r6', 'r7', 'r5']);
    list.sort('name', 'desc');
    expect(ids(list.view())).toEqual(['r5', 'r7', 'r6', 'r4', 'r2', 'r1', 'r3']);
    list.sort('createdAt', 'asc');
    expect(ids(list.view())).toEqual(['r2', 'r3', 'r4', 'r6', 'r1', 'r5', 'r7']);
    list.sort('createdAt', 'desc');
    expect(ids(list.view())).toEqual(['r7', 'r5', 'r1', 'r3', 'r4', 'r6', 'r2']);
  });

  it('returns the requested page with the total and the page count', () => {
    const list = start(ROWS, 3);
    expect(ids(list.view())).toEqual(['r1', 'r3', 'r2']);
    list.page(2);
    expect(ids(list.view())).toEqual(['r4', 'r6', 'r7']);
    list.page(3);
    expect(list.view()).toEqual({ items: [ROWS[4]], page: 3, pageCount: 3, total: 7 });
  });

  it('an empty result returns no items, a total of 0, page 1 and a page count of 1', () => {
    const list = start(ROWS, 3);
    list.text('zzz');
    expect(list.view()).toEqual({ items: [], page: 1, pageCount: 1, total: 0 });
  });

  it('a page past the end after the filter narrows is moved to the last page', () => {
    const list = start(ROWS, 3);
    list.text('an');
    list.page(3);
    const narrowed = list.view();
    expect(ids(narrowed)).toEqual(['r7', 'r5']);
    expect([narrowed.page, narrowed.pageCount, narrowed.total]).toEqual([2, 2, 5]);
  });

  it('changing the text or the sort returns to page 1', () => {
    const list = start(ROWS, 3);
    list.page(2);
    expect(list.view().page).toBe(2);
    list.text('an');
    expect(list.view().page).toBe(1);
    list.page(2);
    list.sort('createdAt', 'desc');
    expect(list.view().page).toBe(1);
  });

  it('does not mutate the input rows', () => {
    const frozen = Object.freeze(ROWS.map((row) => Object.freeze({ ...row })));
    const list = start(frozen, 3);
    list.text('an');
    list.sort('createdAt', 'desc');
    expect(() => list.view()).not.toThrow();
    expect(frozen.map((row) => row.id)).toEqual(ROWS.map((row) => row.id));
  });
});
