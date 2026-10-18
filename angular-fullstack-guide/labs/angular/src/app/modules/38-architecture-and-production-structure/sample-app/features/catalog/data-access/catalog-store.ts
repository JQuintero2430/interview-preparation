import { Injectable, signal } from '@angular/core';

/** The shape the catalog screens use. */
export interface Product {
  readonly id: number;
  readonly name: string;
}

/** Catalog data access: an in-memory source here; orders shows the HTTP version behind a facade. */
@Injectable()
export class CatalogStore {
  readonly products = signal<readonly Product[]>([
    { id: 1, name: 'Desk' },
    { id: 2, name: 'Lamp' },
  ]).asReadonly();
}
