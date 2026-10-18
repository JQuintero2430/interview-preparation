// Section 7: platform-safe code on the production build of `ssr-lab` (port 4400).
// Every page is RenderMode.Server except `language-static`, which is prerendered.
import { expect, test } from '@playwright/test';
import { rawHtml, SSR_ORIGIN } from '../support/ssr.js';

const PLATFORM = '/m32/platform';

test('Section 7: touching window during a server render fails the request', async ({ request }) => {
  const { status, body } = await rawHtml(request, `${PLATFORM}/window-crash`);

  // The lab's server.ts calls next() when the engine returns null, so Express answers.
  expect(status).toBe(404);
  expect(body).toContain('<pre>Cannot GET /m32/platform/window-crash</pre>');
  expect(body).not.toContain('Platform: window width');
});

test('Section 7: afterNextRender work is absent from the server HTML and present after hydration', async ({ page, request }) => {
  const { body } = await rawHtml(request, `${PLATFORM}/after-render`);

  expect(body).toContain('<output aria-label="Width">unknown</output>');

  await page.goto(`${SSR_ORIGIN}${PLATFORM}/after-render`);

  await expect(page.getByLabel('Width')).toHaveText(/^\d+px$/);
});

test('Section 7: RESPONSE_INIT sets the status of a server-rendered page', async ({ request }) => {
  const notFound = await rawHtml(request, `${PLATFORM}/not-found-page`);
  const found = await rawHtml(request, `${PLATFORM}/after-render`);

  expect(notFound.status).toBe(404);
  expect(notFound.body).toContain('<h2>Not found</h2>');
  expect(found.status).toBe(200);
});

test('Section 7: REQUEST exposes the request headers during a server render', async ({ request }) => {
  const url = new URL(`${PLATFORM}/language`, SSR_ORIGIN).href;
  const german = await (await request.get(url, { headers: { 'Accept-Language': 'de-CH' } })).text();
  const french = await (await request.get(url, { headers: { 'Accept-Language': 'fr' } })).text();
  const prerendered = await rawHtml(request, `${PLATFORM}/language-static`);

  expect(german).toContain('<output aria-label="Language">de-CH</output>');
  expect(french).toContain('<output aria-label="Language">fr</output>');
  // A prerendered page is built with no request: the token is null.
  expect(prerendered.body).toContain('<output aria-label="Language">no request</output>');
});

test('Section 7: the server waits for a pending task before it serializes the page', async ({ request }) => {
  const { body } = await rawHtml(request, `${PLATFORM}/pending`);

  expect(body).toContain('<output aria-label="Message">loaded by a pending task</output>');
  expect(body).not.toContain('>waiting<');
});
