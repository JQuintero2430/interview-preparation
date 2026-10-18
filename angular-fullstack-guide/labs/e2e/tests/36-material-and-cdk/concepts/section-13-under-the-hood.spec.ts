import { readdir, readFile } from 'node:fs/promises';
import { expect, test, type Browser, type Locator, type Page } from '@playwright/test';
import { computed, rect, topLayer, UI_ORIGIN } from '../support/ui.js';

const BUILD = new URL('../../../../angular/dist/material-lab/browser/', import.meta.url);
const STYLES_FILE = /^styles-.*\.css$/;
// The theme's light value of the system primary color, and the page's two subtree rules, as compiled.
const THEME_PRIMARY = /--mat-sys-primary:\s*light-dark\(\s*([^,]+?)\s*,/;
const SYS_SUBTREE_PRIMARY = /\.m36-internals-sys\s*\{[^}]*--mat-sys-primary:\s*([^;}]+)/;
const TOKEN_SUBTREE_PRIMARY = /\.m36-internals-token\s*\{[^}]*--mat-sys-primary:\s*([^;}]+)/;
const TOKEN_SUBTREE_TOKEN = /\.m36-internals-token\s*\{[^}]*--mat-button-filled-container-color:\s*([^;}]+)/;
// The viewport is set so the three stacked overlays fit side by side.
const VIEWPORT = { width: 1000, height: 700 };

async function openInternals(browser: Browser): Promise<Page> {
  const context = await browser.newContext({ colorScheme: 'light', reducedMotion: 'no-preference', viewport: VIEWPORT });
  const page = await context.newPage();
  await page.goto(`${UI_ORIGIN}/m36/internals`);
  await expect(page.getByRole('heading', { level: 1, name: 'Section 13: under the hood' })).toBeVisible();
  return page;
}

function panel(page: Page, name: string): Locator {
  return page.getByRole('group', { name, exact: true });
}

/** One value the production stylesheet declares, never typed by hand. */
async function declared(pattern: RegExp): Promise<string> {
  const names = (await readdir(BUILD).catch(() => [])).filter((name) => STYLES_FILE.test(name));
  if (names.length !== 1) throw new Error('dist/material-lab/browser needs one styles-*.css: run the e2e suite (its web server builds material-lab)');
  const match = pattern.exec(await readFile(new URL(names[0], BUILD), 'utf8'));
  if (!match) throw new Error(`no match for ${pattern} in the built stylesheet`);
  return match[1].trim();
}

/** The browser's serialisation of a CSS color, so it compares with computed styles. */
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

/** The label of the overlay panel painted at the center of `target`, or null. */
async function panelPaintedAtCenter(target: Locator): Promise<string | null> {
  return target.evaluate((el) => {
    const r = el.getBoundingClientRect();
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return hit?.closest('.cdk-overlay-pane')?.querySelector('.m36-internals-panel')?.getAttribute('aria-label') ?? null;
  });
}

test('Section 13: the second overlay opened receives Escape first', async ({ browser }) => {
  const page = await openInternals(browser);
  const log = page.getByRole('list', { name: 'Escape log' }).getByRole('listitem');
  await page.getByRole('button', { name: 'Open first overlay' }).click();
  await page.getByRole('button', { name: 'Open second overlay' }).click();
  await page.getByRole('button', { name: 'Open unwired overlay' }).click();
  for (const name of ['First overlay', 'Second overlay', 'Unwired overlay']) await expect(panel(page, name)).toBeVisible();

  // The dispatcher walks from the last attached: the unwired overlay has no keydown subscriber, so the second gets the event.
  await page.keyboard.press('Escape');
  await expect(log).toHaveText(['Second overlay']);
  await expect(panel(page, 'Second overlay')).toHaveCount(0);
  await expect(panel(page, 'First overlay')).toBeVisible();
  await expect(panel(page, 'Unwired overlay')).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(log).toHaveText(['Second overlay', 'First overlay']);
  await expect(panel(page, 'First overlay')).toHaveCount(0);
  await expect(panel(page, 'Unwired overlay')).toBeVisible();

  await page.context().close();
});

test('Section 13: an inline overlay host follows its origin in the DOM and paints above an overlay shown before it', async ({ browser }) => {
  const page = await openInternals(browser);
  await page.getByRole('button', { name: 'Open cover' }).click();
  const cover = panel(page, 'Cover');
  await expect(cover).toBeVisible();
  // The cover's pane now takes the pointer, so the second opener receives a dispatched click event instead of a pointer click.
  await page.getByRole('button', { name: 'Open inline menu' }).dispatchEvent('click');
  const inline = panel(page, 'Inline menu');
  await expect(inline).toBeVisible();

  // With an insertion point the host is the origin's next sibling; without one (the cover) it is a child of the overlay container.
  const inlineHost = page.locator('.m36-internals-origin + .cdk-overlay-popover');
  await expect(inlineHost).toHaveCount(1);
  await expect(inlineHost.getByRole('group', { name: 'Inline menu', exact: true })).toBeVisible();
  await expect(page.locator('.cdk-overlay-container > .cdk-overlay-popover').getByRole('group', { name: 'Cover', exact: true })).toBeVisible();
  const inlineComesFirst = await inlineHost.evaluate((host) => {
    const container = document.querySelector('.cdk-overlay-container');
    return container !== null && (host.compareDocumentPosition(container) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
  });
  expect(inlineComesFirst).toBe(true);
  expect((await topLayer(page)).filter((entry) => entry.classes.includes('cdk-overlay-popover'))).toHaveLength(2);

  // The cover's pane spans the inline menu, yet the menu, shown later, paints on top although its host comes earlier in the DOM.
  await expect.poll(() => panelPaintedAtCenter(inline)).toBe('Inline menu');
  const coverPane = await rect(page.locator('.cdk-overlay-pane.m36-internals-cover'));
  const menuBox = await rect(inline);
  expect(coverPane.left).toBeLessThanOrEqual(menuBox.left);
  expect(coverPane.top).toBeLessThanOrEqual(menuBox.top);
  expect(coverPane.right).toBeGreaterThanOrEqual(menuBox.right);
  expect(coverPane.bottom).toBeGreaterThanOrEqual(menuBox.bottom);

  await page.context().close();
});

test('Section 13: a button reads its container color from the system primary variable', async ({ browser }) => {
  const page = await openInternals(browser);
  const themePrimary = await asComputedColor(page, await declared(THEME_PRIMARY));
  const sysPrimary = await asComputedColor(page, await declared(SYS_SUBTREE_PRIMARY));
  const tokenPrimary = await asComputedColor(page, await declared(TOKEN_SUBTREE_PRIMARY));
  const token = await asComputedColor(page, await declared(TOKEN_SUBTREE_TOKEN));
  expect(new Set([themePrimary, sysPrimary, tokenPrimary, token]).size).toBe(4);

  const button = (group: string): Locator => page.getByRole('group', { name: group }).getByRole('button', { name: 'Save' });

  // No component token is set: the button falls back to the system variable, the theme's or the subtree's.
  expect((await computed(button('Theme default'), '--mat-button-filled-container-color')).trim()).toBe('');
  expect(await computed(button('Theme default'), 'background-color')).toBe(themePrimary);
  expect((await computed(button('System variable set'), '--mat-button-filled-container-color')).trim()).toBe('');
  expect(await computed(button('System variable set'), 'background-color')).toBe(sysPrimary);

  // The component token is the first link of the chain: when it is set, the system variable beside it is not read.
  expect(await computed(button('Component token set'), 'background-color')).toBe(token);

  await page.context().close();
});
