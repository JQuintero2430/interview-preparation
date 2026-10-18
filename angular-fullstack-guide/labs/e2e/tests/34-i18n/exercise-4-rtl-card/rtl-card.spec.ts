import { expect, test, type Browser, type BrowserContext, type Page } from '@playwright/test';
import { localeUrl, type I18nLocale } from '../support/i18n.js';

// Exercise 34.4: one dashboard card measured in the `en-US` and `ar` builds, in both variants.
// `a` uses logical properties and `:dir(rtl)`; `b` keeps physical properties and adds `[dir=rtl]` overrides.
const VARIANTS = ['a', 'b'] as const;
type Variant = (typeof VARIANTS)[number];

/** Parts of the card whose size does not depend on the language, so their offsets can be compared across builds. */
const FIXED_PARTS = ['back', 'logo', 'avatar'] as const;
/** Parts measured for the layout: the fixed ones plus the text block next to the avatar. */
const PARTS = [...FIXED_PARTS, 'greeting'] as const;
type Part = (typeof PARTS)[number];

/** Distance, in whole pixels, from each edge of the card's border box to a part. */
interface Offsets {
  left: number;
  right: number;
}

/**
 * The en-US offsets, measured in Chromium (Playwright 1.63.0, 800 px viewport): a 4 px border and 16 px of
 * padding put the back button and the avatar 20 px from the left, the logo 12 px from the right, and the
 * greeting after the 40 px avatar and its 12 px gap.
 */
const ENGLISH_LAYOUT: Record<Part, Offsets> = {
  back: { left: 20, right: 340 },
  logo: { left: 364, right: 12 },
  avatar: { left: 20, right: 332 },
  greeting: { left: 72, right: 12 },
};

/** The identity matrix and its mirror around the vertical axis, as `getComputedStyle` reports `transform`. */
const NOT_MIRRORED = 'none';
const MIRRORED = 'matrix(-1, 0, 0, 1, 0, 0)';

/** Contexts opened by the current test, closed after it. */
const contexts: BrowserContext[] = [];

test.afterEach(async () => {
  await Promise.all(contexts.splice(0).map((context) => context.close()));
});

/** Opens one variant of the card in one locale build, with the locale and the zone set explicitly. */
async function open(browser: Browser, locale: I18nLocale, variant: Variant): Promise<Page> {
  const context = await browser.newContext({
    locale,
    timezoneId: 'UTC',
    viewport: { width: 800, height: 600 },
  });
  contexts.push(context);
  const page = await context.newPage();
  await page.goto(localeUrl(locale, `m34/ex4/${variant}`));
  await expect(page.getByTestId('card')).toBeVisible();
  return page;
}

/** The offsets of every measured part from the card's edges. */
async function layout(page: Page): Promise<Record<Part, Offsets>> {
  return page.evaluate(() => {
    const card = document.querySelector('[data-testid="card"]')!.getBoundingClientRect();
    const offsets = (part: Part): Offsets => {
      const box = document.querySelector(`[data-testid="${part}"]`)!.getBoundingClientRect();
      return { left: Math.round(box.left - card.left), right: Math.round(card.right - box.right) };
    };
    return {
      back: offsets('back'),
      logo: offsets('logo'),
      avatar: offsets('avatar'),
      greeting: offsets('greeting'),
    };
  });
}

/** The card's left and right border widths, as computed. */
async function borders(page: Page): Promise<{ left: string; right: string }> {
  return page.getByTestId('card').evaluate((card) => {
    const style = getComputedStyle(card);
    return { left: style.borderLeftWidth, right: style.borderRightWidth };
  });
}

/** The computed `transform` of a part. */
async function transformOf(page: Page, testId: string): Promise<string> {
  return page.getByTestId(testId).evaluate((element) => getComputedStyle(element).transform);
}

/** The x position (left edge, rounded) of the first occurrence of `needle` in the text of a test id. */
async function xOf(page: Page, testId: string, needle: string): Promise<number> {
  return page.getByTestId(testId).evaluate((node, text) => {
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    for (let current = walker.nextNode(); current; current = walker.nextNode()) {
      const index = (current.textContent ?? '').indexOf(text);
      if (index >= 0) {
        const range = document.createRange();
        range.setStart(current, index);
        range.setEnd(current, index + text.length);
        return Math.round(range.getBoundingClientRect().left);
      }
    }
    throw new Error(`"${text}" not found in ${testId}`);
  }, needle);
}

/** Expects the pieces of a text, given in reading order, to sit on screen from left to right. */
async function expectLeftToRight(page: Page, testId: string, pieces: readonly string[]): Promise<void> {
  const positions: number[] = [];
  for (const piece of pieces) {
    positions.push(await xOf(page, testId, piece));
  }
  expect(positions, `${testId}: x of ${pieces.join(' | ')}`).toEqual(
    [...positions].sort((a, b) => a - b),
  );
}

for (const variant of VARIANTS) {
  test.describe(`variant ${variant}`, () => {
    test('mirrors the card layout in the Arabic build', async ({ browser }) => {
      const english = await layout(await open(browser, 'en-US', variant));
      const arabicPage = await open(browser, 'ar', variant);
      const arabic = await layout(arabicPage);
      // Each part sits as far from the right edge in Arabic as it does from the left edge in English.
      for (const part of PARTS) {
        expect(arabic[part].right, part).toBe(english[part].left);
      }
      for (const part of FIXED_PARTS) {
        expect(arabic[part].left, part).toBe(english[part].right);
      }
      expect(await borders(arabicPage)).toEqual({ left: '0px', right: '4px' });
    });

    test('keeps the English layout unchanged', async ({ browser }) => {
      const page = await open(browser, 'en-US', variant);
      expect(await page.evaluate(() => document.documentElement.dir)).toBe('ltr');
      expect(await layout(page)).toEqual(ENGLISH_LAYOUT);
      expect(await borders(page)).toEqual({ left: '4px', right: '0px' });
      expect(await transformOf(page, 'back-icon')).toBe(NOT_MIRRORED);
    });

    test('keeps the phone number and amount left to right', async ({ browser }) => {
      const page = await open(browser, 'ar', variant);
      await expectLeftToRight(page, 'phone', ['+57', '300', '123', '4567']);
      // The `ar` locale data writes a right-to-left mark before the digits and a no-break space before the sign.
      await expect(page.getByTestId('amount')).toHaveText('\u200f1,234.50\u00a0€');
      await expectLeftToRight(page, 'amount', ['1,234.50', '€']);
    });

    test("keeps a user name's punctuation with the name", async ({ browser }) => {
      const page = await open(browser, 'ar', variant);
      expect(await xOf(page, 'greeting', '!')).toBeGreaterThan(await xOf(page, 'greeting', 'Ana'));
    });

    test('mirrors the back arrow but not the logo', async ({ browser }) => {
      const arabic = await open(browser, 'ar', variant);
      expect(await transformOf(arabic, 'back-icon')).toBe(MIRRORED);
      expect(await transformOf(arabic, 'logo')).toBe(NOT_MIRRORED);
      const english = await open(browser, 'en-US', variant);
      expect(await transformOf(english, 'back-icon')).toBe(NOT_MIRRORED);
      expect(await transformOf(english, 'logo')).toBe(NOT_MIRRORED);
    });
  });
}
