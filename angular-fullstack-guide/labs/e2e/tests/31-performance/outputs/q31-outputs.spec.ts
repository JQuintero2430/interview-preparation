import { expect, test, type Page } from '@playwright/test';
import { cdp, collectEntries, countInstances, distFile, forceGc } from '../support/perf.js';

const ORIGIN = 'http://localhost:4300';

/** A routed image of about 3 KB: Chromium leaves low-entropy images (few bytes per pixel) out of LCP, so a flat one would never be a candidate. */
const HERO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200">${Array.from(
  { length: 60 },
  (_, index) =>
    `<rect x="${(index * 37) % 380}" y="${(index * 53) % 180}" width="${10 + (index % 7) * 5}" height="${10 + (index % 5) * 6}" fill="rgb(${(index * 31) % 256},${(index * 67) % 256},${(index * 97) % 256})"/>`,
).join('')}</svg>`;

/** Serves a made-up HTML page from the lab's own origin and navigates to it (a real navigation, so LCP and layout shifts are recorded). */
async function servePage(page: Page, name: string, body: string): Promise<void> {
  const url = `${ORIGIN}/__m31/${name}`;
  await page.route(url, (route) => route.fulfill({ contentType: 'text/html', body }));
  await page.goto(url);
}

/** Resolves after two animation frames, so the browser has had the chance to lay out and paint what the page just changed. */
function afterFrames(page: Page): Promise<void> {
  return page.evaluate(
    () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))),
  );
}

/** Waits until the browser has recorded at least `count` entries of the type. */
async function waitForEntries(page: Page, type: string, count: number): Promise<void> {
  await expect.poll(async () => (await collectEntries(page, type)).length).toBeGreaterThanOrEqual(count);
}

test('Q31.03 a buffered observer reports the heading and then the image, and nothing after the click', async ({ page }) => {
  await page.route(`${ORIGIN}/__m31/hero.svg`, (route) => route.fulfill({ contentType: 'image/svg+xml', body: HERO_SVG }));
  await servePage(page, 'q31-03', '<!doctype html><title>q31-03</title><h1>Small heading</h1>');
  await waitForEntries(page, 'largest-contentful-paint', 1);

  // The image is added once the heading's entry exists, so the order does not depend on a timer.
  await page.evaluate(() => {
    const hero = document.createElement('img');
    hero.src = '/__m31/hero.svg';
    hero.alt = 'Hero';
    hero.width = 400;
    hero.height = 200;
    document.body.append(hero);
  });
  await waitForEntries(page, 'largest-contentful-paint', 2);

  await page.getByRole('heading', { name: 'Small heading' }).click();
  await page.evaluate(() => {
    const block = document.createElement('p');
    block.id = 'late';
    block.textContent = 'A much larger block of text. '.repeat(400);
    document.body.append(block);
  });
  await afterFrames(page);

  await expect(page.locator('#late')).toBeVisible();
  const entries = await collectEntries(page, 'largest-contentful-paint');
  expect(entries).toHaveLength(2);
  expect(entries.map((entry) => entry.element)).toEqual(['H1', 'IMG']);
});

test('Q31.04 a banner above painted content shifts it once; the same banner in a reserved box shifts nothing', async ({ page }) => {
  await servePage(page, 'q31-04-open', '<!doctype html><title>q31-04</title><p id="content">Content that sits at the top.</p>');
  await waitForEntries(page, 'largest-contentful-paint', 1);

  await page.evaluate(() => {
    const banner = document.createElement('div');
    banner.textContent = 'Banner';
    banner.style.height = '100px';
    document.body.prepend(banner);
  });
  await waitForEntries(page, 'layout-shift', 1);
  await afterFrames(page);

  const shifts = await collectEntries(page, 'layout-shift');
  expect(shifts).toHaveLength(1);
  expect(shifts.map((shift) => shift.hadRecentInput)).toEqual([false]);
  expect(shifts.every((shift) => (shift.value ?? 0) > 0)).toBe(true);

  await servePage(
    page,
    'q31-04-reserved',
    '<!doctype html><title>q31-04</title><div id="slot" style="height: 100px"></div><p id="content">Content below the slot.</p>',
  );
  await waitForEntries(page, 'largest-contentful-paint', 1);

  const before = await page.locator('#content').boundingBox();
  await page.evaluate(() => {
    const banner = document.createElement('div');
    banner.textContent = 'Banner';
    banner.style.height = '100px';
    document.getElementById('slot')?.append(banner);
  });
  await afterFrames(page);

  await expect(page.getByText('Banner')).toBeVisible();
  expect(await page.locator('#content').boundingBox()).toEqual(before);
  expect(await collectEntries(page, 'layout-shift')).toHaveLength(0);
});

/** What the long-list page's lab hook returns from the viewport's `getRenderedRange()`. */
interface RenderedRange {
  start: number;
  end: number;
}

/** Reads the CDK viewport's rendered range through the page's lab instrumentation hook. */
function renderedRange(page: Page): Promise<RenderedRange> {
  return page.evaluate<RenderedRange>('window.__m31LongList.getRenderedRange()');
}

test('Q31.09 a 400 px viewport of 40 px rows renders 15 rows at the top and 18 after scrolling to row 5000', async ({ page }) => {
  await page.goto('/m31/long-list');

  await expect(page.locator('.row')).toHaveCount(15);
  expect(await renderedRange(page)).toEqual({ start: 0, end: 15 });

  await page.evaluate('window.__m31LongList.scrollToIndex(5000)');

  await expect(page.locator('.row')).toHaveCount(18);
  expect(await renderedRange(page)).toEqual({ start: 4997, end: 5015 });
  await expect(page.getByText('Row 5000', { exact: true })).toBeVisible();
});

/** One marker string per fixture module under `demo/tree-shaking/`; the page imports only the first through the barrel. */
const MARKER_USED = 'M31_MARKER_USED';
const MARKER_UNUSED_PURE = 'M31_MARKER_UNUSED_PURE';
const MARKER_SIDE_EFFECT = 'M31_MARKER_SIDE_EFFECT';
const MARKER_STATIC_BLOCK = 'M31_MARKER_STATIC_BLOCK';

/** Reads every built script listed in `browser-stats.json` (read-only, from the production build's `browser/` folder). */
async function builtScripts(): Promise<string[]> {
  const parsed: unknown = JSON.parse(await distFile('browser-stats.json'));
  const outputs: unknown = typeof parsed === 'object' && parsed !== null && 'outputs' in parsed ? parsed.outputs : undefined;
  if (typeof outputs !== 'object' || outputs === null) throw new Error('browser-stats.json has no outputs map');
  const scripts = Object.keys(outputs).filter((path) => path.endsWith('.js'));
  return Promise.all(scripts.map((path) => distFile(`browser/${path.replace(/^browser\//, '')}`)));
}

test('Q31.15 through a barrel the unused pure function is dropped, while the side-effect file and the static-block class stay', async () => {
  const scripts = await builtScripts();
  const filesWith = (marker: string): number => scripts.filter((text) => text.includes(marker)).length;

  expect(filesWith(MARKER_USED)).toBeGreaterThan(0);
  expect(filesWith(MARKER_UNUSED_PURE)).toBe(0);
  expect(filesWith(MARKER_SIDE_EFFECT)).toBeGreaterThan(0);
  expect(filesWith(MARKER_STATIC_BLOCK)).toBeGreaterThan(0);
});

const LEAKS_URL = `${ORIGIN}/m31/leaks`;
const PANEL_CYCLES = 10;

/** One panel of the leaks page: its toggle button, its region and the prototype the page exposes (lab instrumentation). */
interface PanelVariant {
  button: string;
  region: string;
  prototype: string;
}

const LEAKY_PANEL: PanelVariant = { button: 'Toggle leaky panel', region: 'Leaky panel', prototype: 'window.__m31Leaks.leakyPanel' };
const FIXED_PANEL: PanelVariant = { button: 'Toggle fixed panel', region: 'Fixed panel', prototype: 'window.__m31Leaks.fixedPanel' };

/** Opens and closes the variant's panel ten times on a fresh page, forces a collection and counts the instances that remain. */
async function survivingInstances(page: Page, variant: PanelVariant): Promise<number> {
  await page.goto(LEAKS_URL);
  await expect(page.getByRole('heading', { name: 'Memory leaks lab', level: 1 })).toBeVisible();
  const button = page.getByRole('button', { name: variant.button });
  const panel = page.getByRole('region', { name: variant.region });
  for (let cycle = 0; cycle < PANEL_CYCLES; cycle++) {
    await button.click();
    await expect(panel).toBeVisible();
    await button.click();
    await expect(panel).toHaveCount(0);
  }
  const session = await cdp(page);
  await forceGc(session);
  const count = await countInstances(session, variant.prototype);
  await session.detach();
  return count;
}

test('Q31.22 after ten open-close cycles and a forced collection 10 leaky panels survive and 0 fixed ones', async ({ page }) => {
  expect(await survivingInstances(page, LEAKY_PANEL)).toBe(PANEL_CYCLES);

  // A fresh page for the second variant, so the array `Runtime.queryObjects` returned above cannot keep anything alive.
  const freshPage = await page.context().newPage();
  expect(await survivingInstances(freshPage, FIXED_PANEL)).toBe(0);
  await freshPage.close();
});
