import type { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  Router,
  provideRouter,
  withComponentInputBinding,
  withRouterConfig,
  type Routes,
} from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { productTabLink } from './links';
import { LabM24ProductShell } from './product-shell';
import { LabM24ProductTab, LabM24ProductTabComputed } from './product-tab';
import { PRODUCT_ROUTES, provideProductRouter } from './product.routes';

type Features = Parameters<typeof provideRouter>[1][];

// The text solution and its computed-label alternative must pass every test below.
const TABS: Type<LabM24ProductTab>[] = [LabM24ProductTab, LabM24ProductTabComputed];

/** The route table with `Tab` as the tab component. */
const routesWith = (Tab: Type<LabM24ProductTab>): Routes => [
  { ...PRODUCT_ROUTES[0], children: [{ path: ':tab', component: Tab }] },
];

/** Starts a fresh router; the solution's providers unless features replace them. */
async function start(Tab: Type<LabM24ProductTab>, ...features: Features) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: features.length
      ? [provideRouter(routesWith(Tab), ...features)]
      : [provideProductRouter(routesWith(Tab))],
  });
  return RouterTestingHarness.create();
}

/** The routed tab and shell instances, which the harness does not return for nested routes. */
function tabOf(harness: RouterTestingHarness, Tab: Type<LabM24ProductTab>): LabM24ProductTab {
  return harness.fixture.debugElement.query(By.directive(Tab)).componentInstance;
}

function shellOf(harness: RouterTestingHarness): LabM24ProductShell {
  return harness.fixture.debugElement.query(By.directive(LabM24ProductShell)).componentInstance;
}

describe('E24.2 a product page driven by the URL', () => {
  it("the tab component receives `id` from the parent's path, `tab` from its own path and `sort` from the matrix", async () => {
    for (const Tab of TABS) {
      const harness = await start(Tab);
      await harness.navigateByUrl('/products/1/reviews;sort=desc');
      const tab = tabOf(harness, Tab);
      expect([tab.id(), tab.tab(), tab.sort()]).toEqual(['1', 'reviews', 'desc']);
      expect(shellOf(harness).id()).toBe('1');
    }
  });

  it('navigating from product 1 to product 2 reuses the tab component and updates `id`', async () => {
    for (const Tab of TABS) {
      const harness = await start(Tab);
      await harness.navigateByUrl('/products/1/reviews');
      const first = tabOf(harness, Tab);
      const shell = shellOf(harness);
      await harness.navigateByUrl('/products/2/reviews');
      expect(tabOf(harness, Tab)).toBe(first);
      expect(shellOf(harness)).toBe(shell);
      expect(first.id()).toBe('2');
    }
  });

  it('removing `sort` from the URL sets the input to `undefined`, and the template shows the default sort label', async () => {
    for (const Tab of TABS) {
      const harness = await start(Tab);
      await harness.navigateByUrl('/products/1/reviews;sort=desc');
      expect(harness.routeNativeElement?.textContent).toContain('sort: desc');
      await harness.navigateByUrl('/products/1/reviews');
      harness.detectChanges();
      expect(tabOf(harness, Tab).sort()).toBeUndefined();
      expect(harness.routeNativeElement?.textContent).toContain('sort: newest');
    }
  });

  it('`links.ts` builds `/products/2/reviews;sort=desc?ref=email#top` from parameters', async () => {
    for (const Tab of TABS) {
      const harness = await start(Tab);
      const router = TestBed.inject(Router);
      const tree = productTabLink(router, 2, 'reviews', {
        sort: 'desc',
        ref: 'email',
        fragment: 'top',
      });
      expect(tree.toString()).toBe('/products/2/reviews;sort=desc?ref=email#top');
      expect(productTabLink(router, 2, 'specs').toString()).toBe('/products/2/specs');
      await router.navigateByUrl(tree);
      harness.detectChanges();
      expect(router.url).toBe('/products/2/reviews;sort=desc?ref=email#top');
      expect([tabOf(harness, Tab).id(), tabOf(harness, Tab).sort()]).toEqual(['2', 'desc']);
    }
  });

  it("the parent's `id` reaches the tab with the v22 default inheritance, and not under `'emptyOnly'`", async () => {
    for (const Tab of TABS) {
      const harness = await start(Tab);
      await harness.navigateByUrl('/products/5/specs');
      expect(tabOf(harness, Tab).id()).toBe('5');

      const legacy = await start(
        Tab,
        withComponentInputBinding(),
        withRouterConfig({ paramsInheritanceStrategy: 'emptyOnly' }),
      );
      await legacy.navigateByUrl('/products/5/specs');
      expect(tabOf(legacy, Tab).id()).toBeUndefined();
      expect(tabOf(legacy, Tab).tab()).toBe('specs');
      expect(shellOf(legacy).id()).toBe('5');
    }
  });

  it('no query parameter binds when `withComponentInputBinding({ queryParams: false })` is configured', async () => {
    for (const Tab of TABS) {
      const withQuery = await start(Tab);
      await withQuery.navigateByUrl('/products/1/reviews?sort=asc');
      expect(tabOf(withQuery, Tab).sort()).toBe('asc');

      const withoutQuery = await start(Tab, withComponentInputBinding({ queryParams: false }));
      await withoutQuery.navigateByUrl('/products/1/reviews?sort=asc');
      expect(tabOf(withoutQuery, Tab).sort()).toBeUndefined();
      await withoutQuery.navigateByUrl('/products/1/reviews;sort=desc?sort=asc');
      expect(tabOf(withoutQuery, Tab).sort()).toBe('desc');
    }
  });
});
