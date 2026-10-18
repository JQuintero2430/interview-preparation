// Section 2: what the build of the `ssr-lab` project writes and what the generated server answers.
// The files are read from `labs/angular/dist/ssr-lab`, the folder the server on port 4400 runs from.
import { readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { distFile, rawHtml } from '../support/ssr.js';

const DIST = new URL('../../../../angular/dist/ssr-lab/', import.meta.url);

test('Section 2: the build writes a browser folder and a server folder', async () => {
  const root = await readdir(fileURLToPath(DIST));
  expect(root).toEqual(expect.arrayContaining(['browser', 'server', 'prerendered-routes.json']));

  const browser = await readdir(fileURLToPath(new URL('browser/', DIST)));
  expect(browser).toEqual(expect.arrayContaining(['index.html', 'index.csr.html', 'favicon.ico']));
  expect(browser.some((name) => /^main-.+\.js$/.test(name))).toBe(true);

  const server = await readdir(fileURLToPath(new URL('server/', DIST)));
  expect(server).toEqual(expect.arrayContaining(['server.mjs', 'main.server.mjs', 'index.server.html']));
  expect(server.some((name) => name.endsWith('.js'))).toBe(false);
});

test('Section 2: prerendered routes are written as index.html files at build time', async () => {
  const prerendered = JSON.parse(await distFile('prerendered-routes.json')) as { routes: Record<string, unknown> };
  expect(Object.keys(prerendered.routes)).toContain('/');

  const page = await distFile('browser/index.html');
  expect(page).toContain('<h2>Module 32 SSR lab</h2>');

  const shell = await distFile('browser/index.csr.html');
  expect(shell).toContain('<lab-root></lab-root>');
  expect(shell).not.toContain('Module 32 SSR lab');

  // The server bundle carries all three documents as assets.
  const manifest = await distFile('server/angular-app-manifest.mjs');
  for (const asset of ['index.html', 'index.csr.html', 'index.server.html']) {
    expect(manifest).toContain(`'${asset}':`);
  }
});

test('Section 2: the server answers a deep link with the HTML of that page', async ({ request }) => {
  const { status, body } = await rawHtml(request, '/m32/setup/orders/42');
  expect(status).toBe(200);
  expect(body).toContain('<h2>Order 42 detail</h2>');
  expect(body).not.toContain('Module 32 SSR lab');

  // No file in the browser folder answers this path: the engine rendered it.
  await expect(distFile('browser/m32/setup/orders/42/index.html')).rejects.toThrow('is missing');
});
