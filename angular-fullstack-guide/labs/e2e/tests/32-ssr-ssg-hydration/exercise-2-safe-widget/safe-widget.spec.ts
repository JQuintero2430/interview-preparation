// Exercise 32.2: a browser-only widget made safe to render, on the production build of `ssr-lab` (port 4400).
// `broken` is the statement's "before" and `a/` the solution (`afterNextRender` with `DOCUMENT`); `b/` is the alternative
// (a store the route provides). Every criterion runs over `a` and `b` with the same titles.
import { expect, test } from '@playwright/test';
import { consoleErrors, holdScripts, rawHtml, SSR_ORIGIN } from '../support/ssr.js';

type Variant = 'a' | 'b';

const VARIANTS: readonly Variant[] = ['a', 'b'];

const MAIN = /\/main-[^/]*\.js$/;

const HEADING = 'Widget: viewport and recent items';

// Not a criterion: the page the statement starts from fails on the server.
test('Before the fix: the server render touches window and the request fails', async ({ request }) => {
  const { status, body } = await rawHtml(request, '/m32/ex2/broken');

  // The lab's server.ts calls next() when the engine returns null, so Express answers its own 404.
  expect(status).toBe(404);
  expect(body).toContain('<pre>Cannot GET /m32/ex2/broken</pre>');
  expect(body).not.toContain(HEADING);
});

for (const variant of VARIANTS) {
  const widget = `/m32/ex2/${variant}`;

  test.describe(`variant ${variant}`, () => {
    test('renders on the server with status 200', async ({ request }) => {
      const { status, body } = await rawHtml(request, widget);

      expect(status).toBe(200);
      expect(body).toContain('ng-server-context="ssr"');
      expect(body).toContain(`<h2>${HEADING}</h2>`);
    });

    test('shows the fallback text in the server HTML', async ({ request }) => {
      const { body } = await rawHtml(request, widget);

      expect(body).toContain('<output aria-label="Width">unknown</output>');
      expect(body).toContain('<p>No recent items yet</p>');
    });

    test('hydrates without a hydration error in the console', async ({ page }) => {
      const errors = consoleErrors(page);
      await page.goto(`${SSR_ORIGIN}${widget}`);
      await page.getByRole('button', { name: 'View Keyboard' }).click();
      await expect(page.getByRole('listitem')).toHaveText(['Keyboard']);

      // The second load has stored items, so hydration runs over a page that has something to restore.
      const release = await holdScripts(page, MAIN);
      await page.reload({ waitUntil: 'commit' });
      const heading = page.getByRole('heading', { name: HEADING });
      await expect(heading).toBeVisible();
      const serverHeading = await heading.elementHandle();

      await release();
      await expect(page.getByRole('listitem')).toHaveText(['Keyboard']);
      const sameNode = await page.evaluate(
        (node) => node !== null && node.isConnected && node === document.querySelector('h2'),
        serverHeading,
      );
      expect(sameNode).toBe(true);
      expect(errors).toEqual([]);
    });

    test('shows the window width after hydration', async ({ page }) => {
      await page.setViewportSize({ width: 900, height: 600 });
      await page.goto(`${SSR_ORIGIN}${widget}`);

      await expect(page.getByLabel('Width')).toHaveText('900px');
    });

    test('restores the last viewed items after a reload', async ({ page }) => {
      await page.goto(`${SSR_ORIGIN}${widget}`);
      await expect(page.getByLabel('Width')).toHaveText(/^\d+px$/);
      await page.getByRole('button', { name: 'View Keyboard' }).click();
      await page.getByRole('button', { name: 'View Mouse' }).click();
      await expect(page.getByRole('listitem')).toHaveText(['Mouse', 'Keyboard']);

      await page.reload();

      await expect(page.getByRole('listitem')).toHaveText(['Mouse', 'Keyboard']);
    });
  });
}
