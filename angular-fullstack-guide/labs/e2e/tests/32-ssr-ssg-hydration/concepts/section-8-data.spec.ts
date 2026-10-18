// Section 8: data across the server/browser boundary on the production build of `ssr-lab` (port 4400).
// Every page is RenderMode.Server. `Stable: yes` appears in the browser once the app is stable, the moment the
// HTTP transfer cache switches off, so the tests wait for it before they assert request counts.
import { expect, test } from '@playwright/test';
import { apiRequests, rawHtml, SSR_ORIGIN, stateScript } from '../support/ssr.js';

const DATA = '/m32/data';
const PRODUCTS = [
  { id: 'p1', name: 'Keyboard' },
  { id: 'p2', name: 'Mouse' },
  { id: 'p3', name: 'Monitor' },
];

/** The state script as an object keyed by state key. */
function stateObject(html: string): Record<string, unknown> {
  const state = stateScript(html);
  if (typeof state !== 'object' || state === null) throw new Error('the state script is not an object');
  return Object.fromEntries(Object.entries(state));
}

/** The `time` field of a `/api/time` reply. */
function timeOf(reply: unknown): string {
  if (typeof reply === 'object' && reply !== null && 'time' in reply && typeof reply.time === 'string') return reply.time;
  throw new Error('no time in the reply');
}

test('Section 8: the server HTML carries the HttpClient response in the state script', async ({ request }) => {
  const { body } = await rawHtml(request, `${DATA}/products`);
  const entries = Object.entries(stateObject(body)).filter(([key]) => key !== '__nghData__');

  // One entry, keyed by a hash of the request; the body, headers and status are the response's.
  expect(entries).toHaveLength(1);
  const [key, entry] = entries[0];
  expect(key).toMatch(/^[0-9a-f]{64}$/);
  expect(entry).toEqual({ b: PRODUCTS, h: {}, s: 200, st: 'OK', u: '/api/catalog', rt: 'json' });
  expect(body).toContain('<li>Keyboard</li><li>Mouse</li><li>Monitor</li>');
});

test('Section 8: hydration reuses the cached response without a browser request', async ({ page }) => {
  const calls = apiRequests(page);

  await page.goto(`${SSR_ORIGIN}${DATA}/products`);
  await expect(page.getByLabel('Stable')).toHaveText('yes');

  await expect(page.getByRole('listitem')).toHaveText(['Keyboard', 'Mouse', 'Monitor']);
  expect(calls).toEqual([]);
});

test('Section 8: a request with an Authorization header is requested again in the browser', async ({ page, request }) => {
  const { body } = await rawHtml(request, `${DATA}/me`);
  const calls = apiRequests(page);

  // The server fetched the list to render it, but nothing was stored for the browser.
  expect(body).toContain('<li>Keyboard</li><li>Mouse</li><li>Monitor</li>');
  expect(Object.keys(stateObject(body))).toEqual(['__nghData__']);

  await page.goto(`${SSR_ORIGIN}${DATA}/me`);
  await expect(page.getByLabel('Stable')).toHaveText('yes');

  expect(calls).toEqual(['GET /api/catalog']);
});

test('Section 8: a client-side navigation after hydration requests again', async ({ page }) => {
  const calls = apiRequests(page);

  await page.goto(`${SSR_ORIGIN}${DATA}/products`);
  await expect(page.getByLabel('Stable')).toHaveText('yes');
  expect(calls).toEqual([]);

  await page.getByRole('link', { name: 'Open the list again' }).click();

  await expect(page).toHaveURL(`${SSR_ORIGIN}${DATA}/products-again`);
  await expect(page.getByLabel('Stable')).toHaveText('yes');
  await expect(page.getByRole('listitem')).toHaveText(['Keyboard', 'Mouse', 'Monitor']);
  expect(calls).toEqual(['GET /api/catalog']);
});

test('Section 8: a TransferState value written on the server is read in the browser', async ({ page, request }) => {
  const { body } = await rawHtml(request, `${DATA}/state`);

  expect(body).toContain('<output aria-label="Banner">written on the server</output>');
  expect(stateScript(body)).toMatchObject({ 'lab-banner': 'written on the server' });

  await page.goto(`${SSR_ORIGIN}${DATA}/state`);
  await expect(page.getByLabel('Stable')).toHaveText('yes');

  // Without the transferred value the browser would show its own fallback, "computed in the browser".
  await expect(page.getByLabel('Banner')).toHaveText('written on the server');
});

test('Section 8: a resource with an id reads its server value in the browser', async ({ page, request }) => {
  const { body } = await rawHtml(request, `${DATA}/state`);
  const calls = apiRequests(page);

  // The id is the key: only the resource that has one is in the state script.
  const state = stateObject(body);
  expect(state['lab-time']).toEqual({ time: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/) });
  expect(Object.keys(state).sort()).toEqual(['__nghData__', 'lab-banner', 'lab-time']);

  await page.goto(`${SSR_ORIGIN}${DATA}/state`);
  await expect(page.getByLabel('Stable')).toHaveText('yes');

  // One browser request, made by the resource without an id; the one with an id made none.
  expect(calls).toEqual(['GET /api/time']);
  const time = timeOf(state['lab-time']);
  await expect(page.getByLabel('Time with id')).toHaveText(time);
  await expect(page.getByLabel('Time without id')).toHaveText(time);
});
