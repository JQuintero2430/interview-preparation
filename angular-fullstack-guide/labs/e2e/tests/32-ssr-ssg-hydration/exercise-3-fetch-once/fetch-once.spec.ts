// Exercise 32.3: carry server data to the browser without a second request, on the production build of `ssr-lab` (port 4400).
// `a/` is the solution (`HttpClient` with the transfer cache, `TransferState` for the stamp); `b/` is the alternative
// (`httpResource`, and a `resource` with an `id` for the stamp). Every criterion runs over both with the same titles.
// `Stable: yes` appears once the app is stable, the moment the transfer cache switches off, so tests wait for it before
// they count requests.
import { expect, test } from '@playwright/test';
import { apiRequests, holdScripts, rawHtml, SSR_ORIGIN, stateScript } from '../support/ssr.js';

type Variant = 'a' | 'b';

const VARIANTS: readonly Variant[] = ['a', 'b'];

const MAIN = /\/main-[^/]*\.js$/;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/** The calls to the products API (`/api/catalog`) among the browser's `/api` requests. */
function productCalls(calls: readonly string[]): string[] {
  return calls.filter((call) => call.includes('/api/catalog'));
}

for (const variant of VARIANTS) {
  const products = `/m32/ex3/${variant}/products`;

  test.describe(`variant ${variant}`, () => {
    test('shows the products in the server HTML', async ({ request }) => {
      const { status, body } = await rawHtml(request, products);

      expect(status).toBe(200);
      expect(body).toContain('<li>Keyboard</li><li>Mouse</li><li>Monitor</li>');
    });

    test('makes no browser request to the products API on the first load', async ({ page }) => {
      const calls = apiRequests(page);

      await page.goto(`${SSR_ORIGIN}${products}`);
      await expect(page.getByLabel('Stable')).toHaveText('yes');

      await expect(page.getByRole('listitem')).toHaveText(['Keyboard', 'Mouse', 'Monitor']);
      expect(productCalls(calls)).toEqual([]);
    });

    test('fetches the products again after a client-side navigation back', async ({ page }) => {
      const calls = apiRequests(page);
      await page.goto(`${SSR_ORIGIN}${products}`);
      await expect(page.getByLabel('Stable')).toHaveText('yes');
      expect(productCalls(calls)).toEqual([]);

      await page.getByRole('link', { name: 'Open the other page' }).click();
      await page.getByRole('link', { name: 'Back to the products' }).click();

      await expect(page.getByLabel('Stable')).toHaveText('yes');
      await expect(page.getByRole('listitem')).toHaveText(['Keyboard', 'Mouse', 'Monitor']);
      expect(productCalls(calls)).toEqual(['GET /api/catalog']);
    });

    test('keeps the per-user response out of the page state', async ({ page, request }) => {
      const { body } = await rawHtml(request, products);
      const calls = apiRequests(page);

      // The server asked for the signed-in user with an Authorization header; nothing of the reply is in the state.
      const state = JSON.stringify(stateScript(body));
      expect(state).not.toContain('Ada');
      expect(state).not.toContain('/api/me');

      await page.goto(`${SSR_ORIGIN}${products}`);
      await expect(page.getByLabel('Stable')).toHaveText('yes');

      // The browser asks again, and only for the user.
      await expect(page.getByLabel('Signed in as')).toHaveText('Ada');
      expect(calls).toEqual(['GET /api/me']);
    });

    test('shows the same server stamp before and after hydration', async ({ page }) => {
      const release = await holdScripts(page, MAIN);
      await page.goto(`${SSR_ORIGIN}${products}`, { waitUntil: 'commit' });
      const stamp = page.getByLabel('Server stamp');
      await expect(stamp).toHaveText(UUID);
      const serverStamp = await stamp.innerText();

      await release();
      await expect(page.getByLabel('Stable')).toHaveText('yes');

      await expect(stamp).toHaveText(serverStamp);
    });
  });
}
