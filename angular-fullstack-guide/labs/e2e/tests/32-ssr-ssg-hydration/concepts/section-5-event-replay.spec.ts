// Section 5: event replay on the production build of `ssr-lab` (port 4400); the page is RenderMode.Server.
// The main bundle is held with `holdScripts` so a click can happen before any Angular code runs.
import { expect, test } from '@playwright/test';
import { consoleErrors, holdScripts, rawHtml, SSR_ORIGIN } from '../support/ssr.js';

const CART = '/m32/replay/cart';
const MAIN = /\/main-[^/]*\.js$/;

test('Section 5: the server HTML includes the event contract script and jsaction attributes', async ({ request }) => {
  const { status, body } = await rawHtml(request, CART);

  expect(status).toBe(200);
  // The contract is the first thing in the body (after the integrity marker), so it runs before any content is parsed.
  expect(body).toContain('<body><!--nghm--><script type="text/javascript" id="ng-event-dispatch-contract">');
  expect(body).toContain('<script>window.__jsaction_bootstrap(document.body,"ng",["click"],[]);</script>');
  expect(body).toContain('<button type="button" jsaction="click:;">Add to cart</button>');
});

test('Section 5: a click before hydration is replayed once after hydration', async ({ page }) => {
  const errors = consoleErrors(page);
  const release = await holdScripts(page, MAIN);
  await page.goto(`${SSR_ORIGIN}${CART}`, { waitUntil: 'commit' });

  const items = page.getByRole('status');
  await expect(items).toHaveText('0');
  await page.getByRole('button', { name: 'Add to cart' }).click();
  await expect(items).toHaveText('0');

  await release();
  await expect(items).toHaveText('1');
  // A click handled by the live listener adds one more: the replay ran the handler once, not twice.
  await page.getByRole('button', { name: 'Add to cart' }).click();
  await expect(items).toHaveText('2');
  expect(errors).toEqual([]);
});

test('Section 5: an element without a listener carries no jsaction attribute', async ({ request }) => {
  const { body } = await rawHtml(request, CART);

  expect(body).toContain('<h2>Event replay: cart</h2>');
  expect(body).toContain('<p>This paragraph has no listener.</p>');
  expect(body).toContain('<p>Items in cart: <output>0</output></p>');
  expect(body).not.toMatch(/<(h2|p|output)[^>]*jsaction/);
});
