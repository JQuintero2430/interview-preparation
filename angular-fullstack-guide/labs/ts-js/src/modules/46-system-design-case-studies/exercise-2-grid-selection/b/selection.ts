// Exercise 46.2, variant b (the alternative): a small class with the same operations. One mutable set means the
// explicit ids while no filter is held and the exceptions once one is; `current()` hands out copies, so a caller
// cannot change the state through a value it was given.
import type { GridQuery } from '../../concepts/grid-query';
import {
  countOf,
  sameFilters,
  snapshotOf,
  type BulkRequest,
  type SelectedCount,
  type Selection,
  type SelectionModel,
  type Total,
} from '../selection';

export class GridSelection implements SelectionModel {
  /** `null`: explicit ids. Otherwise the filter snapshot of an "all matching" selection. */
  private filter: GridQuery | null = null;
  private marked = new Set<string>();

  current(): Selection {
    const marked = new Set(this.marked);
    return this.filter === null
      ? { mode: 'ids', ids: marked }
      : { mode: 'all-matching', filter: this.filter, except: marked };
  }

  isSelected(id: string): boolean {
    return this.marked.has(id) === (this.filter === null);
  }

  toggle(id: string): void {
    if (!this.marked.delete(id)) this.marked.add(id);
  }

  selectAllMatching(query: GridQuery): void {
    this.filter = snapshotOf(query);
    this.marked = new Set<string>();
  }

  filterChanged(query: GridQuery): void {
    if (this.filter === null || sameFilters(this.filter, query)) return;
    this.filter = null;
    this.marked = new Set<string>();
  }

  count(total: Total): SelectedCount {
    return this.filter === null
      ? countOf(this.marked.size, true)
      : countOf(total.value - this.marked.size, total.exact);
  }

  bulkRequest(action: string): BulkRequest {
    const marked = [...this.marked].sort();
    return this.filter === null ? { action, ids: marked } : { action, filters: this.filter.filters, except: marked };
  }
}
