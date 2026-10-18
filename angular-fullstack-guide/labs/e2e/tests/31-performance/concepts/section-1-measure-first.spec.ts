import { readFile } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';

// The IIFE build is not in the package's `exports`, so it is read from disk instead of resolved.
const WEB_VITALS_IIFE = new URL('../../../node_modules/web-vitals/dist/web-vitals.iife.js', import.meta.url);

interface ReportedMetric {
  name: string;
  value: number;
}

/** Injects web-vitals before the page's own scripts and exposes it as `window.webVitals`. */
async function injectWebVitals(page: Page): Promise<void> {
  const iife = await readFile(WEB_VITALS_IIFE, 'utf8');
  // `addInitScript({ path })` keeps the IIFE's top-level `var` inside Playwright's wrapper, so assign it explicitly.
  await page.addInitScript({ content: `${iife};window.webVitals = webVitals;` });
}

/** Registers onLCP and onCLS with `reportAllChanges` and returns what they report until both have reported. */
function readVitals(page: Page): Promise<ReportedMetric[]> {
  return page.evaluate(
    () =>
      new Promise<ReportedMetric[]>((resolve, reject) => {
        const vitals: unknown = Reflect.get(window, 'webVitals');
        const library = typeof vitals === 'object' && vitals !== null ? vitals : {};
        const onLCP: unknown = Reflect.get(library, 'onLCP');
        const onCLS: unknown = Reflect.get(library, 'onCLS');
        if (typeof onLCP !== 'function' || typeof onCLS !== 'function') {
          reject(new Error('window.webVitals is missing onLCP or onCLS'));
          return;
        }
        const metrics: ReportedMetric[] = [];
        const finish = (): void => resolve(metrics);
        const record = (metric: unknown): void => {
          const source = typeof metric === 'object' && metric !== null ? metric : {};
          const name: unknown = Reflect.get(source, 'name');
          const value: unknown = Reflect.get(source, 'value');
          if (typeof name === 'string' && typeof value === 'number') metrics.push({ name, value });
          const names = new Set(metrics.map((reported) => reported.name));
          if (names.has('LCP') && names.has('CLS')) finish();
        };
        onLCP(record, { reportAllChanges: true });
        onCLS(record, { reportAllChanges: true });
        // A safety net only: the test asserts names, so a missing metric fails the assertion, not a timer.
        setTimeout(finish, 2000);
      }),
  );
}

test('Section 1: the production build ships hashed files that the dev tools cannot inspect', async ({ page }) => {
  const html = await (await page.request.get('/m31/home')).text();
  expect(html).toMatch(/<script src="main-[A-Z0-9]{8}\.js" type="module"><\/script>/);

  await page.goto('/m31/home');
  await expect(page.getByRole('heading', { name: 'Module 31 lab' })).toBeVisible();
  const ngGlobal = await page.evaluate(() => typeof Reflect.get(window, 'ng'));
  expect(ngGlobal).toBe('undefined');
});

test('Section 1: web-vitals reports LCP and CLS for the module-31 landing page', async ({ page }) => {
  await injectWebVitals(page);
  await page.goto('/m31/home');
  await expect(page.getByRole('heading', { name: 'Module 31 lab' })).toBeVisible();

  const metrics = await readVitals(page);

  expect(new Set(metrics.map((metric) => metric.name))).toEqual(new Set(['LCP', 'CLS']));
  for (const metric of metrics) {
    expect(Number.isFinite(metric.value)).toBe(true);
  }
});
