import { readdir, readFile } from 'node:fs/promises';
import { expect, test, type Browser, type Locator, type Page } from '@playwright/test';
import { computed, UI_ORIGIN } from '../support/ui.js';

// Exercise 36.1: the same five criteria run over variant a (one theme, `color-scheme`) and variant b (two themes, a class).
const BUILD = new URL('../../../../angular/dist/material-lab/browser/', import.meta.url);
const STYLES_FILE = /^styles-.*\.css$/;
const HEX = '#[0-9a-fA-F]{3,8}';
// Variant a: `mat.theme` on `html` with the default theme type writes `light-dark(<light>, <dark>)`.
const LIGHT_DARK_PAIR = new RegExp(`(--mat-sys-[a-z0-9-]+):\\s*light-dark\\(\\s*(${HEX})\\s*,\\s*(${HEX})\\s*\\)`, 'g');
// Variant b: each theme writes one plain value per variable, in its own rule.
const PLAIN_COLOR = new RegExp(`(--mat-sys-[a-z0-9-]+):\\s*(${HEX})(?=\\s*(?:;|$))`, 'g');
// The brand override as compiled: `mat.button-overrides` on `.m36-shell`.
const BRAND_OVERRIDE = /\.m36-shell\s*\{[^}]*--mat-button-filled-container-color:\s*([^;}]+)/;

type Variant = 'a' | 'b';
type Scheme = 'light' | 'dark';
type Choice = 'System' | 'Light' | 'Dark';

interface SystemColor {
  readonly name: string;
  readonly light: string;
  readonly dark: string;
}

interface Mismatch {
  readonly name: string;
  readonly actual: string;
  readonly expected: string;
}

async function builtStyles(): Promise<string> {
  const names = (await readdir(BUILD).catch(() => [])).filter((name) => STYLES_FILE.test(name));
  if (names.length !== 1) throw new Error('dist/material-lab/browser needs one styles-*.css: run the e2e suite (its web server builds material-lab)');
  return readFile(new URL(names[0], BUILD), 'utf8');
}

/** The declarations of every rule whose selector is exactly `selector`, joined. */
function ruleBodies(css: string, selector: string): string {
  const escaped = selector.replaceAll('.', '\\.');
  // A selector follows the start, a closing brace, whitespace or `;`: Sass puts `@charset "UTF-8";` first once any rule has non-ASCII content.
  const rule = new RegExp(`(?:^|[};\\s])${escaped}\\s*\\{([^}]*)\\}`, 'g');
  return Array.from(css.matchAll(rule), (match) => match[1]).join(';');
}

function plainColors(body: string): Map<string, string> {
  return new Map(Array.from(body.matchAll(PLAIN_COLOR), (match): [string, string] => [match[1], match[2]]));
}

/** Every system color with its light and dark value, read from the production stylesheet and never typed by hand. */
async function systemColors(variant: Variant): Promise<SystemColor[]> {
  const css = await builtStyles();
  let colors: SystemColor[];
  if (variant === 'a') {
    colors = Array.from(ruleBodies(css, 'html').matchAll(LIGHT_DARK_PAIR), (match) => ({ name: match[1], light: match[2], dark: match[3] }));
  } else {
    const light = plainColors(ruleBodies(css, 'html.m36-b'));
    const dark = plainColors(ruleBodies(css, 'html.m36-b.m36-dark'));
    colors = Array.from(light, ([name, value]) => ({ name, light: value, dark: dark.get(name) ?? '' })).filter((color) => color.dark !== '');
  }
  if (colors.length === 0) throw new Error(`no system colors found in the built stylesheet for variant ${variant}`);
  return colors;
}

function colorOf(colors: readonly SystemColor[], name: string): SystemColor {
  const color = colors.find((candidate) => candidate.name === name);
  if (!color) throw new Error(`${name} is not among the built system colors`);
  return color;
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

async function open(browser: Browser, variant: Variant, colorScheme: Scheme): Promise<Page> {
  const context = await browser.newContext({ colorScheme, reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await page.goto(`${UI_ORIGIN}/m36/ex1/${variant}`);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(`Exercise 36.1: a themed shell, variant ${variant}`);
  return page;
}

function radio(page: Page, choice: Choice): Locator {
  return page.getByRole('radiogroup', { name: 'Color scheme' }).getByRole('radio', { name: choice, exact: true });
}

/** The system colors whose resolved value inside the shell is not the expected one for `scheme`. */
async function mismatches(page: Page, colors: readonly SystemColor[], scheme: Scheme): Promise<Mismatch[]> {
  return page.locator('.m36-shell').evaluate(
    (shell, args) => {
      const probe = document.createElement('span');
      shell.append(probe);
      const wrong: Mismatch[] = [];
      for (const color of args.colors) {
        probe.style.color = color[args.scheme];
        const expected = getComputedStyle(probe).color;
        probe.style.color = `var(${color.name})`;
        const actual = getComputedStyle(probe).color;
        if (actual !== expected) wrong.push({ name: color.name, actual, expected });
      }
      probe.remove();
      return wrong;
    },
    { colors, scheme },
  );
}

async function expectScheme(page: Page, colors: readonly SystemColor[], scheme: Scheme): Promise<void> {
  await expect.poll(() => mismatches(page, colors, scheme)).toEqual([]);
}

for (const variant of ['a', 'b'] as const) {
  test.describe(`variant ${variant}`, () => {
    test("follows the operating system's color scheme until the user chooses one", async ({ browser }) => {
      const colors = await systemColors(variant);
      const page = await open(browser, variant, 'light');

      // Nothing chosen yet: "System" is selected and the colors are the light ones.
      await expect(radio(page, 'System')).toBeChecked();
      await expectScheme(page, colors, 'light');

      // The operating system changes while the page is open and the page follows.
      await page.emulateMedia({ colorScheme: 'dark' });
      await expectScheme(page, colors, 'dark');

      // A choice wins over the operating system, which is still dark here.
      await radio(page, 'Light').click();
      await expectScheme(page, colors, 'light');

      await page.context().close();
    });

    test('switches every system color when the user picks dark', async ({ browser }) => {
      const colors = await systemColors(variant);
      const page = await open(browser, variant, 'light');
      await expectScheme(page, colors, 'light');

      await radio(page, 'Dark').click();
      await expect(radio(page, 'Dark')).toBeChecked();
      await expectScheme(page, colors, 'dark');
      // The theme gives the two schemes different colors for at least one variable, so the check above is not vacuous.
      expect(colors.some((color) => color.light !== color.dark)).toBe(true);

      await page.context().close();
    });

    test('keeps the brand color on the filled button in light and dark', async ({ browser }) => {
      const colors = await systemColors(variant);
      const brandValue = BRAND_OVERRIDE.exec(await builtStyles())?.[1].trim();
      if (!brandValue) throw new Error('no brand override of the filled button in the built stylesheet');
      const page = await open(browser, variant, 'light');
      const brand = await asComputedColor(page, brandValue);
      const primary = colorOf(colors, '--mat-sys-primary');
      // The brand is not Material's primary color in either scheme, so the test tells the two apart.
      expect(brand).not.toBe(await asComputedColor(page, primary.light));
      expect(brand).not.toBe(await asComputedColor(page, primary.dark));

      const save = page.getByRole('button', { name: 'Save', exact: true });
      for (const choice of ['Light', 'Dark'] as const) {
        await radio(page, choice).click();
        await expectScheme(page, colors, choice === 'Light' ? 'light' : 'dark');
        expect(await computed(save, 'background-color')).toBe(brand);
      }

      await page.context().close();
    });

    test('paints the profile card from the system surface and outline variables', async ({ browser }) => {
      const colors = await systemColors(variant);
      const surface = colorOf(colors, '--mat-sys-surface-container');
      const text = colorOf(colors, '--mat-sys-on-surface');
      const outline = colorOf(colors, '--mat-sys-outline-variant');
      const seen: Record<Scheme, string> = { light: '', dark: '' };

      for (const scheme of ['light', 'dark'] as const) {
        const page = await open(browser, variant, scheme);
        const card = page.getByRole('region', { name: 'Profile card' });
        await expectScheme(page, colors, scheme);

        seen[scheme] = await computed(card, 'background-color');
        expect(seen[scheme]).toBe(await asComputedColor(page, surface[scheme]));
        expect(await computed(card, 'color')).toBe(await asComputedColor(page, text[scheme]));
        expect(await computed(card, 'border-top-color')).toBe(await asComputedColor(page, outline[scheme]));

        // The card reads the variables themselves: new values on the card change all three colors.
        await card.evaluate((el) => {
          el.style.setProperty('--mat-sys-surface-container', 'rgb(1, 2, 3)');
          el.style.setProperty('--mat-sys-on-surface', 'rgb(4, 5, 6)');
          el.style.setProperty('--mat-sys-outline-variant', 'rgb(7, 8, 9)');
        });
        expect(await computed(card, 'background-color')).toBe('rgb(1, 2, 3)');
        expect(await computed(card, 'color')).toBe('rgb(4, 5, 6)');
        expect(await computed(card, 'border-top-color')).toBe('rgb(7, 8, 9)');
        await page.context().close();
      }

      expect(seen.light).not.toBe(seen.dark);
    });

    test("keeps the user's choice after a reload", async ({ browser }) => {
      const colors = await systemColors(variant);
      const page = await open(browser, variant, 'light');

      await radio(page, 'Dark').click();
      await expectScheme(page, colors, 'dark');

      await page.reload();
      await expect(page.getByRole('heading', { level: 1 })).toContainText(`variant ${variant}`);
      await expect(radio(page, 'Dark')).toBeChecked();
      await expectScheme(page, colors, 'dark');

      await page.context().close();
    });
  });
}
