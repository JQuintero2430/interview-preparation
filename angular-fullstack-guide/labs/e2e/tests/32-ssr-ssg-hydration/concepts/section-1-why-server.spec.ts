// Section 1: the same product page served with RenderMode.Client and RenderMode.Server.
// `rawHtml` fetches without a browser, so each body is what a client that runs no JavaScript receives.
import { expect, test } from '@playwright/test';
import { rawHtml, SSR_ORIGIN } from '../support/ssr.js';

const PRODUCT = 'Trail running shoe';
const TITLE = '<title>Trail running shoe | Lab shop</title>';
const DESCRIPTION = '<meta name="description" content="A light trail running shoe with a grippy sole.">';
const PRELOAD = '<link as="image" href="favicon.ico" rel="preload" fetchpriority="high">';

test('Section 1: a client-rendered route sends an empty app root', async ({ request, page }) => {
  const { status, body } = await rawHtml(request, '/m32/why/client');
  expect(status).toBe(200);
  expect(body).toContain('<lab-root></lab-root>');
  expect(body).toContain('<title>SsrLab</title>');
  expect(body).not.toContain(PRODUCT);

  // The browser builds the same page once the JavaScript runs.
  await page.goto(`${SSR_ORIGIN}/m32/why/client`);
  await expect(page.getByRole('heading', { name: PRODUCT })).toBeVisible();
  await expect(page).toHaveTitle('Trail running shoe | Lab shop');
});

test('Section 1: a server-rendered route sends the content, the title and the description', async ({ request }) => {
  const { status, body } = await rawHtml(request, '/m32/why/server');
  expect(status).toBe(200);
  expect(body).toContain(`<h2>${PRODUCT}</h2>`);
  expect(body).toContain(TITLE);
  expect(body).toContain(DESCRIPTION);
});

test('Section 1: a priority image adds a preload link to the server HTML', async ({ request }) => {
  const server = await rawHtml(request, '/m32/why/server');
  expect(server.status).toBe(200);
  const headEnd = server.body.indexOf('</head>');
  expect(headEnd).toBeGreaterThan(0);
  expect(server.body.slice(0, headEnd)).toContain(PRELOAD);

  const client = await rawHtml(request, '/m32/why/client');
  expect(client.status).toBe(200);
  expect(client.body).not.toContain('rel="preload"');
});
