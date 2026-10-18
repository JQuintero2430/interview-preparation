// Section 9: deployment-facing behavior of the production build of `ssr-lab` (port 4400).
// The project's `security.allowedHosts` is `["localhost"]`; `m32/deploy/greeting` is RenderMode.Server
// with a `Cache-Control` header in its server route.
import { expect, test } from '@playwright/test';
import { rawHtml, SSR_ORIGIN } from '../support/ssr.js';

test('Section 9: a request with an unknown Host header gets 400', async ({ request }) => {
  const response = await request.get(`${SSR_ORIGIN}/m32/deploy/greeting`, { headers: { Host: 'evil.example' } });

  // The engine answers before rendering: a plain-text 400 that names the rejected header.
  expect(response.status()).toBe(400);
  expect(response.headers()['content-type']).toBe('text/plain');
  expect(await response.text()).toBe('Header "host" with value "evil.example" is not allowed.');
});

test('Section 9: hashed static assets are served with a one-year max-age', async ({ request }) => {
  const { body } = await rawHtml(request, '/');
  const main = /src="(main-[A-Z0-9]+\.js)"/.exec(body)?.[1];
  if (!main) throw new Error('no main-*.js script in the home page');

  const response = await request.get(`${SSR_ORIGIN}/${main}`);

  // express.static({ maxAge: '1y' }) in the generated server.ts.
  expect(response.status()).toBe(200);
  expect(response.headers()['cache-control']).toBe('public, max-age=31536000');
});

test("Section 9: a route's Cache-Control header reaches the server-rendered response", async ({ request }) => {
  const greeting = await rawHtml(request, '/m32/deploy/greeting');
  const plain = await rawHtml(request, '/m32/why/server');

  expect(greeting.status).toBe(200);
  expect(greeting.headers['cache-control']).toBe('private, no-store');
  expect(greeting.body).toContain('<h2>Platform: language</h2>');
  // Without `headers` in its server route, a server-rendered page carries no Cache-Control at all.
  expect(plain.status).toBe(200);
  expect(plain.headers['cache-control']).toBeUndefined();
});
