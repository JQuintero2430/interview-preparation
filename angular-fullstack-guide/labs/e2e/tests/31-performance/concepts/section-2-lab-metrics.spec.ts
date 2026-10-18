import { expect, test, type Page } from '@playwright/test';
import { runLighthouse } from '../support/lighthouse.js';
import { cdp, collectEntries, domCounters, forceGc } from '../support/perf.js';

const ORIGIN = 'http://localhost:4300';

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

/** Waits until the browser has recorded at least one entry of the type. */
async function firstEntry(page: Page, type: string): Promise<void> {
  await expect.poll(async () => (await collectEntries(page, type)).length).toBeGreaterThan(0);
}

test('Section 2: the LCP entry names the largest element painted before input', async ({ page }) => {
  await servePage(page, 'lcp', '<!doctype html><title>lcp</title><h1>Small heading</h1>');
  await firstEntry(page, 'largest-contentful-paint');

  await page.keyboard.press('a');
  await page.evaluate(() => {
    const block = document.createElement('p');
    block.id = 'late';
    block.textContent = 'A much larger block of text. '.repeat(400);
    document.body.append(block);
  });
  await afterFrames(page);

  await expect(page.locator('#late')).toBeVisible();
  const entries = await collectEntries(page, 'largest-contentful-paint');
  expect(entries.length).toBeGreaterThan(0);
  expect(entries.map((entry) => entry.element)).toEqual(entries.map(() => 'H1'));
});

test('Section 2: content inserted above the fold produces a layout-shift entry', async ({ page }) => {
  await servePage(page, 'shift', '<!doctype html><title>shift</title><p id="content">Content that sits at the top.</p>');
  await firstEntry(page, 'largest-contentful-paint');

  await page.evaluate(() => {
    const banner = document.createElement('div');
    banner.textContent = 'Banner';
    banner.setAttribute('style', 'height: 120px');
    document.body.prepend(banner);
  });

  await expect.poll(async () => (await collectEntries(page, 'layout-shift')).length).toBeGreaterThan(0);
  const shifts = await collectEntries(page, 'layout-shift');
  expect(shifts.every((shift) => shift.entryType === 'layout-shift' && shift.hadRecentInput === false)).toBe(true);
});

test('Section 2: reserved space produces no layout-shift entry', async ({ page }) => {
  await servePage(
    page,
    'reserved',
    '<!doctype html><title>reserved</title><div id="slot" style="height: 120px"></div><p id="content">Content below the slot.</p>',
  );
  await firstEntry(page, 'largest-contentful-paint');

  const before = await page.locator('#content').boundingBox();
  await page.evaluate(() => {
    const banner = document.createElement('div');
    banner.textContent = 'Banner';
    banner.setAttribute('style', 'height: 120px');
    document.getElementById('slot')?.append(banner);
  });
  await afterFrames(page);

  await expect(page.getByText('Banner')).toBeVisible();
  expect(await page.locator('#content').boundingBox()).toEqual(before);
  expect(await collectEntries(page, 'layout-shift')).toHaveLength(0);
});

test("Section 2: the CDP counters report the page's DOM nodes", async ({ page }) => {
  await servePage(page, 'nodes', '<!doctype html><title>nodes</title><body></body>');
  const session = await cdp(page);
  const inserted = 25;

  await forceGc(session);
  const before = await domCounters(session);
  await page.evaluate((count) => {
    for (let index = 0; index < count; index++) document.body.append(document.createElement('div'));
  }, inserted);
  await forceGc(session);
  const after = await domCounters(session);

  expect(after.nodes - before.nodes).toBe(inserted);
  expect(after.documents).toBe(before.documents);
});

test('Section 2: Lighthouse reports a performance category and the LCP audit for the landing page', async () => {
  test.setTimeout(120_000);
  const lhr = await runLighthouse();

  expect(typeof lhr.lighthouseVersion).toBe('string');
  expect(typeof lhr.categories['performance']?.score).toBe('number');
  expect(typeof lhr.audits['largest-contentful-paint']?.numericValue).toBe('number');
});
