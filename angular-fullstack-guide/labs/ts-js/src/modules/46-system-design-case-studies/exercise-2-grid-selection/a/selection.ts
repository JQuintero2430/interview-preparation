// Exercise 46.2, variant a (the solution): immutable functions. Every operation takes a `Selection` and returns the
// next one, so the caller keeps the old value for undo or comparison and nothing is shared by accident.
import type { GridQuery } from '../../concepts/grid-query';
import {
  countOf,
  sameFilters,
  snapshotOf,
  type BulkRequest,
  type SelectedCount,
  type Selection,
  type Total,
} from '../selection';

export const emptySelection: Selection = { mode: 'ids', ids: new Set<string>() };

function flip(set: ReadonlySet<string>, id: string): ReadonlySet<string> {
  const next = new Set(set);
  if (!next.delete(id)) next.add(id);
  return next;
}

export function toggle(selection: Selection, id: string): Selection {
  return selection.mode === 'ids'
    ? { ...selection, ids: flip(selection.ids, id) }
    : { ...selection, except: flip(selection.except, id) };
}

export function isSelected(selection: Selection, id: string): boolean {
  return selection.mode === 'ids' ? selection.ids.has(id) : !selection.except.has(id);
}

export function selectAllMatching(query: GridQuery): Selection {
  return { mode: 'all-matching', filter: snapshotOf(query), except: new Set<string>() };
}

export function filterChanged(selection: Selection, query: GridQuery): Selection {
  return selection.mode === 'all-matching' && !sameFilters(selection.filter, query) ? emptySelection : selection;
}

export function count(selection: Selection, total: Total): SelectedCount {
  return selection.mode === 'ids'
    ? countOf(selection.ids.size, true)
    : countOf(total.value - selection.except.size, total.exact);
}

export function bulkRequest(selection: Selection, action: string): BulkRequest {
  return selection.mode === 'ids'
    ? { action, ids: [...selection.ids].sort() }
    : { action, filters: selection.filter.filters, except: [...selection.except].sort() };
}
