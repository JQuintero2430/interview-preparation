import { readdir, readFile } from 'node:fs/promises';
import { expect, test, type Browser, type Locator, type Page } from '@playwright/test';
import { computed, UI_ORIGIN } from '../support/ui.js';

const BUILD = new URL('../../../../angular/dist/material-lab/browser/', import.meta.url);
const STYLES_FILE = /^styles-.*\.css$/;
// The lab's own override rules as compiled: `.m36-brand-buttons` sets a component token, `.m36-brand` a system variable.
const COMPONENT_OVERRIDE = /\.m36-brand-buttons\s*\{[^}]*--mat-button-filled-container-color:\s*([^;}]+)/;
const SYSTEM_OVERRIDE = /\.m36-brand\s*\{[^}]*--mat-sys-primary:\s*([^;}]+)/;

type Scheme = 'light' | 'dark';
const SCHEMES: readonly Scheme[] = ['light', 'dark'];

type SchemeColors = Record<Scheme, string>;

async function builtStyles(): Promise<string> {
  const names = (await readdir(BUILD).catch(() => [])).filter((name) => STYLES_FILE.test(name));
  if (names.length !== 1) throw new Error('dist/material-lab/browser needs one styles-*.css: run the e2e suite (its web server builds material-lab)');
  return readFile(new URL(names[0], BUILD), 'utf8');
}

/** The value one override rule of the lab declares, read from the production stylesheet, never typed by hand. */
async function overrideValue(pattern: RegExp): Promise<string> {
  const match = pattern.exec(await builtStyles());
  if (!match) throw new Error(`no match for ${pattern} in the built stylesheet`);
  return match[1].trim();
}

/** The light and dark values `mat.theme` compiled into `light-dark(<light>, <dark>)` for one system variable. */
async function schemeColors(variable: string): Promise<SchemeColors> {
  const match = new RegExp(`${variable}:\\s*light-dark\\(\\s*([^,]+?)\\s*,\\s*([^)]+?)\\s*\\)`).exec(await builtStyles());
  if (!match) throw new Error(`no light-dark() declaration of ${variable} in the built stylesheet`);
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

async function openOverrides(browser: Browser, colorScheme: Scheme): Promise<Page> {
  const context = await browser.newContext({ colorScheme, reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await page.goto(`${UI_ORIGIN}/m36/overrides`);
  await expect(page.getByRole('heading', { level: 1, name: 'Section 4: customizing the theme' })).toBeVisible();
  return page;
}

function brandedCard(page: Page): Locator {
  return page.getByRole('group', { name: 'Branded card' });
}

async function openDialog(page: Page, opener: string): Promise<Locator> {
  await brandedCard(page).getByRole('button', { name: opener, exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  return dialog;
}

async function closeDialog(dialog: Locator): Promise<void> {
  await dialog.getByRole('button', { name: 'Confirm' }).click();
  await expect(dialog).toHaveCount(0);
}

test('Section 4: a component override changes only the buttons inside its subtree', async ({ browser }) => {
  const page = await openOverrides(browser, 'light');
  const branded = await asComputedColor(page, await overrideValue(COMPONENT_OVERRIDE));
  const standard = await asComputedColor(page, (await schemeColors('--mat-sys-primary')).light);
  expect(branded).not.toBe(standard);

  const inside = await page.getByRole('group', { name: 'Branded buttons' }).getByRole('button').all();
  const outside = await page.getByRole('group', { name: 'Default buttons' }).getByRole('button').all();
  expect(inside).toHaveLength(2);
  expect(outside).toHaveLength(2);
  for (const button of inside) expect(await computed(button, 'background-color')).toBe(branded);
  for (const button of outside) expect(await computed(button, 'background-color')).toBe(standard);

  await page.context().close();
});

test('Section 4: a system override inside a card does not reach a dialog opened from it', async ({ browser }) => {
  const page = await openOverrides(browser, 'light');
  const branded = await asComputedColor(page, await overrideValue(SYSTEM_OVERRIDE));
  const standard = await asComputedColor(page, (await schemeColors('--mat-sys-primary')).light);
  expect(branded).not.toBe(standard);
  const card = brandedCard(page);

  // Inside the card's subtree the system variable changed: a swatch and a filled button both read it.
  expect(await computed(card.getByText('Card primary', { exact: true }), 'background-color')).toBe(branded);
  expect(await computed(card.getByRole('button', { name: 'Open dialog', exact: true }), 'background-color')).toBe(branded);
  expect(await computed(page.getByText('Page primary', { exact: true }), 'background-color')).toBe(standard);

  // The dialog was opened from a button in the card, yet it is not in the card's subtree and keeps the page's primary color.
  const dialog = await openDialog(page, 'Open dialog');
  await expect(card.getByRole('dialog')).toHaveCount(0);
  expect(await computed(dialog.getByRole('button', { name: 'Confirm' }), 'background-color')).toBe(standard);
  await closeDialog(dialog);

  await page.context().close();
});

test('Section 4: the same override on the overlay pane class reaches the dialog', async ({ browser }) => {
  const page = await openOverrides(browser, 'light');
  const branded = await asComputedColor(page, await overrideValue(SYSTEM_OVERRIDE));

  const dialog = await openDialog(page, 'Open dialog on branded pane');
  expect(await dialog.evaluate((el, name) => el.closest(`.${name}`) !== null, 'm36-brand')).toBe(true);
  expect(await computed(dialog.getByRole('button', { name: 'Confirm' }), 'background-color')).toBe(branded);
  await closeDialog(dialog);

  await page.context().close();
});

test('Section 4: a custom card reads the system surface color in light and dark', async ({ browser }) => {
  const surface = await schemeColors('--mat-sys-surface-container');
  const text = await schemeColors('--mat-sys-on-surface');
  const accent = await schemeColors('--mat-sys-primary');
  const seen: Record<Scheme, string> = { light: '', dark: '' };

  for (const scheme of SCHEMES) {
    const page = await openOverrides(browser, scheme);
    const card = page.getByRole('region', { name: 'Custom card' });
    seen[scheme] = await computed(card, 'background-color');
    expect(seen[scheme]).toBe(await asComputedColor(page, surface[scheme]));
    expect(await computed(card, 'color')).toBe(await asComputedColor(page, text[scheme]));
    // No --m36-card-accent is set anywhere, so the title falls back to the system primary color.
    expect(await computed(card.getByRole('heading', { name: 'Custom card' }), 'color')).toBe(await asComputedColor(page, accent[scheme]));
    await page.context().close();
  }

  expect(seen.light).not.toBe(seen.dark);
});
