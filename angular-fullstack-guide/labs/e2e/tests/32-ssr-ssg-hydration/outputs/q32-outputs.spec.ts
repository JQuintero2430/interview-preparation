// Output answers of the module 32 question bank. Each test title starts with the question it asserts.
import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { apiRequests, consoleErrors, distFile, holdScripts, rawHtml, scriptRequests, SSR_ORIGIN, stateScript } from '../support/ssr.js';

const DIST = new URL('../../../../angular/dist/ssr-lab/', import.meta.url);
const ANGULAR = new URL('../../../../angular/', import.meta.url);

const PRODUCT = 'Trail running shoe';
const SERVER_TITLE = '<title>Trail running shoe | Lab shop</title>';
const DEFAULT_TITLE = '<title>SsrLab</title>';
const DESCRIPTION = '<meta name="description" content="A light trail running shoe with a grippy sole.">';
const EMPTY_ROOT = '<lab-root></lab-root>';
const MAIN = /\/main-[^/]*\.js$/;
const CHUNK = /\/chunk-[^/]*\.js$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** Reads a JSON file and returns it as an untyped record, so each test narrows what it needs. */
async function readJson(url: URL): Promise<Record<string, unknown>> {
  const parsed: unknown = JSON.parse(await readFile(url, 'utf8'));
  if (!isRecord(parsed)) throw new Error(`${url.pathname} is not a JSON object`);
  return parsed;
}

test('Q32.03 a client that runs no JavaScript gets an empty root from the Client route and the full page from the Server route', async ({
  request,
}) => {
  const client = await rawHtml(request, '/m32/why/client');
  expect(client.status).toBe(200);
  expect(client.body).toContain(DEFAULT_TITLE);
  expect(client.body).toContain(EMPTY_ROOT);
  expect(client.body).not.toContain('name="description"');
  expect(client.body).not.toContain(PRODUCT);

  const server = await rawHtml(request, '/m32/why/server');
  expect(server.status).toBe(200);
  expect(server.body).toContain(SERVER_TITLE);
  expect(server.body).toContain(DESCRIPTION);
  expect(server.body).toContain(`<h2>${PRODUCT}</h2>`);
  expect(server.body).not.toContain(DEFAULT_TITLE);
  expect(server.body).not.toContain(EMPTY_ROOT);
});

test('Q32.05 the build writes browser and server folders, one index.html per prerendered route, and server.mjs starts the server', async () => {
  const root = await readdir(fileURLToPath(DIST));
  expect(root).toEqual(expect.arrayContaining(['browser', 'server', 'prerendered-routes.json']));

  // Every prerendered route is a folder with an index.html in browser/; the home page is browser/index.html.
  const browserFiles = await readdir(fileURLToPath(new URL('browser/', DIST)), { recursive: true });
  const pages = browserFiles.filter((name) => name === 'index.html' || name.endsWith('/index.html')).sort();
  expect(pages).toEqual(
    expect.arrayContaining([
      'index.html',
      'm32/routes/prerendered/index.html',
      'm32/routes/products/1/index.html',
      'm32/routes/products/2/index.html',
    ]),
  );
  const prerendered = await readJson(new URL('prerendered-routes.json', DIST));
  const routes = prerendered['routes'];
  if (!isRecord(routes)) throw new Error('prerendered-routes.json has no routes object');
  const expectedPages = Object.keys(routes)
    .map((route) => (route === '/' ? 'index.html' : `${route.slice(1)}/index.html`))
    .sort();
  expect(pages).toEqual(expectedPages);
  expect(browserFiles).toContain('index.csr.html');

  // The server folder holds the bundle and the document template for server renders, not a page per route.
  const serverFiles = await readdir(fileURLToPath(new URL('server/', DIST)), { recursive: true });
  expect(serverFiles).toEqual(expect.arrayContaining(['server.mjs', 'main.server.mjs', 'index.server.html']));
  expect(serverFiles.filter((name) => name.endsWith('/index.html') || name === 'index.html')).toEqual([]);

  // `ssr.entry` is the file the build turns into server/server.mjs, and the script runs that file.
  const workspace = await readJson(new URL('angular.json', ANGULAR));
  const project = isRecord(workspace['projects']) ? workspace['projects']['ssr-lab'] : undefined;
  const architect = isRecord(project) ? project['architect'] : undefined;
  const build = isRecord(architect) ? architect['build'] : undefined;
  const options = isRecord(build) ? build['options'] : undefined;
  if (!isRecord(options)) throw new Error('angular.json has no ssr-lab build options');
  expect(options['outputMode']).toBe('server');
  const ssr = options['ssr'];
  expect(isRecord(ssr) ? ssr['entry'] : undefined).toBe('projects/ssr-lab/src/server.ts');

  const manifest = await readJson(new URL('package.json', ANGULAR));
  const scripts = manifest['scripts'];
  expect(isRecord(scripts) ? scripts['serve:ssr:ssr-lab'] : undefined).toBe('node dist/ssr-lab/server/server.mjs');
  expect((await distFile('server/server.mjs')).length).toBeGreaterThan(0);
});

test('Q32.07 ids 1 and 2 are files on all three fallback routes, and id 3 is rendered, sent as a shell or refused', async ({
  request,
}) => {
  for (const fallback of ['server', 'client', 'none']) {
    const route = `/m32/fallbacks/${fallback}`;

    // Built ids: the response is the file the build wrote, stamped `ng-server-context="ssg"`.
    for (const id of ['1', '2']) {
      const file = await distFile(`browser${route}/${id}/index.html`);
      expect(file).toContain(`<h2>Fallback product ${id}</h2>`);
      expect(file).toContain('ng-server-context="ssg"');
      const built = await rawHtml(request, `${route}/${id}`);
      expect(built.status).toBe(200);
      expect(built.body).toBe(file);
    }

    // No file for id 3 on any of them: the fallback decides the answer.
    await expect(distFile(`browser${route}/3/index.html`)).rejects.toThrow('is missing');
  }

  const server = await rawHtml(request, '/m32/fallbacks/server/3');
  expect(server.status).toBe(200);
  expect(server.body).toContain('<h2>Fallback product 3</h2>');
  expect(server.body).toContain('ng-server-context="ssr"');

  const client = await rawHtml(request, '/m32/fallbacks/client/3');
  expect(client.status).toBe(200);
  expect(client.body).toContain(EMPTY_ROOT);
  expect(client.body).not.toContain('Fallback product');

  const none = await rawHtml(request, '/m32/fallbacks/none/3');
  expect(none.status).toBe(404);
  expect(none.body).toContain('Cannot GET /m32/fallbacks/none/3');
  expect(none.body).not.toContain('Fallback product');
});

test('Q32.11 a node marked before the app boots survives hydration, except inside an ngSkipHydration component', async ({ page }) => {
  const release = await holdScripts(page, MAIN);
  await page.goto(`${SSR_ORIGIN}/m32/hydration/skip`, { waitUntil: 'commit' });
  const heading = page.getByRole('heading', { name: 'Hydration: skipped child' });
  const card = page.getByText('Skipped card content');
  await expect(card).toBeVisible();

  // The script is held, so these two nodes are the server's. The marker is a property no template writes.
  await heading.evaluate((node) => Object.assign(node, { labMarked: true }));
  await card.evaluate((node) => Object.assign(node, { labMarked: true }));

  await release();
  await page.getByRole('button', { name: 'Clicks: 0' }).click();
  await expect(page.getByRole('button', { name: 'Clicks: 1' })).toBeVisible();

  const stillMarked = (locator: typeof heading) => locator.evaluate((node) => 'labMarked' in node);
  expect(await stillMarked(heading)).toBe(true);
  expect(await stillMarked(card)).toBe(false);
  await expect(card).toHaveCount(1);
});

test('Q32.12 an @if on isPlatformBrowser raises no hydration error and the browser branch replaces the server branch', async ({
  page,
  request,
}) => {
  const server = await rawHtml(request, '/m32/hydration/branch-swap');
  expect(server.body).toContain('<article>Server branch</article>');
  expect(server.body).not.toContain('Browser branch');

  const errors = consoleErrors(page);
  const release = await holdScripts(page, MAIN);
  await page.goto(`${SSR_ORIGIN}/m32/hydration/branch-swap`, { waitUntil: 'commit' });
  await expect(page.getByText('Server branch')).toBeVisible();
  await release();

  await page.getByRole('button', { name: 'Clicks: 0' }).click();
  await expect(page.getByRole('button', { name: 'Clicks: 1' })).toBeVisible();
  await expect(page.getByText('Browser branch')).toBeVisible();
  await expect(page.getByText('Server branch')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('Q32.13 a click made before the app loads is replayed once, so the counter shows 1', async ({ page, request }) => {
  const { body } = await rawHtml(request, '/m32/replay/cart');
  expect(body).toContain('<button type="button" jsaction="click:;">Add to cart</button>');

  const release = await holdScripts(page, MAIN);
  await page.goto(`${SSR_ORIGIN}/m32/replay/cart`, { waitUntil: 'commit' });
  const items = page.getByRole('status');
  await expect(items).toHaveText('0');
  await page.getByRole('button', { name: 'Add to cart' }).click();
  await expect(items).toHaveText('0');

  await release();
  await expect(items).toHaveText('1');
  // One more click on the live listener makes 2: the replayed click had been counted once, not twice.
  await page.getByRole('button', { name: 'Add to cart' }).click();
  await expect(items).toHaveText('2');
});

test('Q32.15 the HTML holds the hydrate blocks and the viewport placeholder; chunks load for the viewport and the interaction only', async ({
  page,
  request,
}) => {
  const browserDir = new URL('browser/', DIST);
  const chunkOf = async (className: string): Promise<string> => {
    for (const file of (await readdir(fileURLToPath(browserDir))).filter((name) => name.startsWith('chunk-'))) {
      if ((await distFile(`browser/${file}`)).includes(` as ${className}}`)) return file;
    }
    throw new Error(`no chunk exports ${className}`);
  };
  const countOf = (urls: string[], file: string): number => urls.filter((url) => url.endsWith(`/${file}`)).length;
  const related = await chunkOf('LabM32IncrementalRelated');
  const reviews = await chunkOf('LabM32IncrementalReviews');
  const footer = await chunkOf('LabM32IncrementalFooter');

  const { body } = await rawHtml(request, '/m32/incremental/product');
  // hydrate on interaction: the content, the block id and the trigger's events on the root.
  expect(body).toContain('<section jsaction="click:;keydown:;" ngb="d2"><lab-m32-incremental-reviews');
  // hydrate never: the content, with no jsaction and no ngb on its root.
  expect(body).toContain('<footer><lab-m32-incremental-footer><p>Shipping and returns: 30 days.</p>');
  // on viewport: the placeholder only, and no block id for it.
  expect(body).toContain('<p>Related products placeholder</p>');
  expect(body).not.toContain('Related: desk lamp');
  expect(body.match(/ngb="d\d"/g)).not.toContain('ngb="d4"');

  // A short window keeps the placeholder below the fold, so scrolling is what brings it into view.
  await page.setViewportSize({ width: 400, height: 200 });
  const scripts = scriptRequests(page, CHUNK);
  await page.goto(`${SSR_ORIGIN}/m32/incremental/product`);
  await expect(page.getByLabel('Page state')).toHaveText('hydrated');
  for (const file of [related, reviews, footer]) expect(countOf(scripts, file)).toBe(0);

  await page.getByText('Related products placeholder').scrollIntoViewIfNeeded();
  await expect(page.getByText('Related: desk lamp')).toBeVisible();
  expect([countOf(scripts, related), countOf(scripts, reviews), countOf(scripts, footer)]).toEqual([1, 0, 0]);

  const before = scripts.length;
  await page.getByRole('heading', { name: 'Reviews' }).click();
  await expect.poll(() => countOf(scripts, reviews)).toBe(1);
  await page.getByText('Shipping and returns: 30 days.').click();
  await page.getByRole('button', { name: 'Helpful' }).click();
  await expect(page.getByLabel('Helpful votes')).toHaveText('1');
  expect(scripts.slice(before).map((url) => url.slice(url.lastIndexOf('/') + 1))).toEqual([reviews]);
  expect(countOf(scripts, footer)).toBe(0);
});

test('Q32.20 a server render gets its status from RESPONSE_INIT and its header from REQUEST, and the prerendered page has neither', async ({
  request,
}) => {
  const notFound = await rawHtml(request, '/m32/platform/not-found-page');
  expect(notFound.status).toBe(404);
  expect(notFound.body).toContain('<h2>Not found</h2>');

  const language = new URL('/m32/platform/language', SSR_ORIGIN).href;
  const french = await request.get(language, { headers: { 'Accept-Language': 'fr-CA' } });
  expect(french.status()).toBe(200);
  expect(await french.text()).toContain('<output aria-label="Language">fr-CA</output>');

  // The prerendered copy is a file written at build time; a request header cannot reach it.
  const file = await distFile('browser/m32/platform/language-static/index.html');
  expect(file).toContain('<output aria-label="Language">no request</output>');
  const built = await request.get(new URL('/m32/platform/language-static', SSR_ORIGIN).href, {
    headers: { 'Accept-Language': 'fr-CA' },
  });
  expect(built.status()).toBe(200);
  expect(await built.text()).toBe(file);
});

test('Q32.22 the first load makes no browser request, each later arrival makes one, and transferCache false makes one on the first load', async ({
  page,
  request,
}) => {
  const calls = apiRequests(page);
  const cacheKeys = (html: string): string[] => {
    const state = stateScript(html);
    return typeof state === 'object' && state !== null ? Object.keys(state).filter((key) => /^[0-9a-f]{64}$/.test(key)) : [];
  };

  // The server stored its response under one hashed key.
  const cached = await rawHtml(request, '/m32/data/products');
  expect(cacheKeys(cached.body)).toHaveLength(1);

  // First load: the browser's HttpClient is answered from the state script.
  await page.goto(`${SSR_ORIGIN}/m32/data/products`);
  await expect(page.getByLabel('Stable')).toHaveText('yes');
  await expect(page.getByRole('listitem')).toHaveText(['Keyboard', 'Mouse', 'Monitor']);
  expect(calls).toEqual([]);

  // Away and back, both client-side: the cache is off, so each arrival asks the API.
  await page.getByRole('link', { name: 'Open the list again' }).click();
  await expect(page).toHaveURL(`${SSR_ORIGIN}/m32/data/products-again`);
  await expect(page.getByLabel('Stable')).toHaveText('yes');
  expect(calls).toEqual(['GET /api/catalog']);
  await page.goBack();
  await expect(page).toHaveURL(`${SSR_ORIGIN}/m32/data/products`);
  await expect(page.getByLabel('Stable')).toHaveText('yes');
  expect(calls).toEqual(['GET /api/catalog', 'GET /api/catalog']);

  // transferCache: false: the server renders the list but stores nothing, so the first load asks once.
  const uncached = await rawHtml(request, '/m32/data-uncached');
  expect(uncached.body).toContain('<li>Keyboard</li><li>Mouse</li><li>Monitor</li>');
  expect(cacheKeys(uncached.body)).toEqual([]);
  const fresh = await page.context().newPage();
  const freshCalls = apiRequests(fresh);
  await fresh.goto(`${SSR_ORIGIN}/m32/data-uncached`);
  await expect(fresh.getByLabel('Stable')).toHaveText('yes');
  await expect(fresh.getByRole('listitem')).toHaveText(['Keyboard', 'Mouse', 'Monitor']);
  expect(freshCalls).toEqual(['GET /api/catalog']);
});
