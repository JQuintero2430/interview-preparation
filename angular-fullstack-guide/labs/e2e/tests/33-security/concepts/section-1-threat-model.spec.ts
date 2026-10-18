// Section 1: what the attacker controls. The order page (security-lab, nonce build) and its API in
// server/security/01-threat.mjs. Everything left of the API is the visitor's: the downloaded code and the requests.
import { expect, test } from '@playwright/test';
import { consoleErrors, newRun, SEC_ORIGIN, serverLog } from '../support/security.js';

/** `LAB_M33_PUBLIC_MARKER` in projects/security-lab/src/app/m33/threat/order-page.ts, rendered only `@if (isStaff())`. */
const MARKER = 'LAB-M33-STAFF-DISCOUNT-50';
const ORDER_PAGE = `${SEC_ORIGIN}/m33/threat/order`;
const ORDER_API = `${SEC_ORIGIN}/api/m33/threat/order`;

test('Section 1: every string the app ships is readable in the downloaded bundle', async ({ context, page }) => {
  await newRun(context);
  const errors = consoleErrors(page);
  const scripts: Promise<string>[] = [];
  // Not `bundleText`: the lazy route chunk is listed only in the SRI import map, so only the browser's downloads show it.
  page.on('response', (response) => {
    if (new URL(response.url()).pathname.endsWith('.js')) scripts.push(response.text());
  });

  await page.goto(ORDER_PAGE);
  await expect(page.getByRole('heading', { name: 'Order' })).toBeVisible();
  await expect(page.getByText(MARKER)).toHaveCount(0); // never rendered

  const downloaded = (await Promise.all(scripts)).join('\n');
  expect(downloaded).toContain(MARKER); // but shipped
  expect(errors).toEqual([]);
});

test('Section 1: the API recomputes a price the client edited', async ({ context, page }) => {
  const run = await newRun(context);
  const errors = consoleErrors(page);

  // The honest path: the page posts the price it shows.
  await page.goto(ORDER_PAGE);
  await page.getByRole('button', { name: 'Place order' }).click();
  await expect(page.getByRole('status')).toHaveText('Charged 25 EUR');

  // The visitor's path: the same request, edited, without the page.
  const forged = await context.request.post(ORDER_API, { data: { item: 'book', price: 0 } });
  expect(forged.status()).toBe(201);
  expect(await forged.json()).toEqual({ item: 'book', total: 25 });

  const { requests } = await serverLog(context.request, run);
  expect(requests).toEqual([
    { item: 'book', clientPrice: 25, total: 25 },
    { item: 'book', clientPrice: 0, total: 25 },
  ]);
  expect(errors).toEqual([]);
});
