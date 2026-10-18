import { expect, test, type Locator, type Page } from '@playwright/test';

type Variant = 'cdk' | 'window';

const VARIANTS: readonly Variant[] = ['cdk', 'window'];

/**
 * Rows in the DOM at scroll offset 0 and after the jump to line 7,500 (offset 179,976).
 * cdk: end = ceil((200 + 480) / 24) = 29; after the jump start = floor(7499 - 100 / 24) = 7494, end = ceil(7499 + 680 / 24) = 7528.
 * window: first = floor(offset / 24); rows = first - 5 .. first + 26, clamped to the list.
 */
const TOP_ROWS: Record<Variant, number> = { cdk: 29, window: 26 };
const JUMP_ROWS: Record<Variant, number> = { cdk: 34, window: 31 };

const MAX_ROWS = 40;

const lines = (page: Page): Locator => page.locator('.line');
const viewport = (page: Page): Locator => page.getByRole('region', { name: 'Log lines' });
const lineText = (page: Page, text: string): Locator => page.getByText(text, { exact: true });

async function jumpToLine(page: Page, line: string): Promise<void> {
  await page.getByLabel('Jump to line').fill(line);
  await page.getByRole('button', { name: 'Go to line' }).click();
}

async function scrollToEnd(page: Page): Promise<void> {
  await viewport(page).evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
}

for (const variant of VARIANTS) {
  test.describe(`variant ${variant}`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/m31/log-viewer?variant=${variant}`);
      await expect(lines(page)).toHaveCount(TOP_ROWS[variant]);
    });

    test('renders the first lines on load', async ({ page }) => {
      await expect(lineText(page, 'Line 1')).toBeVisible();
      await expect(lineText(page, 'Line 20')).toBeVisible();
    });

    test('keeps at most 40 rows in the DOM at any scroll position', async ({ page }) => {
      expect(await lines(page).count()).toBeLessThanOrEqual(MAX_ROWS);

      await jumpToLine(page, '7500');
      await expect(lineText(page, 'Line 7,500')).toBeVisible();
      expect(await lines(page).count()).toBeLessThanOrEqual(MAX_ROWS);

      await scrollToEnd(page);
      await expect(lineText(page, 'Line 10,000')).toBeVisible();
      expect(await lines(page).count()).toBeLessThanOrEqual(MAX_ROWS);
    });

    test('shows line 7,500 after jumping to it', async ({ page }) => {
      await jumpToLine(page, '7500');

      await expect(lineText(page, 'Line 7,500')).toBeVisible();
      await expect(lines(page)).toHaveCount(JUMP_ROWS[variant]);
      await expect(lineText(page, 'Line 1')).toHaveCount(0);
    });

    test('gives the scroll area the height of all 10,000 lines', async ({ page }) => {
      expect(await viewport(page).evaluate((element) => element.scrollHeight)).toBe(10000 * 24);
      expect(await viewport(page).evaluate((element) => element.clientHeight)).toBe(480);
    });

    test('shows the last line when scrolled to the end', async ({ page }) => {
      await scrollToEnd(page);

      await expect(lineText(page, 'Line 10,000')).toBeVisible();
      await expect(lineText(page, 'Line 1')).toHaveCount(0);
    });
  });
}
