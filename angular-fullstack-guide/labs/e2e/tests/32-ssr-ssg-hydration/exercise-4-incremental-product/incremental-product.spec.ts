// Exercise 32.4: incremental hydration for a product page, on the production build of `ssr-lab` (port 4400).
// `a/` is the solution (one `@defer` block per region); `b/` is the alternative (the reviews block nested inside the
// recommendations block). Every criterion runs over both with the same titles. File names are hashed, so a chunk is
// found by the class it exports. The recommendations start below a long description, outside the viewport.
import { readdir } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';
import { distFile, holdScripts, rawHtml, scriptRequests, SSR_ORIGIN } from '../support/ssr.js';

type Variant = 'a' | 'b';

const VARIANTS: readonly Variant[] = ['a', 'b'];

const MAIN = /\/main-[^/]*\.js$/;
const CHUNK = /\/chunk-[^/]*\.js$/;

/** The chunks requested once the reviews are clicked, in request order: `b` loads the outer block first. */
const LOAD_ORDER: Record<Variant, readonly string[]> = {
  a: ['LabM32Ex4Reviews'],
  b: ['LabM32Ex4Recommendations', 'LabM32Ex4Reviews'],
};

/** The browser chunk that exports `className` (for example `chunk-Ab12.js`). */
async function chunkOf(className: string): Promise<string> {
  const browserDir = new URL('../../../../angular/dist/ssr-lab/browser/', import.meta.url);
  for (const file of (await readdir(browserDir)).filter((name) => name.startsWith('chunk-'))) {
    if ((await distFile(`browser/${file}`)).includes(` as ${className}}`)) return file;
  }
  throw new Error(`no chunk exports ${className}`);
}

/** The file names among the recorded script URLs that belong to `files`, in request order. */
function requested(urls: readonly string[], files: readonly string[]): string[] {
  return urls.map((url) => url.slice(url.lastIndexOf('/') + 1)).filter((file) => files.includes(file));
}

/** Opens `path` and waits until the page component itself has hydrated (its `afterNextRender` ran). */
async function openHydrated(page: Page, path: string): Promise<void> {
  await page.goto(`${SSR_ORIGIN}${path}`);
  await expect(page.getByLabel('Page state')).toHaveText('hydrated');
}

for (const variant of VARIANTS) {
  const product = `/m32/ex4/${variant}/product`;

  test.describe(`variant ${variant}`, () => {
    test('puts the reviews, recommendations and footer in the server HTML', async ({ request }) => {
      const { status, body } = await rawHtml(request, product);

      expect(status).toBe(200);
      expect(body).toContain('<h3>Reviews</h3>');
      expect(body).toContain('<button type="button" jsaction="click:;" ngb="d');
      expect(body).toContain('<p>Customers also bought: footrest, seat cushion.</p>');
      expect(body).toContain('<p>Free delivery on orders over 50 euros.</p>');
      expect(body).not.toContain('placeholder');
    });

    test('loads no reviews code before the first interaction with them', async ({ page }) => {
      const classes = LOAD_ORDER[variant];
      const files = await Promise.all(['LabM32Ex4Reviews', 'LabM32Ex4Recommendations'].map(chunkOf));
      const scripts = scriptRequests(page, CHUNK);
      await openHydrated(page, product);
      expect(requested(scripts, files)).toEqual([]);

      await page.getByRole('heading', { name: 'Reviews' }).click();

      const expected = await Promise.all(classes.map(chunkOf));
      await expect.poll(() => requested(scripts, files)).toEqual(expected);
    });

    test('counts a helpful click made before hydration exactly once', async ({ page }) => {
      const release = await holdScripts(page, MAIN);
      await page.goto(`${SSR_ORIGIN}${product}`, { waitUntil: 'commit' });
      const votes = page.getByLabel('Helpful votes');

      await page.getByRole('button', { name: 'Helpful' }).click();
      await expect(votes).toHaveText('0');

      await release();
      await expect(votes).toHaveText('1');
      // A click on the live listener adds one more: the early click ran once.
      await page.getByRole('button', { name: 'Helpful' }).click();
      await expect(votes).toHaveText('2');
    });

    test('never loads the footer code on the first visit', async ({ page }) => {
      const footer = await chunkOf('LabM32Ex4Footer');
      const scripts = scriptRequests(page, CHUNK);
      await openHydrated(page, product);

      await page.getByText('Free delivery on orders over 50 euros.').click();
      // A later hydration on the same page proves the clicks have been processed.
      await page.getByRole('button', { name: 'Helpful' }).click();
      await expect(page.getByLabel('Helpful votes')).toHaveText('1');

      expect(requested(scripts, [footer])).toEqual([]);
    });

    test('renders the reviews after a client-side navigation to the page', async ({ page }) => {
      const documents: string[] = [];
      page.on('request', (request) => {
        if (request.resourceType() === 'document') documents.push(request.url());
      });
      await openHydrated(page, `/m32/ex4/${variant}/start`);

      await page.getByRole('link', { name: 'Open the office chair' }).click();

      await expect(page.getByRole('heading', { name: 'Reviews' })).toBeVisible();
      await page.getByRole('button', { name: 'Helpful' }).click();
      await expect(page.getByLabel('Helpful votes')).toHaveText('1');
      expect(documents).toEqual([`${SSR_ORIGIN}/m32/ex4/${variant}/start`]);
    });
  });
}
