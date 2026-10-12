import { Location } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import {
  NavigationCancel,
  NavigationCancellationCode,
  NavigationEnd,
  NavigationStart,
  Router,
} from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { LabM24ProductApi } from './product-api';
import { LabM24ProductPage } from './product-page';
import { provideProductLoading } from './product.routes';

/** Starts a fresh router, a harness and a log of the navigation events. */
async function start() {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: [provideProductLoading()] });
  const harness = await RouterTestingHarness.create();
  const router = TestBed.inject(Router);
  const events: unknown[] = [];
  router.events.subscribe((e) => events.push(e));
  return { harness, router, events, api: TestBed.inject(LabM24ProductApi), location: TestBed.inject(Location) };
}

describe('E24.4 load a product before activation', () => {
  it('the product page renders with the resolved product as its input on first paint', async () => {
    const { harness, router } = await start();
    const page = await harness.navigateByUrl('/products/1', LabM24ProductPage);
    expect(router.url).toBe('/products/1');
    expect(page.product()).toEqual({ id: '1', name: 'Keyboard' });
    expect(harness.routeNativeElement?.textContent).toContain('Keyboard');
  });

  it('an unknown id redirects to `/not-found` while the browser URL shows the requested product URL', async () => {
    const { harness, router, location } = await start();
    await harness.navigateByUrl('/');
    expect(await router.navigateByUrl('/products/99')).toBe(true);
    expect(router.url).toBe('/not-found');
    expect(location.path()).toBe('/products/99');
    expect(harness.routeNativeElement?.textContent).toContain('not-found');
  });

  it('an API error ends at `/error` through `withNavigationErrorHandler`, and the navigation promise resolves `true`', async () => {
    const { harness, router, api } = await start();
    api.failing.add('1');
    await harness.navigateByUrl('/');
    expect(await router.navigateByUrl('/products/1')).toBe(true);
    expect(router.url).toBe('/error');
    expect(harness.routeNativeElement?.textContent).toContain('error');
  });

  it('an API that completes without a value cancels the navigation with `NoDataFromResolver` and the previous page stays', async () => {
    const { harness, router, api, events } = await start();
    api.silent.add('2');
    await harness.navigateByUrl('/products/1', LabM24ProductPage);
    events.length = 0;
    expect(await router.navigateByUrl('/products/2')).toBe(false);
    expect(router.url).toBe('/products/1');
    const cancel = events.find((e) => e instanceof NavigationCancel) as NavigationCancel;
    expect(cancel.code).toBe(NavigationCancellationCode.NoDataFromResolver);
    expect(events.some((e) => e instanceof NavigationEnd)).toBe(false);
    expect(harness.routeNativeElement?.textContent).toContain('Keyboard');
  });

  it('the `resources` route renders the same product with a blocking resource', async () => {
    const { harness, router } = await start();
    const page = await harness.navigateByUrl('/resource-products/2', LabM24ProductPage);
    expect(router.url).toBe('/resource-products/2');
    expect(page.product()).toEqual({ id: '2', name: 'Monitor' });
    expect(harness.routeNativeElement?.textContent).toContain('Monitor');
  });

  it('the resolver runs again when the product id changes and not when only the query string changes', async () => {
    const { harness, router, api, events } = await start();
    await harness.navigateByUrl('/products/1?tab=a');
    await router.navigateByUrl('/products/1?tab=b');
    expect(api.calls).toEqual(['1']);
    await router.navigateByUrl('/products/2?tab=b');
    expect(api.calls).toEqual(['1', '2']);
    expect(events.filter((e) => e instanceof NavigationStart)).toHaveLength(3);
  });
});
