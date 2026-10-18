import { readdir, readFile } from 'node:fs/promises';
import { expect, test, type Browser, type Locator, type Page } from '@playwright/test';
import { computed, sysVar, UI_ORIGIN } from '../support/ui.js';

const BUILD = new URL('../../../../angular/dist/material-lab/browser/', import.meta.url);
const STYLES_FILE = /^styles-.*\.css$/;
// The theme's own declaration: `mat.theme` with the default theme type writes `light-dark(<light>, <dark>)`.
const PRIMARY_DECLARATION = /--mat-sys-primary:\s*light-dark\(\s*([^,]+?)\s*,\s*([^)]+?)\s*\)/;
const SYSTEM_VARIABLES = ['--mat-sys-primary', '--mat-sys-surface', '--mat-sys-on-surface', '--mat-sys-body-medium', '--mat-sys-corner-medium'];

type RegionName = 'Page color scheme' | 'Dark subtree';
const REGIONS: readonly RegionName[] = ['Page color scheme', 'Dark subtree'];

interface SchemeColors {
  readonly light: string;
  readonly dark: string;
}

/** The light and dark values of `--mat-sys-primary` as compiled into the production stylesheet, never typed by hand. */
async function compiledPrimary(): Promise<SchemeColors> {
  const names = (await readdir(BUILD).catch(() => [])).filter((name) => STYLES_FILE.test(name));
  if (names.length !== 1) throw new Error('dist/material-lab/browser needs one styles-*.css: run the e2e suite (its web server builds material-lab)');
  const match = PRIMARY_DECLARATION.exec(await readFile(new URL(names[0], BUILD), 'utf8'));
  if (!match) throw new Error('no light-dark() declaration of --mat-sys-primary in the built stylesheet');
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

async function openTheme(browser: Browser, colorScheme: 'light' | 'dark'): Promise<Page> {
  const context = await browser.newContext({ colorScheme, reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await page.goto(`${UI_ORIGIN}/m36/theme`);
  await expect(page.getByRole('heading', { level: 1, name: 'Section 3: one theme, light and dark' })).toBeVisible();
  return page;
}

function region(page: Page, name: RegionName): Locator {
  return page.getByRole('region', { name });
}

function swatch(page: Page, name: RegionName): Locator {
  return region(page, name).getByText('Primary', { exact: true });
}

test('Section 3: the theme declares the system variables on html', async ({ browser }) => {
  const page = await openTheme(browser, 'light');
  for (const name of SYSTEM_VARIABLES) expect(await sysVar(page, name)).not.toBe('');
  // The colors stay unresolved in the variable: the browser resolves light-dark() where a property uses it.
  expect(await sysVar(page, '--mat-sys-primary')).toMatch(/^light-dark\(/);
  // The declarations come from the stylesheet: nothing was written into html's inline style by script.
  expect(await page.locator('html').evaluate((el) => el.getAttribute('style'))).toBeNull();
  await page.context().close();
});

test('Section 3: the primary color follows the color scheme preference', async ({ browser }) => {
  const { light, dark } = await compiledPrimary();
  const lightPage = await openTheme(browser, 'light');
  const darkPage = await openTheme(browser, 'dark');

  const onLight = await computed(swatch(lightPage, 'Page color scheme'), 'background-color');
  const onDark = await computed(swatch(darkPage, 'Page color scheme'), 'background-color');
  expect(onLight).not.toBe(onDark);
  expect(onLight).toBe(await asComputedColor(lightPage, light));
  expect(onDark).toBe(await asComputedColor(darkPage, dark));

  await lightPage.context().close();
  await darkPage.context().close();
});

test('Section 3: a subtree with color-scheme dark gets the dark values', async ({ browser }) => {
  const { light, dark } = await compiledPrimary();
  const page = await openTheme(browser, 'light');

  expect(await computed(region(page, 'Dark subtree'), 'color-scheme')).toBe('dark');
  expect(await computed(swatch(page, 'Page color scheme'), 'background-color')).toBe(await asComputedColor(page, light));
  expect(await computed(swatch(page, 'Dark subtree'), 'background-color')).toBe(await asComputedColor(page, dark));

  await page.context().close();
});

test("Section 3: a filled button's background is the system primary color", async ({ browser }) => {
  const page = await openTheme(browser, 'light');

  for (const name of REGIONS) {
    const button = region(page, name).getByRole('button', { name: 'Save' });
    expect(await computed(button, 'background-color')).toBe(await computed(swatch(page, name), 'background-color'));
  }

  await page.context().close();
});
