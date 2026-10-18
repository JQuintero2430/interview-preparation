import { readdir, readFile } from 'node:fs/promises';
import { expect, test, type Browser, type Locator, type Page, type ViewportSize } from '@playwright/test';
import { computed, dragBy, rect, sysVar, topLayer, UI_ORIGIN } from '../support/ui.js';

const BUILD = new URL('../../../../angular/dist/material-lab/browser/', import.meta.url);
const STYLES_FILE = /^styles-.*\.css$/;
// The theme's own rule: the built stylesheet starts with `@charset "UTF-8";`, so `html` may follow `;`, `}` or the start.
const PRIMARY_DECLARATION = /(?:^|[;}\s])html\s*\{[^}]*?--mat-sys-primary:\s*light-dark\(\s*([^,]+?)\s*,\s*([^)]+?)\s*\)/;
// The viewport is set so the layout the page's stylesheet describes is the one measured.
const VIEWPORT = { width: 800, height: 500 };
const PIXEL = 1;

interface SchemeColors {
  readonly light: string;
  readonly dark: string;
}

/** The light and dark values of `--mat-sys-primary` as compiled into the production stylesheet, never typed by hand. */
async function compiledPrimary(): Promise<SchemeColors> {
  const names = (await readdir(BUILD).catch(() => [])).filter((name) => STYLES_FILE.test(name));
  if (names.length !== 1) throw new Error('dist/material-lab/browser needs one styles-*.css: run the e2e suite (its web server builds material-lab)');
  const match = PRIMARY_DECLARATION.exec(await readFile(new URL(names[0], BUILD), 'utf8'));
  if (!match) throw new Error('no light-dark() declaration of --mat-sys-primary on html in the built stylesheet');
  return { light: match[1], dark: match[2] };
}

/** The browser's serialisation of a CSS color (e.g. `#005cbb` becomes `rgb(0, 92, 187)`), so it compares with computed styles. */
async function asComputedColor(page: Page, color: string): Promise<string> {
  return page.evaluate((value) => {
    const probe = document.createElement('span');
    probe.style.color = value;
    document.body.append(probe);
    const result = getComputedStyle(probe).color;
    probe.remove();
    return result;
  }, color);
}

async function open(browser: Browser, path: string, colorScheme: 'light' | 'dark', heading: string): Promise<Page> {
  const context = await browser.newContext({ colorScheme, reducedMotion: 'no-preference', viewport: VIEWPORT });
  const page = await context.newPage();
  await page.goto(`${UI_ORIGIN}/m36/outputs/${path}`);
  await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
  return page;
}

function swatch(page: Page, region: string): Locator {
  return page.getByRole('region', { name: region }).getByText('Primary', { exact: true });
}

test('Q36.06 --mat-sys-primary stays one light-dark() pair; the color it paints is the light hex under light, the dark hex under dark, and the dark hex in a color-scheme: dark subtree in either', async ({ browser }) => {
  const { light, dark } = await compiledPrimary();
  const expected = { light: { page: light, dark, forcedLight: light }, dark: { page: dark, dark, forcedLight: light } };

  for (const scheme of ['light', 'dark'] as const) {
    const page = await open(browser, 'q36-06', scheme, 'Q36.06: one theme, three color schemes');
    const lightHex = await asComputedColor(page, light);
    const darkHex = await asComputedColor(page, dark);
    expect(lightHex).not.toBe(darkHex);

    // The variable itself is never resolved: it holds the pair, on html and inside the dark subtree alike.
    const onHtml = await sysVar(page, '--mat-sys-primary');
    expect(onHtml).toMatch(/^light-dark\(/);
    expect(await sysVar(page, '--mat-sys-primary', '.m36-out-dark')).toBe(onHtml);

    // Each element's own color-scheme picks the half when a property uses the variable.
    expect(await computed(page.getByRole('region', { name: 'Dark subtree' }), 'color-scheme')).toBe('dark');
    expect(await computed(swatch(page, 'Page scheme'), 'background-color')).toBe(await asComputedColor(page, expected[scheme].page));
    expect(await computed(swatch(page, 'Dark subtree'), 'background-color')).toBe(await asComputedColor(page, expected[scheme].dark));
    expect(await computed(swatch(page, 'Light subtree'), 'background-color')).toBe(await asComputedColor(page, expected[scheme].forcedLight));

    await page.context().close();
  }
});

function panel(page: Page, name: string): Locator {
  return page.getByRole('group', { name, exact: true });
}

test('Q36.10 an overlay below a button at the bottom edge is a popover host in the top layer, takes the above position, and closes on Escape and on an outside click', async ({ browser }) => {
  const page = await open(browser, 'q36-10', 'light', 'Q36.10: an overlay near the bottom edge');
  const trigger = page.getByRole('button', { name: 'Open bottom menu' });
  await trigger.click();
  const menu = panel(page, 'Bottom menu');
  await expect(menu).toBeVisible();

  // The host is a shown manual popover carrying the CDK's class, so it is in the top layer.
  const host = page.locator('.cdk-overlay-popover');
  await expect(host).toHaveCount(1);
  await expect(host).toHaveAttribute('popover', 'manual');
  expect(await host.evaluate((el) => el.matches(':popover-open'))).toBe(true);
  const entries = await topLayer(page);
  expect(entries.filter((entry) => entry.classes.includes('cdk-overlay-popover'))).toHaveLength(1);
  // The host stays where the container put it: the DOM position did not change, the layer did.
  expect(await host.evaluate((el) => el.parentElement?.classList.contains('cdk-overlay-container') ?? false)).toBe(true);

  // No room below: the strategy falls back to the second position, above the button, and the pane stays in the viewport.
  await expect(page.locator('.cdk-overlay-pane.m36-out-above')).toHaveCount(1);
  await expect(page.locator('.cdk-overlay-pane.m36-out-below')).toHaveCount(0);
  const triggerBox = await rect(trigger);
  const menuBox = await rect(menu);
  expect(menuBox.bottom).toBeLessThanOrEqual(triggerBox.top + PIXEL);
  expect(menuBox.top).toBeGreaterThanOrEqual(0);

  // The page wired Escape: it closes the overlay and removes the host.
  await page.keyboard.press('Escape');
  await expect(menu).toHaveCount(0);
  await expect(host).toHaveCount(0);

  // A click inside does not close it; a click outside does (wired through outsidePointerEvents).
  await trigger.click();
  await expect(menu).toBeVisible();
  await menu.getByRole('button', { name: 'Inside' }).click();
  await expect(menu).toBeVisible();
  await page.getByRole('heading', { level: 1 }).click();
  await expect(menu).toHaveCount(0);

  await page.context().close();
});

test('Q36.10 with room below the button the first position wins and the pane is below it', async ({ browser }) => {
  const page = await open(browser, 'q36-10', 'light', 'Q36.10: an overlay near the bottom edge');
  const trigger = page.getByRole('button', { name: 'Open top menu' });
  await trigger.click();
  const menu = panel(page, 'Top menu');
  await expect(menu).toBeVisible();

  await expect(page.locator('.cdk-overlay-pane.m36-out-below')).toHaveCount(1);
  await expect(page.locator('.cdk-overlay-pane.m36-out-above')).toHaveCount(0);
  expect((await rect(menu)).top).toBeGreaterThanOrEqual((await rect(trigger)).bottom - PIXEL);

  await page.context().close();
});

// Q36.12 and Q36.15 (QB-M36-03): each opens its own context at the viewport its page needs.
const TALL: ViewportSize = { width: 1000, height: 1200 };
const PHONE: ViewportSize = { width: 375, height: 667 };
const DESKTOP: ViewportSize = { width: 1280, height: 720 };
// Wider than the Handset queries' 959.98 px edge in both orientations, so crossing from the desktop size to it flips nothing.
const WIDE: ViewportSize = { width: 1100, height: 720 };

async function openAt(browser: Browser, path: string, viewport: ViewportSize, heading: string): Promise<Page> {
  const context = await browser.newContext({ colorScheme: 'light', reducedMotion: 'no-preference', viewport });
  const page = await context.newPage();
  await page.goto(`${UI_ORIGIN}/m36/outputs/${path}`);
  await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
  return page;
}

test('Q36.12 dropping item 1 on item 3 reports previousIndex 0 and currentIndex 2 in one container, and the list renders the new order only when the handler writes it', async ({ browser }) => {
  const page = await openAt(browser, 'q36-12', TALL, 'Q36.12: what a drop reports');
  const original = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'];
  const fixed = page.getByRole('list', { name: 'Report-only list', exact: true }).getByRole('listitem');
  const fixedResult = page.getByRole('status', { name: 'Report-only result', exact: true });
  const live = page.getByRole('list', { name: 'Reordering list', exact: true }).getByRole('listitem');
  const liveResult = page.getByRole('status', { name: 'Reordering result', exact: true });
  await expect(fixed).toHaveText(original);
  await expect(fixedResult).toHaveText('No drop yet');

  // The handler only reports: the event carries the move, the data is untouched, so the list renders the original order.
  await dragBy(page, fixed.nth(0), fixed.nth(2));
  await expect(fixedResult).toHaveText('Dropped Item 1: previousIndex 0, currentIndex 2, same container: true');
  await expect(fixed).toHaveText(original);

  // The same drop with a handler that reorders a copy and sets the signal: the list now shows item 1 in third place.
  await expect(live).toHaveText(original);
  await dragBy(page, live.nth(0), live.nth(2));
  await expect(liveResult).toHaveText('Dropped Item 1: previousIndex 0, currentIndex 2, same container: true');
  await expect(live).toHaveText(['Item 2', 'Item 3', 'Item 1', 'Item 4', 'Item 5']);

  await page.context().close();
});

test('Q36.15 Handset matches at 375 px, not at 1280 px, and the observer emits again only when a query flips', async ({ browser }) => {
  const page = await openAt(browser, 'q36-15', PHONE, 'Q36.15: Handset at two widths');
  const matches = page.getByRole('status', { name: 'Handset matches', exact: true });
  const emissions = page.getByRole('status', { name: 'Handset emissions', exact: true });

  // The portrait half of Handset matches a 375 x 667 viewport; the first value is one emission.
  await expect(matches).toHaveText('Handset: true');
  await expect(emissions).toHaveText('Emissions: 1');

  // Crossing the portrait query's edge is a change event: a second emission with matches false.
  await page.setViewportSize(DESKTOP);
  await expect(matches).toHaveText('Handset: false');
  await expect(emissions).toHaveText('Emissions: 2');

  // A resize that flips no query is no event. It has no visible result, so the next flip shows it: had it emitted, the count would read 4.
  await page.setViewportSize(WIDE);
  await page.setViewportSize(PHONE);
  await expect(matches).toHaveText('Handset: true');
  await expect(emissions).toHaveText('Emissions: 3');

  await page.context().close();
});
