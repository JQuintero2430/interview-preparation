// Section 3: the server routes of the `ssr-lab` project, answered by the production server on port 4400.
// Build-time files are read from `labs/angular/dist/ssr-lab/browser`; responses are read without a browser.
import { expect, test } from '@playwright/test';
import { distFile, rawHtml, SSR_ORIGIN } from '../support/ssr.js';

const ROUTES = '/m32/routes';

test('Section 3: a Prerender route is served from a file written at build time', async ({ request }) => {
  const file = await distFile('browser/m32/routes/prerendered/index.html');
  expect(file).toContain('<p>Visit: none</p>');

  const { status, body } = await rawHtml(request, `${ROUTES}/prerendered`);
  expect(status).toBe(200);
  expect(body).toBe(file);

  // The query string is not part of the file's name: the same file answers it.
  const withQuery = await rawHtml(request, `${ROUTES}/prerendered?visit=b`);
  expect(withQuery.body).toBe(file);
});

test('Section 3: a Server route renders on every request', async ({ request }) => {
  const first = await rawHtml(request, `${ROUTES}/server?visit=a`);
  const second = await rawHtml(request, `${ROUTES}/server?visit=b`);
  expect(first.status).toBe(200);
  expect(first.body).toContain('<p>Visit: a</p>');
  expect(second.body).toContain('<p>Visit: b</p>');
  await expect(distFile('browser/m32/routes/server/index.html')).rejects.toThrow('is missing');
});

test('Section 3: a Client route sends the shell without the page content', async ({ request, page }) => {
  const { status, body } = await rawHtml(request, `${ROUTES}/client`);
  expect(status).toBe(200);
  expect(body).toContain('<lab-root></lab-root>');
  expect(body).not.toContain('Route page');

  await page.goto(`${SSR_ORIGIN}${ROUTES}/client`);
  await expect(page.getByRole('heading', { name: 'Route page: client' })).toBeVisible();
});

test('Section 3: getPrerenderParams writes one file per returned id', async () => {
  expect(await distFile('browser/m32/routes/products/1/index.html')).toContain('<h2>Product 1</h2>');
  expect(await distFile('browser/m32/routes/products/2/index.html')).toContain('<h2>Product 2</h2>');
  await expect(distFile('browser/m32/routes/products/3/index.html')).rejects.toThrow('is missing');

  const prerendered = JSON.parse(await distFile('prerendered-routes.json')) as { routes: Record<string, unknown> };
  const products = Object.keys(prerendered.routes).filter((route) => route.startsWith(`${ROUTES}/products/`));
  expect(products).toEqual([`${ROUTES}/products/1`, `${ROUTES}/products/2`]);
});

test('Section 3: the default fallback renders an id that was not prerendered on the server', async ({ request }) => {
  const built = await rawHtml(request, `${ROUTES}/products/1`);
  expect(built.body).toBe(await distFile('browser/m32/routes/products/1/index.html'));

  const { status, body } = await rawHtml(request, `${ROUTES}/products/3`);
  expect(status).toBe(200);
  expect(body).toContain('<h2>Product 3</h2>');
  expect(body).toContain('ng-server-context="ssr"');
});

test('Section 3: the Client fallback sends the shell for an id that was not prerendered', async ({ request }) => {
  const built = await rawHtml(request, `${ROUTES}/shelf-client/1`);
  expect(built.body).toContain('<h2>Product 1</h2>');

  const { status, body } = await rawHtml(request, `${ROUTES}/shelf-client/3`);
  expect(status).toBe(200);
  expect(body).toContain('<lab-root></lab-root>');
  expect(body).not.toContain('Product 3');
});

test('Section 3: the None fallback does not render an id that was not prerendered', async ({ request }) => {
  const built = await rawHtml(request, `${ROUTES}/shelf-none/1`);
  expect(built.body).toContain('<h2>Product 1</h2>');

  const { status, body } = await rawHtml(request, `${ROUTES}/shelf-none/3`);
  expect(status).toBe(404);
  expect(body).toContain('Cannot GET /m32/routes/shelf-none/3');
});

test('Section 3: route headers and status reach the response', async ({ request }) => {
  const server = await rawHtml(request, `${ROUTES}/headers`);
  expect(server.status).toBe(201);
  expect(server.headers['x-lab-mode']).toBe('server');
  expect(server.body).toContain('<h2>Route page: headers</h2>');

  // A prerendered page carries the headers too; its status is always the file's 200.
  const prerendered = await rawHtml(request, `${ROUTES}/prerendered`);
  expect(prerendered.status).toBe(200);
  expect(prerendered.headers['x-lab-mode']).toBe('prerender');
});

test('Section 3: a redirect on a server-rendered route is an HTTP redirect', async ({ request }) => {
  const response = await request.get(`${SSR_ORIGIN}${ROUTES}/old`, { maxRedirects: 0 });
  expect(response.status()).toBe(301);
  expect(response.headers()['location']).toBe(`${ROUTES}/server`);

  // A prerendered route with a redirect cannot set a status: the server answers 302.
  const moved = await request.get(`${SSR_ORIGIN}${ROUTES}/moved`, { maxRedirects: 0 });
  expect(moved.status()).toBe(302);
  expect(moved.headers()['location']).toBe(`${ROUTES}/prerendered`);
  await expect(distFile('browser/m32/routes/moved/index.html')).rejects.toThrow('is missing');
});
