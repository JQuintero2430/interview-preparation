// Section 6: incremental hydration on the production build of `ssr-lab` (port 4400); the page is RenderMode.Server.
// Each deferred component has its own chunk; a chunk is found by the class name it exports, since file names are hashed.
import { readdir } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';
import { distFile, holdScripts, rawHtml, scriptRequests, SSR_ORIGIN } from '../support/ssr.js';

const PRODUCT = '/m32/incremental/product';
const CHUNK = /\/chunk-[^/]*\.js$/;

/** The browser chunk that exports `className` (for example `chunk-Ab12.js`). */
async function chunkOf(className: string): Promise<string> {
  const browserDir = new URL('../../../../angular/dist/ssr-lab/browser/', import.meta.url);
  for (const file of (await readdir(browserDir)).filter((name) => name.startsWith('chunk-'))) {
    if ((await distFile(`browser/${file}`)).includes(` as ${className}}`)) return file;
  }
  throw new Error(`no chunk exports ${className}`);
}

/** How many of the recorded script URLs end with `file`. */
const countOf = (urls: string[], file: string): number => urls.filter((url) => url.endsWith(`/${file}`)).length;

/** Opens the page and waits until the page component itself has hydrated (its `afterNextRender` ran). */
async function openHydrated(page: Page): Promise<void> {
  await page.goto(`${SSR_ORIGIN}${PRODUCT}`);
  await expect(page.getByLabel('Page state')).toHaveText('hydrated');
}

test("Section 6: a hydrate block's content is in the server HTML and a regular defer block's is not", async ({ request }) => {
  const { status, body } = await rawHtml(request, PRODUCT);

  expect(status).toBe(200);
  // hydrate on interaction: the content, with the block id (ngb) and the trigger's events on its root element.
  expect(body).toContain('<section jsaction="click:;keydown:;" ngb="d2"><lab-m32-incremental-reviews ngh="0"><h3>Reviews</h3>');
  expect(body).not.toContain('Reviews placeholder');
  // hydrate never: the content, with no jsaction.
  expect(body).toContain('<footer><lab-m32-incremental-footer><p>Shipping and returns: 30 days.</p>');
  // regular on viewport: only the placeholder.
  expect(body).toContain('<p>Related products placeholder</p>');
  expect(body).not.toContain('Related: desk lamp');
  // The parent of each nested block travels in the state script.
  expect(body).toContain('"__nghDeferData__":{"d0":{"r":1,"s":2},"d1":{"r":1,"s":2,"p":"d0"},"d2":{"r":1,"s":2},"d3":{"r":1,"s":2}}');
});

test("Section 6: the block's chunk is requested only after the hydrate trigger", async ({ page }) => {
  const reviews = await chunkOf('LabM32IncrementalReviews');
  const scripts = scriptRequests(page, CHUNK);
  await openHydrated(page);
  await expect(page.getByRole('heading', { name: 'Reviews' })).toBeVisible();
  expect(countOf(scripts, reviews)).toBe(0);

  await page.getByRole('heading', { name: 'Reviews' }).click();

  await expect.poll(() => countOf(scripts, reviews)).toBe(1);
});

test("Section 6: a hydrate never block's chunk is not requested after interaction", async ({ page }) => {
  const footer = await chunkOf('LabM32IncrementalFooter');
  const reviews = await chunkOf('LabM32IncrementalReviews');
  const scripts = scriptRequests(page, CHUNK);
  await openHydrated(page);

  await page.getByText('Shipping and returns: 30 days.').click();
  // A later hydration on the same page proves the clicks have been processed.
  await page.getByRole('button', { name: 'Helpful' }).click();
  await expect(page.getByLabel('Helpful votes')).toHaveText('1');

  expect(countOf(scripts, reviews)).toBe(1);
  expect(countOf(scripts, footer)).toBe(0);
});

test('Section 6: a click inside a dehydrated block is replayed after the block hydrates', async ({ page }) => {
  const reviews = await chunkOf('LabM32IncrementalReviews');
  const release = await holdScripts(page, new RegExp(`/${reviews.replace('.', '\\.')}$`));
  await openHydrated(page);
  const votes = page.getByLabel('Helpful votes');

  await page.getByRole('button', { name: 'Helpful' }).click();
  await expect(votes).toHaveText('0');

  await release();
  await expect(votes).toHaveText('1');
  // A click on the live listener adds one more: the replayed click ran once.
  await page.getByRole('button', { name: 'Helpful' }).click();
  await expect(votes).toHaveText('2');
});

test('Section 6: nested blocks hydrate from the outermost block down', async ({ page }) => {
  const gallery = await chunkOf('LabM32IncrementalGallery');
  const zoom = await chunkOf('LabM32IncrementalZoom');
  const scripts = scriptRequests(page, CHUNK);
  const logs: string[] = [];
  page.on('console', (message) => {
    if (message.text().startsWith('m32 incremental:')) logs.push(message.text());
  });
  await openHydrated(page);

  await page.getByRole('button', { name: 'Zoom: 0' }).click();

  await expect(page.getByRole('button', { name: 'Zoom: 1' })).toBeVisible();
  expect(logs).toEqual(['m32 incremental: gallery block hydrated', 'm32 incremental: zoom block hydrated']);
  const order = scripts.filter((url) => url.endsWith(`/${gallery}`) || url.endsWith(`/${zoom}`));
  expect(order.map((url) => url.slice(url.lastIndexOf('/') + 1))).toEqual([gallery, zoom]);
});
