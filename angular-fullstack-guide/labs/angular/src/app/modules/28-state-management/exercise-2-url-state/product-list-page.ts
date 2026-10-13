import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { ProductFilters, ProductSort, parseFilters, toQueryParams } from './product-filters';

/** Keys the filters own: a `null` value removes the parameter on a merge navigation. */
const CLEARED = { q: null, page: null, sort: null };

@Component({
  selector: 'lab-m28-product-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <input aria-label="Search" [value]="filters().q" (input)="setQuery($any($event.target).value)" />
    <p class="summary">{{ filters().q }} · page {{ filters().page }} · {{ filters().sort }}</p>
    <button type="button" (click)="setPage(filters().page + 1)">Next</button>
  `,
})
export class ProductListPage {
  // Query parameters arrive as inputs through withComponentInputBinding().
  readonly q = input<string>();
  readonly page = input<string>();
  readonly sort = input<string>();

  private readonly router = inject(Router);

  /** The only copy of the filters: derived from the URL, never stored. */
  protected readonly filters = computed(() =>
    parseFilters({ q: this.q(), page: this.page(), sort: this.sort() }),
  );

  setQuery(q: string): Promise<boolean> {
    return this.update({ q, page: 1 });
  }

  setPage(page: number): Promise<boolean> {
    return this.update({ page });
  }

  setSort(sort: ProductSort): Promise<boolean> {
    return this.update({ sort, page: 1 });
  }

  private update(patch: Partial<ProductFilters>): Promise<boolean> {
    const next: ProductFilters = { ...this.filters(), ...patch };
    return this.router.navigate([], {
      queryParams: { ...CLEARED, ...toQueryParams(next) },
      queryParamsHandling: 'merge',
    });
  }
}
