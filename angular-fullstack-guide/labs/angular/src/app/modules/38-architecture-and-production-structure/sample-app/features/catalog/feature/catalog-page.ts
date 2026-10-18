import { Component, inject } from '@angular/core';
import { LabM38PageHeading } from '../../../shared/ui/page-heading';
import { pageTitle } from '../../../shared/util/page-title';
import { CatalogStore } from '../data-access/catalog-store';
import { LabM38ProductList } from '../ui/product-list';

/** Container: reads the catalog's data access and passes it to the presentational list. */
@Component({
  selector: 'lab-m38-catalog-page',
  imports: [LabM38PageHeading, LabM38ProductList],
  template: `
    <lab-m38-page-heading [text]="title" />
    <lab-m38-product-list [products]="store.products()" />
  `,
})
export class LabM38CatalogPage {
  protected readonly store = inject(CatalogStore);
  protected readonly title = pageTitle('products');
}
