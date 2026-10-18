import { expect, test, type Browser, type Page } from '@playwright/test';
import { localeUrl, type I18nLocale } from '../support/i18n.js';

// Opens the page of one locale build with the machine's own locale and zone overridden.
async function open(browser: Browser, locale: I18nLocale): Promise<Page> {
  const context = await browser.newContext({ locale, timezoneId: 'UTC', viewport: { width: 800, height: 600 } });
  const page = await context.newPage();
  await page.goto(localeUrl(locale, 'm34/rtl'));
  await expect(page.getByTestId('start')).toBeVisible();
  return page;
}

/** Gaps in whole pixels between a box and its fixed-width frame. */
async function gaps(page: Page, kind: 'physical' | 'logical'): Promise<{ left: number; right: number }> {
  return page.evaluate((id) => {
    const frame = document.querySelector(`[data-testid="${id}-frame"]`)!.getBoundingClientRect();
    const box = document.querySelector(`[data-testid="${id}-box"]`)!.getBoundingClientRect();
    return { left: Math.round(box.left - frame.left), right: Math.round(frame.right - box.right) };
  }, kind);
}

/** The x position (left edge, rounded) of the first occurrence of `needle` in the text of a test id. */
async function xOf(page: Page, testId: string, needle: string): Promise<number> {
  return page.evaluate(
    ([id, text]) => {
      const node = document.querySelector(`[data-testid="${id}"]`)!;
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
      throw new Error(`"${text}" not found in ${id}`);
    },
    [testId, needle],
  );
}

/** The left and right gap, in whole pixels, between a paragraph's text and the paragraph's own box. */
async function textGaps(page: Page, testId: string): Promise<{ left: number; right: number }> {
  return page.getByTestId(testId).evaluate((element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    const text = range.getBoundingClientRect();
    const box = element.getBoundingClientRect();
    return { left: Math.round(text.left - box.left), right: Math.round(box.right - text.right) };
  });
}

// Frames are 300 px wide and boxes 100 px wide. Measured in Chromium (Playwright 1.63.0, 800 px viewport).
test('Section 11: margin-inline-start moves to the right edge in the Arabic build', async ({ browser }) => {
  const page = await open(browser, 'ar');
  expect(await gaps(page, 'logical')).toEqual({ left: 184, right: 16 });
  await page.context().close();
});

test('Section 11: margin-left stays on the left in the Arabic build', async ({ browser }) => {
  // The row starts at the right edge, so the 16 px margin sits on the box's left and leaves no gap at the start.
  const page = await open(browser, 'ar');
  expect(await gaps(page, 'physical')).toEqual({ left: 200, right: 0 });
  await page.context().close();
});

test('Section 11: text-align start aligns right in the Arabic build', async ({ browser }) => {
  const page = await open(browser, 'ar');
  expect((await textGaps(page, 'start')).right).toBe(0);
  expect((await textGaps(page, 'start')).left).toBeGreaterThan(0);
  await page.context().close();
});

test("Section 11: bdi keeps a user name's punctuation with the name", async ({ browser }) => {
  const page = await open(browser, 'ar');
  // Without <bdi> the "!" is neutral between a Latin letter and Arabic, takes the paragraph's direction and lands
  // left of the name; inside <bdi> it stays after the name.
  expect(await xOf(page, 'plain', '!')).toBeLessThan(await xOf(page, 'plain', 'Ana'));
  expect(await xOf(page, 'isolated', '!')).toBeGreaterThan(await xOf(page, 'isolated', 'Ana'));
  await page.context().close();
});

test('Section 11: the en-US build lays out the same page left to right', async ({ browser }) => {
  const page = await open(browser, 'en-US');
  expect(await page.evaluate(() => document.documentElement.dir)).toBe('ltr');
  expect(await gaps(page, 'logical')).toEqual({ left: 16, right: 184 });
  expect(await gaps(page, 'physical')).toEqual({ left: 16, right: 184 });
  expect((await textGaps(page, 'start')).left).toBe(0);
  expect(await xOf(page, 'plain', '!')).toBeGreaterThan(await xOf(page, 'plain', 'Ana'));
  await page.context().close();
});

test('Section 11: dir=ltr keeps a phone number in reading order in the Arabic build', async ({ browser }) => {
  const page = await open(browser, 'ar');
  // Digits run left to right either way; the spaces between the groups take the paragraph's direction.
  expect(await xOf(page, 'phone-plain', '45')).toBeLessThan(await xOf(page, 'phone-plain', '67'));
  expect(await xOf(page, 'phone-plain', '4567')).toBeLessThan(await xOf(page, 'phone-plain', '300'));
  expect(await xOf(page, 'phone-ltr', '300')).toBeLessThan(await xOf(page, 'phone-ltr', '4567'));
  await page.context().close();
});
