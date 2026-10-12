import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { Router, type Routes } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { SHOP_ROUTES, provideShopRouter } from './shop.routes';

// The text solution and its string-redirect alternative must pass every test below.
const ROUTE_TABLES: Record<string, Routes> = {
  'a redirect function': SHOP_ROUTES,
  'a string redirect': SHOP_ROUTES.map((route) =>
    route.path === 'item/:id' ? { path: 'item/:id', redirectTo: 'products/:id' } : route,
  ),
};

/** Opens each URL in turn and returns the final URL, the page text and the document title after each. */
async function visit(routes: Routes, urls: string[]) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: provideShopRouter(routes) });
  const harness = await RouterTestingHarness.create();
  const router = TestBed.inject(Router);
  const title = TestBed.inject(Title);
  const seen: { url: string; page: string; title: string }[] = [];
  for (const url of urls) {
    await harness.navigateByUrl(url);
    harness.detectChanges();
    seen.push({
      url: router.url,
      page: harness.routeNativeElement?.textContent ?? '',
      title: title.getTitle(),
    });
  }
  return seen;
}

describe('E24.1 a shop route table', () => {
  it('/ redirects to /home with a full-match empty-path redirect', async () => {
    for (const routes of Object.values(ROUTE_TABLES)) {
      expect(await visit(routes, ['/'])).toEqual([
        { url: '/home', page: 'Home page', title: 'Shop | Home' },
      ]);
    }
  });

  it('the legacy URL /item/:id redirects to /products/:id with a redirect function that keeps the query string', async () => {
    for (const routes of Object.values(ROUTE_TABLES)) {
      const [seen] = await visit(routes, ['/item/7?ref=mail']);
      expect(seen.url).toBe('/products/7?ref=mail');
      expect(seen.page).toBe('Product page');
    }
    const redirect = SHOP_ROUTES.find((route) => route.path === 'item/:id')?.redirectTo;
    expect(typeof redirect).toBe('function');
  });

  it('/products/new renders the new-product page and /products/7 the product page', async () => {
    for (const routes of Object.values(ROUTE_TABLES)) {
      const seen = await visit(routes, ['/products/new', '/products/7']);
      expect(seen.map(({ url, page }) => ({ url, page }))).toEqual([
        { url: '/products/new', page: 'New product page' },
        { url: '/products/7', page: 'Product page' },
      ]);
    }
  });

  it('an unknown URL renders the not-found page and keeps the URL', async () => {
    for (const routes of Object.values(ROUTE_TABLES)) {
      const seen = await visit(routes, ['/nope/deep', '/home/extra']);
      expect(seen.map(({ url, page }) => ({ url, page }))).toEqual([
        { url: '/nope/deep', page: 'Not found page' },
        { url: '/home/extra', page: 'Not found page' },
      ]);
    }
  });

  it('every page sets document.title to Shop | <page> through one custom TitleStrategy, and the product page title includes its id', async () => {
    for (const routes of Object.values(ROUTE_TABLES)) {
      const seen = await visit(routes, ['/home', '/products', '/products/new', '/products/7', '/nope']);
      expect(seen.map(({ title }) => title)).toEqual([
        'Shop | Home',
        'Shop | Catalog',
        'Shop | New product',
        'Shop | Product 7',
        'Shop | Not found',
      ]);
    }
  });

  it('the route table passes dev-mode validation (creating the router does not throw)', () => {
    for (const routes of Object.values(ROUTE_TABLES)) {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({ providers: provideShopRouter(routes) });
      expect(() => TestBed.inject(Router)).not.toThrow();
    }
  });
});
