import { Component, computed, inject, Injectable, Pipe, type PipeTransform, signal } from '@angular/core';

/** One catalog entry of the exercise. */
export interface LabM31Product {
  readonly id: number;
  readonly name: string;
  readonly price: number;
}

/** How many products the exercise lists. */
export const LAB_M31_PRODUCT_COUNT = 5000;

/** Prices repeat in a cycle of 1 to 5, so the visible total depends on which products match. */
const PRICE_CYCLE = 5;

/**
 * Lab instrumentation: how many times the filter and the total ran.
 * A test reads it; application code would not keep such counts.
 */
@Injectable({ providedIn: 'root' })
export class LabM31ListRuns {
  filter = 0;
  total = 0;

  /** Sets both counts back to zero, so a test counts only what happens next. */
  reset(): void {
    this.filter = 0;
    this.total = 0;
  }
}

/**
 * Builds `count` products named `Product 0`, `Product 1`, …, priced from 1 to 5.
 * @param count how many products to build
 */
export function makeProducts(count: number): LabM31Product[] {
  return Array.from({ length: count }, (_, id) => ({ id, name: `Product ${id}`, price: (id % PRICE_CYCLE) + 1 }));
}

/**
 * The products whose name contains the query.
 * @param products the products to filter
 * @param query the text a name must contain; empty keeps every product
 */
export function filterProducts(products: readonly LabM31Product[], query: string): LabM31Product[] {
  return products.filter((product) => product.name.includes(query));
}

/**
 * A copy of the products ordered by id.
 * @param products the products to order; the input is not changed
 * @param ascending true for the lowest id first, false for the highest
 */
export function sortProducts(products: readonly LabM31Product[], ascending: boolean): LabM31Product[] {
  const direction = ascending ? 1 : -1;
  return [...products].sort((a, b) => (a.id - b.id) * direction);
}

/**
 * The sum of the prices.
 * @param products the products to add up
 */
export function sumPrices(products: readonly LabM31Product[]): number {
  return products.reduce((sum, product) => sum + product.price, 0);
}

/**
 * The solution: one `computed` filters, a second sorts its result and a third sums it,
 * so a change to an unrelated signal runs none of them and `track product.id` keeps each row's node.
 */
@Component({
  selector: 'lab-m31-product-list',
  template: `
    <p>Clock {{ clock() }}</p>
    <p class="total">Total: {{ total() }}</p>
    <ul>
      @for (product of visible(); track product.id) {
        <li>{{ product.name }}</li>
      }
    </ul>
  `,
})
export class LabM31ProductList {
  private readonly runs = inject(LabM31ListRuns);
  private readonly products = signal(makeProducts(LAB_M31_PRODUCT_COUNT));
  readonly query = signal('');
  readonly ascending = signal(true);
  readonly clock = signal(0);

  // The filter is its own computed so a re-sort reuses its result instead of scanning 5,000 products again.
  private readonly matches = computed(() => {
    this.runs.filter++;
    return filterProducts(this.products(), this.query());
  });
  protected readonly visible = computed(() => sortProducts(this.matches(), this.ascending()));
  protected readonly total = computed(() => {
    this.runs.total++;
    return sumPrices(this.matches());
  });
}

/** A pure pipe (the default) that filters the products and counts each run of `transform`. */
@Pipe({ name: 'labM31ProductFilter' })
export class LabM31ProductFilterPipe implements PipeTransform {
  private readonly runs = inject(LabM31ListRuns);

  /**
   * Filters the products by name.
   * @param products the products to filter; Angular calls this again only when an argument changes
   * @param query the text a name must contain
   */
  transform(products: readonly LabM31Product[], query: string): LabM31Product[] {
    this.runs.filter++;
    return filterProducts(products, query);
  }
}

/**
 * The alternative: a pure pipe filters in the template and a `computed` sums the total.
 * The pipe and the `computed` each scan the products; the solution scans once.
 */
@Component({
  selector: 'lab-m31-product-list-pipe',
  imports: [LabM31ProductFilterPipe],
  template: `
    <p>Clock {{ clock() }}</p>
    <p class="total">Total: {{ total() }}</p>
    <ul>
      @for (product of sorted() | labM31ProductFilter: query(); track product.id) {
        <li>{{ product.name }}</li>
      }
    </ul>
  `,
})
export class LabM31ProductListPipe {
  private readonly runs = inject(LabM31ListRuns);
  private readonly products = signal(makeProducts(LAB_M31_PRODUCT_COUNT));
  readonly query = signal('');
  readonly ascending = signal(true);
  readonly clock = signal(0);

  protected readonly sorted = computed(() => sortProducts(this.products(), this.ascending()));
  protected readonly total = computed(() => {
    this.runs.total++;
    return sumPrices(filterProducts(this.products(), this.query()));
  });
}
