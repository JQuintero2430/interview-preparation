import { Routes } from '@angular/router';
import { CatalogStore } from './data-access/catalog-store';
import { LabM38CatalogHome } from './feature/catalog-home';
import { LabM38CatalogPage } from './feature/catalog-page';

export default [
  { path: '', component: LabM38CatalogHome },
  { path: 'products', component: LabM38CatalogPage, providers: [CatalogStore] },
] satisfies Routes;
