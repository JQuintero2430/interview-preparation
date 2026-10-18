import { expect, test, type Browser, type Locator, type Page } from '@playwright/test';
import { computed, rect, topLayer, UI_ORIGIN } from '../support/ui.js';

// The viewport is set so the layout the page's stylesheet describes is the one measured.
const VIEWPORT = { width: 800, height: 500 };
// The tolerance of one pixel absorbs the rounding of fractional layout positions.
const PIXEL = 1;

async function openOverlayPage(browser: Browser): Promise<Page> {
  const context = await browser.newContext({ colorScheme: 'light', reducedMotion: 'no-preference', viewport: VIEWPORT });
  const page = await context.newPage();
  await page.goto(`${UI_ORIGIN}/m36/overlay`);
  await expect(page.getByRole('heading', { level: 1, name: 'Section 5: portals and overlays' })).toBeVisible();
  return page;
}

function panel(page: Page, name: string): Locator {
  return page.getByRole('group', { name, exact: true });
}

/** True when the element painted at the point is inside the element matching `selector`. */
async function insideAt(page: Page, x: number, y: number, selector: string): Promise<boolean> {
  return page.evaluate(({ px, py, sel }) => document.elementFromPoint(px, py)?.closest(sel) != null, { px: x, py: y, sel: selector });
}

test('Section 5: the overlay host is a popover in the top layer', async ({ browser }) => {
  const page = await openOverlayPage(browser);
  await page.getByRole('button', { name: 'Open note' }).click();
  const note = panel(page, 'Note');
  await expect(note).toBeVisible();

  // The host is a manual popover, shown, so it is in the top layer.
  const host = page.locator('.cdk-overlay-popover');
  await expect(host).toHaveCount(1);
  await expect(host).toHaveAttribute('popover', 'manual');
  const entries = await topLayer(page);
  expect(entries.filter((entry) => entry.classes.includes('cdk-overlay-popover'))).toHaveLength(1);

  // The host is still a child of the overlay container: the DOM position did not change, the layer did.
  expect(await host.evaluate((el) => el.parentElement?.classList.contains('cdk-overlay-container') ?? false)).toBe(true);

  // A fixed header with the largest z-index overlaps the note. Outside the note the header paints; over the note the note does.
  const header = page.locator('.m36-sticky');
  expect(await computed(header, 'z-index')).toBe('2147483647');
  // The global strategy applies on the next render: before it, the pane sits at the left edge.
  await expect.poll(async () => (await rect(note)).left).toBeGreaterThan(0);
  const headerBox = await rect(header);
  const noteBox = await rect(note);
  const y = headerBox.bottom / 2;
  expect(noteBox.top).toBeLessThan(y);
  expect(await insideAt(page, noteBox.left - 20, y, '.m36-sticky')).toBe(true);
  expect(await insideAt(page, noteBox.left + noteBox.width / 2, y, '.cdk-overlay-pane')).toBe(true);

  await page.context().close();
});

test('Section 5: a connected overlay near the bottom edge opens above its origin', async ({ browser }) => {
  const page = await openOverlayPage(browser);

  // Far from the edge the first position fits: the menu is below its button.
  const clipped = page.getByRole('button', { name: 'Open clipped menu' });
  await clipped.click();
  const menu = panel(page, 'Clipped menu');
  await expect(menu).toBeVisible();
  await expect(page.locator('.cdk-overlay-pane.m36-below')).toHaveCount(1);
  await expect(page.locator('.cdk-overlay-pane.m36-above')).toHaveCount(0);
  const clippedBox = await rect(clipped);
  expect((await rect(menu)).top).toBeGreaterThanOrEqual(clippedBox.bottom - PIXEL);
  await page.getByRole('heading', { level: 1 }).click();
  await expect(menu).toHaveCount(0);

  // The bottom button leaves no room below: the strategy falls back to the second position, above the button.
  const bottom = page.getByRole('button', { name: 'Open bottom menu' });
  await bottom.click();
  const above = panel(page, 'Bottom menu');
  await expect(above).toBeVisible();
  await expect(page.locator('.cdk-overlay-pane.m36-above')).toHaveCount(1);
  await expect(page.locator('.cdk-overlay-pane.m36-below')).toHaveCount(0);
  const bottomBox = await rect(bottom);
  const aboveBox = await rect(above);
  expect(aboveBox.bottom).toBeLessThanOrEqual(bottomBox.top + PIXEL);
  expect(aboveBox.top).toBeGreaterThanOrEqual(0);

  await page.context().close();
});

test('Section 5: Escape closes only the topmost of two overlays', async ({ browser }) => {
  const page = await openOverlayPage(browser);
  const first = panel(page, 'First overlay');
  const second = panel(page, 'Second overlay');

  await page.getByRole('button', { name: 'Open first overlay' }).click();
  await page.getByRole('button', { name: 'Open second overlay' }).click();
  await expect(first).toBeVisible();
  await expect(second).toBeVisible();

  // The second was attached last, so it is the topmost: one Escape closes it and leaves the first.
  await page.keyboard.press('Escape');
  await expect(second).toHaveCount(0);
  await expect(first).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(first).toHaveCount(0);

  // An overlay nobody subscribed to ignores Escape: a raw OverlayRef closes nothing by itself.
  await page.getByRole('button', { name: 'Open unwired overlay' }).click();
  const unwired = panel(page, 'Unwired overlay');
  await expect(unwired).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(unwired).toBeVisible();

  await page.context().close();
});

test('Section 5: an outside click closes the overlay and a click inside does not', async ({ browser }) => {
  const page = await openOverlayPage(browser);
  await page.getByRole('button', { name: 'Open clipped menu' }).click();
  const menu = panel(page, 'Clipped menu');
  await expect(menu).toBeVisible();

  await menu.getByRole('button', { name: 'Inside' }).click();
  await expect(menu).toBeVisible();

  await page.getByRole('heading', { level: 1 }).click();
  await expect(menu).toHaveCount(0);

  await page.context().close();
});

test('Section 5: a clipped container does not clip the overlay', async ({ browser }) => {
  const page = await openOverlayPage(browser);
  const clip = page.locator('.m36-clip');
  expect(await computed(clip, 'overflow')).toBe('hidden');

  await clip.getByRole('button', { name: 'Open clipped menu' }).click();
  const menu = panel(page, 'Clipped menu');
  await expect(menu).toBeVisible();
  await expect(page.locator('.cdk-overlay-pane.m36-below')).toHaveCount(1);

  // The overlay is not a descendant of the clip, and its lower part, below the clip's box, still receives the pointer.
  await expect(clip.locator('.cdk-overlay-pane')).toHaveCount(0);
  const clipBox = await rect(clip);
  const menuBox = await rect(menu);
  expect(menuBox.bottom).toBeGreaterThan(clipBox.bottom);
  expect(await insideAt(page, menuBox.left + menuBox.width / 2, (clipBox.bottom + menuBox.bottom) / 2, '.cdk-overlay-pane')).toBe(true);

  await page.context().close();
});
