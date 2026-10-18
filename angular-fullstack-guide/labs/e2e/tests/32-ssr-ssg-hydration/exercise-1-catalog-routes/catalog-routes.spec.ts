// Exercise 32.1: server routes for a catalog, on the production build of `ssr-lab` (port 4400).
// `a/` is the solution (the page sets the status) and `b/` the alternative (a resolver redirects to a not-found route);
// every criterion runs over both, with the same titles. Build-time files are read from `labs/angular/dist/ssr-lab`.
import { expect, test } from '@playwright/test';
import { distFile, rawHtml, SSR_ORIGIN } from '../support/ssr.js';

type Variant = 'a' | 'b';

const VARIANTS: readonly Variant[] = ['a', 'b'];

const CACHE_CONTROL = 'public, max-age=300';

/** The first answer for an unknown id: the page's own 404 (a), or the resolver's redirect (b). */
const FIRST_STATUS: Record<Variant, number> = { a: 404, b: 302 };

for (const variant of VARIANTS) {
  const products = `/m32/ex1/${variant}/products`;

  test.describe(`variant ${variant}`, () => {
    test('writes an HTML file at build time for each known product', async () => {
      expect(await distFile(`browser${products}/p1/index.html`)).toContain('<h2>Keyboard</h2>');
      expect(await distFile(`browser${products}/p2/index.html`)).toContain('<h2>Mouse</h2>');
      await expect(distFile(`browser${products}/p3/index.html`)).rejects.toThrow('is missing');
      await expect(distFile(`browser${products}/p9/index.html`)).rejects.toThrow('is missing');

      const prerendered = JSON.parse(await distFile('prerendered-routes.json')) as { routes: Record<string, unknown> };
      const built = Object.keys(prerendered.routes).filter((route) => route.startsWith(`${products}/`));
      expect(built).toEqual([`${products}/p1`, `${products}/p2`]);
    });

    test('renders a product added after the build on the server', async ({ request, page }) => {
      const { status, body } = await rawHtml(request, `${products}/p3`);
      expect(status).toBe(200);
      expect(body).toContain('<h2>Monitor</h2>');
      expect(body).toContain('ng-server-context="ssr"');

      await page.goto(`${SSR_ORIGIN}${products}/p3`);
      await expect(page.getByRole('heading', { name: 'Monitor' })).toBeVisible();
    });

    test('answers 404 with the not-found page for an unknown product', async ({ request, page }) => {
      const first = await request.get(new URL(`${products}/p9`, SSR_ORIGIN).href, { maxRedirects: 0 });
      expect(first.status()).toBe(FIRST_STATUS[variant]);

      const { status, body } = await rawHtml(request, `${products}/p9`);
      expect(status).toBe(404);
      expect(body).toContain('<h2>Product not found</h2>');

      const response = await page.goto(`${SSR_ORIGIN}${products}/p9`);
      expect(response?.status()).toBe(404);
      await expect(page.getByRole('heading', { name: 'Product not found' })).toBeVisible();
    });

    test("sends the catalog's Cache-Control header with every product page", async ({ request }) => {
      for (const id of ['p1', 'p2', 'p3']) {
        const { headers } = await rawHtml(request, `${products}/${id}`);
        expect(headers['cache-control'], id).toBe(CACHE_CONTROL);
      }

      // The route's header is not tied to the status: the first answer for an unknown id carries it too.
      const unknown = await request.get(new URL(`${products}/p9`, SSR_ORIGIN).href, { maxRedirects: 0 });
      expect(unknown.headers()['cache-control']).toBe(CACHE_CONTROL);
    });

    test('keeps the account page rendered in the browser only', async ({ request, page }) => {
      const { status, body } = await rawHtml(request, `/m32/ex1/${variant}/account`);
      expect(status).toBe(200);
      expect(body).toContain('<lab-root></lab-root>');
      expect(body).not.toContain('Your account');

      await page.goto(`${SSR_ORIGIN}/m32/ex1/${variant}/account`);
      await expect(page.getByRole('heading', { name: 'Your account' })).toBeVisible();
    });
  });
}
