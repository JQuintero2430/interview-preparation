import { Injectable, inject, type EnvironmentProviders, type Provider } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, TitleStrategy, provideRouter, type RouterStateSnapshot, type Routes } from '@angular/router';
import {
  LabM24ShopCatalog,
  LabM24ShopHome,
  LabM24ShopNewProduct,
  LabM24ShopNotFound,
  LabM24ShopProduct,
} from './pages';

/** The one title strategy of the shop: `Shop | <page>`, or `Shop` when no route in the branch has a title. */
@Injectable()
export class LabM24ShopTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const page = this.buildTitle(snapshot);
    this.title.setTitle(page ? `Shop | ${page}` : 'Shop');
  }
}

export const SHOP_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'home', title: 'Home', component: LabM24ShopHome },
  { path: 'products', title: 'Catalog', component: LabM24ShopCatalog },
  { path: 'products/new', title: 'New product', component: LabM24ShopNewProduct },
  {
    path: 'products/:id',
    title: (route) => `Product ${route.params['id']}`,
    component: LabM24ShopProduct,
  },
  {
    path: 'item/:id',
    redirectTo: ({ params, queryParams }) =>
      inject(Router).createUrlTree(['/products', params['id']], { queryParams }),
  },
  { path: '**', title: 'Not found', component: LabM24ShopNotFound },
];

export function provideShopRouter(routes: Routes = SHOP_ROUTES): (Provider | EnvironmentProviders)[] {
  return [provideRouter(routes), { provide: TitleStrategy, useClass: LabM24ShopTitleStrategy }];
}
