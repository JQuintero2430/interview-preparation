import { Component, inject, Injectable, signal } from '@angular/core';

export interface CatalogItem {
  readonly name: string;
  readonly cents: number;
}

// Legacy: provided by CatalogModule's `providers`, not by `providedIn`.
@Injectable()
export class CatalogStore {
  readonly items = signal<readonly CatalogItem[]>([
    { name: 'Pen', cents: 150 },
    { name: 'Book', cents: 1299 },
  ]);
}

// Legacy: declared by CatalogModule, so its template sees only that module's scope.
@Component({
  selector: 'lab-m15-catalog-list',
  standalone: false,
  template: `
    <ul>
      <li *ngFor="let item of store.items()">{{ item.name }}: {{ item.cents | m15Price }}</li>
    </ul>
  `,
})
export class CatalogList {
  protected readonly store = inject(CatalogStore);
}
