import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable, of } from 'rxjs';

export interface LabM32Product {
  id: string;
  name: string;
}

/** The products the build knows. `p3` exists only in the API, so it has no file. */
export const LAB_M32_BUILD_PRODUCTS: readonly LabM32Product[] = [
  { id: 'p1', name: 'Keyboard' },
  { id: 'p2', name: 'Mouse' },
];

/** Sent with every product page. */
export const LAB_M32_CATALOG_CACHE_CONTROL = 'public, max-age=300';

/** The ids to prerender, one parameter set per product. */
export const labM32BuildParams = async (): Promise<Record<string, string>[]> =>
  LAB_M32_BUILD_PRODUCTS.map(({ id }) => ({ id }));

/** Finds a product: the build's own list first, then the API, which answers for products added after the build. */
@Injectable()
export class LabM32Catalog {
  private readonly http = inject(HttpClient);

  find(id: string): Observable<LabM32Product | null> {
    const built = LAB_M32_BUILD_PRODUCTS.find((product) => product.id === id);
    if (built) return of(built);
    return this.http.get<LabM32Product[]>('/api/catalog').pipe(map((all) => all.find((product) => product.id === id) ?? null));
  }
}
