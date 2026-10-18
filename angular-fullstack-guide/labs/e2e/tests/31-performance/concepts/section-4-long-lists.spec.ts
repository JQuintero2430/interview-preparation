import { expect, test, type Page } from '@playwright/test';

/** What the lab hook returns from the viewport's `getRenderedRange()`. */
interface RenderedRange {
  start: number;
  end: number;
}

/** The lab page's rows, in either variant. */
const ROWS = '.row';
const VIEWPORT = 'cdk-virtual-scroll-viewport';

/** Reads the CDK viewport's rendered range through the page's lab instrumentation hook. */
function renderedRange(page: Page): Promise<RenderedRange> {
  return page.evaluate<RenderedRange>('window.__m31LongList.getRenderedRange()');
}

test('Section 4: a plain @for list holds every row in the DOM', async ({ page }) => {
  await page.goto('/m31/long-list?mode=for');

  await expect(page.getByRole('heading', { name: 'Long list lab' })).toBeVisible();
  await expect(page.locator(ROWS)).toHaveCount(10000);
  await expect(page.locator(VIEWPORT)).toHaveCount(0);
});

test('Section 4: the virtual viewport holds only the rendered range', async ({ page }) => {
  await page.goto('/m31/long-list');

  // Offset 0, viewport 400, itemSize 40, minBuffer 100, maxBuffer 200: end = ceil((200 + 400) / 40) = 15.
  await expect(page.locator(ROWS)).toHaveCount(15);
  expect(await renderedRange(page)).toEqual({ start: 0, end: 15 });
  await expect(page.getByText('Row 0', { exact: true })).toBeVisible();
  await expect(page.getByText('Row 14', { exact: true })).toBeAttached();
});

test('Section 4: scrolling to an index renders that row and keeps the DOM bounded', async ({ page }) => {
  await page.goto('/m31/long-list');
  await expect(page.locator(ROWS)).toHaveCount(15);

  await page.evaluate('window.__m31LongList.scrollToIndex(5000)');

  // Offset 200000: start = floor(5000 - 100 / 40) = 4997, end = 15 + ceil((200 + 199800) / 40) = 5015.
  await expect(page.locator(ROWS)).toHaveCount(18);
  expect(await renderedRange(page)).toEqual({ start: 4997, end: 5015 });
  await expect(page.getByText('Row 5000', { exact: true })).toBeVisible();
  await expect(page.getByText('Row 0', { exact: true })).toHaveCount(0);
});

test('Section 4: the spacer gives the scrollbar the full list height', async ({ page }) => {
  await page.goto('/m31/long-list');
  const viewport = page.locator(VIEWPORT);
  await expect(page.locator(ROWS)).toHaveCount(15);

  expect(await viewport.evaluate((element) => element.scrollHeight)).toBe(10000 * 40);
  expect(await viewport.evaluate((element) => element.clientHeight)).toBe(400);
});
