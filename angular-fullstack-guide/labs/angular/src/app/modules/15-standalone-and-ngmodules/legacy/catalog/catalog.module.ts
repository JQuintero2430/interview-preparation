import { CommonModule } from '@angular/common';
import { inject, InjectionToken, NgModule } from '@angular/core';
import { CatalogList, CatalogStore } from './catalog-list';
import { PricePipe } from './price-pipe';

// Lets a test observe when the module class is instantiated.
export const CATALOG_LOG = new InjectionToken<string[]>('lab-m15-catalog-log');

// Legacy: one class doing three jobs (template scope, providers, a unit to import).
@NgModule({
  declarations: [CatalogList, PricePipe],
  imports: [CommonModule],
  exports: [CatalogList],
  providers: [CatalogStore],
})
export class CatalogModule {
  constructor() {
    inject(CATALOG_LOG, { optional: true })?.push('CatalogModule created');
  }
}
