import { Location } from '@angular/common';
import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NavigationEnd, Router, provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { filter, firstValueFrom } from 'rxjs';
import { parseFilters, toQueryParams } from './product-filters';
import { ProductListPage } from './product-list-page';
import { LabM28RouteProductListPage } from './route-product-list-page';

type Page = ProductListPage | LabM28RouteProductListPage;

const variants: [string, Type<Page>][] = [
  ['input binding', ProductListPage],
  ['ActivatedRoute', LabM28RouteProductListPage],
];

describe.each(variants)('E28.2 the URL as state (%s)', (_name, pageType) => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: 'products', component: pageType }], withComponentInputBinding())],
    });
  });

  async function open(url: string): Promise<{ harness: RouterTestingHarness; page: Page }> {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl(url, pageType);
    return { harness, page };
  }

  function summary(harness: RouterTestingHarness): string {
    harness.detectChanges();
    return (harness.routeNativeElement as HTMLElement).querySelector('.summary')?.textContent ?? '';
  }

  const url = () => TestBed.inject(Router).url;

  it('opening the page with q and page in the URL shows those filters', async () => {
    const { harness } = await open('/products?q=pen&page=3');
    expect(summary(harness)).toBe('pen · page 3 · name');
  });

  it('changing the filter writes it to the URL and keeps the other parameters', async () => {
    const { harness, page } = await open('/products?ref=mail&page=3');
    await page.setQuery('pen');
    expect(url()).toBe('/products?ref=mail&q=pen');
    expect(summary(harness)).toBe('pen · page 1 · name');
  });

  it('default values are left out of the URL', async () => {
    const { page } = await open('/products?ref=mail');
    await page.setPage(2);
    expect(url()).toBe('/products?ref=mail&page=2');
    await page.setPage(1);
    expect(url()).toBe('/products?ref=mail');
    expect(toQueryParams(parseFilters({}))).toEqual({});
  });

  it('an invalid page falls back to the first page', async () => {
    const { harness } = await open('/products');
    for (const bad of ['abc', '0', '-2', '2.5', '']) {
      await harness.navigateByUrl(`/products?page=${bad}&sort=size`, pageType);
      expect(summary(harness)).toBe(' · page 1 · name');
    }
  });

  it('navigating to the previous URL restores the previous filter', async () => {
    const { harness, page } = await open('/products?q=pen');
    await page.setQuery('pencil');
    expect(summary(harness)).toBe('pencil · page 1 · name');

    // A TestBed router does not follow the browser's history until its location listener is set up.
    const router = TestBed.inject(Router);
    router.setUpLocationChangeListener();
    const ended = firstValueFrom(router.events.pipe(filter((event) => event instanceof NavigationEnd)));
    TestBed.inject(Location).back();
    await ended;
    expect(url()).toBe('/products?q=pen');
    expect(summary(harness)).toBe('pen · page 1 · name');
  });
});
