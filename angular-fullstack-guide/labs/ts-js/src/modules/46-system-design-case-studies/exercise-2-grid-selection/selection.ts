// Exercise 46.2: the types and helpers both variants share (a: immutable functions over a `Selection`; b: a small class
// with the same operations). Our model, not a library's code; the query type and `canonical` come from section 4's
// `grid-query.ts`, imported read-only. Only plain values are involved: no network, clock, randomness or storage.
import { canonical, type GridQuery } from '../concepts/grid-query';

export type Filters = GridQuery['filters'];

/** Explicit ids, or every row matching a filter snapshot except the ids the user deselected. */
export type Selection =
  | { readonly mode: 'ids'; readonly ids: ReadonlySet<string> }
  | { readonly mode: 'all-matching'; readonly filter: GridQuery; readonly except: ReadonlySet<string> };

/** The server's total; `exact: false` means an estimate (section 4's contract). */
export interface Total {
  readonly value: number;
  readonly exact: boolean;
}

export interface SelectedCount {
  readonly value: number;
  readonly exact: boolean;
  readonly label: string;
}

export type BulkRequest =
  | { readonly action: string; readonly ids: readonly string[] }
  | { readonly action: string; readonly filters: Filters; readonly except: readonly string[] };

export interface SelectionModel {
  current(): Selection;
  isSelected(id: string): boolean;
  /** Selects or deselects one row, in either mode. */
  toggle(id: string): void;
  /** Records the query's filters (never its cursor) and drops the explicit ids. */
  selectAllMatching(query: GridQuery): void;
  /** Clears an "all matching" selection when the filters differ from its snapshot; keeps explicit ids. */
  filterChanged(query: GridQuery): void;
  count(total: Total): SelectedCount;
  bulkRequest(action: string): BulkRequest;
}

/** The filter snapshot: a canonical query without its cursor. */
export function snapshotOf(query: GridQuery): GridQuery {
  return canonical({ ...query, after: null });
}

export function sameFilters(a: GridQuery, b: GridQuery): boolean {
  return JSON.stringify(canonical(a).filters) === JSON.stringify(canonical(b).filters);
}

export function countOf(value: number, exact: boolean): SelectedCount {
  const selected = Math.max(0, value);
  return { value: selected, exact, label: `${exact ? '' : 'about '}${selected} selected` };
}
