import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ProductFilters, ProductSort, parseFilters, toQueryParams } from './product-filters';

/** Keys the filters own; every other parameter (such as `ref`) is copied through untouched. */
const OWNED_KEYS: ReadonlySet<string> = new Set(['q', 'page', 'sort']);

/** The current parameters minus the ones the filters own. */
function foreignParams(params: Params): Params {
  return Object.fromEntries(Object.entries(params).filter(([key]) => !OWNED_KEYS.has(key)));
}

/**
 * The same page as `ProductListPage`, wired the other way: it reads the query parameters
 * from `ActivatedRoute` instead of input binding, and writes a complete query string
 * instead of a merge navigation.
 */
@Component({
  selector: 'lab-m28-route-product-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <input #search aria-label="Search" [value]="filters().q" (input)="setQuery(search.value)" />
    <p class="summary">{{ filters().q }} · page {{ filters().page }} · {{ filters().sort }}</p>
    <button type="button" (click)="setPage(filters().page + 1)">Next</button>
  `,
})
export class LabM28RouteProductListPage {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // requireSync is safe: the route's queryParams replays its current value on subscribe.
  // This signal is a view of the URL, not a second copy: only a navigation changes it.
  private readonly params = toSignal(this.route.queryParams, { requireSync: true });

  /** The filters, derived from the URL and never stored. */
  protected readonly filters = computed(() => parseFilters(this.params()));

  /** Writes a new search text and returns to the first page. */
  setQuery(q: string): Promise<boolean> {
    return this.update({ q, page: 1 });
  }

  /** Writes a page number; page 1 removes the parameter. */
  setPage(page: number): Promise<boolean> {
    return this.update({ page });
  }

  /** Writes a sort order and returns to the first page. */
  setSort(sort: ProductSort): Promise<boolean> {
    return this.update({ sort, page: 1 });
  }

  // Rebuilds the whole query string instead of a merge with `null` entries: the foreign
  // parameters are copied from the route, so a default simply is not written back.
  private update(patch: Partial<ProductFilters>): Promise<boolean> {
    const next: ProductFilters = { ...this.filters(), ...patch };
    return this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { ...foreignParams(this.params()), ...toQueryParams(next) },
    });
  }
}
