// Exercise 46.2: six criteria, each run over both variants (a: immutable functions, wrapped here in a holder so both
// share one interface; b: a small class). The rows and the "server" are our fakes: `keysetPage` of section 4's
// `grid-query.ts` serves the pages, and `serverTargets` stands in for a bulk endpoint that applies the filter when the
// request runs. No network, clock, timers or randomness.
import {
  canonical,
  keysetPage,
  withFilter,
  withSort,
  type GridQuery,
  type Order,
} from '../concepts/grid-query';
import * as a from './a/selection';
import { GridSelection } from './b/selection';
import type { BulkRequest, Selection, SelectionModel } from './selection';

const order = (id: string, status: string, createdAt: number): Order => ({ id, customer: 'acme', status, createdAt, total: 10 });
const ids = (page: { readonly items: readonly Order[] }): string[] => page.items.map((row) => row.id);

const ROWS = [
  order('o1', 'open', 10),
  order('o2', 'open', 20),
  order('o3', 'open', 30),
  order('o4', 'closed', 40),
  order('o5', 'open', 50),
  order('o6', 'closed', 60),
];
// Open orders, two per page: o1 o2 | o3 o5.
const OPEN_BY_TWO: GridQuery = withFilter({ filters: {}, sort: [], limit: 2, after: null }, 'status', 'open');

function modelA(): SelectionModel {
  let state: Selection = a.emptySelection;
  return {
    current: () => state,
    isSelected: (id) => a.isSelected(state, id),
    toggle: (id) => {
      state = a.toggle(state, id);
    },
    selectAllMatching: (query) => {
      state = a.selectAllMatching(query);
    },
    filterChanged: (query) => {
      state = a.filterChanged(state, query);
    },
    count: (total) => a.count(state, total),
    bulkRequest: (action) => a.bulkRequest(state, action),
  };
}

/** Our bulk endpoint: explicit ids as sent, or the rows matching the filter now, minus the exceptions. */
function serverTargets(rows: readonly Order[], request: BulkRequest): string[] {
  if ('ids' in request) return [...request.ids];
  const query: GridQuery = { filters: request.filters, sort: [], limit: rows.length, after: null };
  return ids(keysetPage(rows, query)).filter((id) => !request.except.includes(id));
}

describe.each(['a', 'b'])('Exercise 46.2, variant %s', (variant) => {
  const make = (): SelectionModel => (variant === 'a' ? modelA() : new GridSelection());

  it('keeps selected ids across page changes', () => {
    const model = make();
    const page1 = keysetPage(ROWS, OPEN_BY_TWO);
    const page2 = keysetPage(ROWS, { ...OPEN_BY_TWO, after: page1.next });
    expect([ids(page1), ids(page2)]).toEqual([['o1', 'o2'], ['o3', 'o5']]);
    model.toggle('o1');
    const before = model.current();
    model.toggle('o3');
    expect(model.current()).toEqual({ mode: 'ids', ids: new Set(['o1', 'o3']) });
    expect(model.isSelected('o1')).toBe(true);
    expect(before).toEqual({ mode: 'ids', ids: new Set(['o1']) });
  });

  it('switching to "all matching" records the current filter and clears the explicit ids', () => {
    const model = make();
    model.toggle('o1');
    model.selectAllMatching({ ...OPEN_BY_TWO, after: '["o2"]' });
    expect(model.current()).toEqual({ mode: 'all-matching', filter: canonical(OPEN_BY_TWO), except: new Set() });
  });

  it('deselecting a row in "all matching" adds it to the exceptions', () => {
    const model = make();
    model.selectAllMatching(OPEN_BY_TWO);
    model.toggle('o2');
    expect(model.current()).toEqual({ mode: 'all-matching', filter: canonical(OPEN_BY_TWO), except: new Set(['o2']) });
    expect(model.isSelected('o2')).toBe(false);
    expect(model.isSelected('o3')).toBe(true);
    model.toggle('o2');
    expect(model.isSelected('o2')).toBe(true);
  });

  it('changing the filter clears an "all matching" selection and keeps an explicit one', () => {
    const closed = withFilter(OPEN_BY_TWO, 'status', 'closed');
    const explicit = make();
    explicit.toggle('o1');
    explicit.filterChanged(closed);
    expect(explicit.current()).toEqual({ mode: 'ids', ids: new Set(['o1']) });

    const all = make();
    all.selectAllMatching(OPEN_BY_TWO);
    all.toggle('o2');
    all.filterChanged(withSort(OPEN_BY_TWO, [{ field: 'total', direction: 'desc' }]));
    expect(all.current().mode).toBe('all-matching');
    all.filterChanged(closed);
    expect(all.current()).toEqual({ mode: 'ids', ids: new Set() });
  });

  it('reports the selected count from the total and the exceptions, and says when the total is an estimate', () => {
    const model = make();
    model.toggle('o1');
    model.toggle('o2');
    expect(model.count({ value: 4, exact: true })).toEqual({ value: 2, exact: true, label: '2 selected' });
    model.selectAllMatching(OPEN_BY_TWO);
    model.toggle('o2');
    expect(model.count({ value: 4, exact: true })).toEqual({ value: 3, exact: true, label: '3 selected' });
    expect(model.count({ value: 1240, exact: false })).toEqual({ value: 1239, exact: false, label: 'about 1239 selected' });
  });

  it('builds a bulk request that sends the filter and exceptions for "all matching" and the ids otherwise', () => {
    const model = make();
    model.toggle('o3');
    model.toggle('o1');
    expect(model.bulkRequest('archive')).toEqual({ action: 'archive', ids: ['o1', 'o3'] });
    model.selectAllMatching(OPEN_BY_TWO);
    model.toggle('o5');
    const request = model.bulkRequest('archive');
    expect(request).toEqual({ action: 'archive', filters: { status: 'open' }, except: ['o5'] });
    // The request names the filter, so the server applies it when the request runs: a later open order is included.
    expect(serverTargets(ROWS, request)).toEqual(['o1', 'o2', 'o3']);
    expect(serverTargets([...ROWS, order('o7', 'open', 70)], request)).toEqual(['o1', 'o2', 'o3', 'o7']);
  });
});
