import { expect, test, type Page } from '@playwright/test';

/** What the lab hook returns from the viewport's `getRenderedRange()`. */
interface RenderedRange {
  start: number;
  end: number;
}

/** The lab page's constants (`demo/long-list.ts`) and the CDK directive's buffer defaults. */
const ITEM_SIZE = 40;
const VIEWPORT_SIZE = 400;
const DATA_LENGTH = 10_000;
const MIN_BUFFER_PX = 100;
const MAX_BUFFER_PX = 200;

/** Offsets that are not multiples of the row height: far down the list, then one row back. */
const FAR_OFFSET = 30_020;
const BACK_OFFSET = FAR_OFFSET - ITEM_SIZE;

const ROWS = '.row';
const VIEWPORT = 'cdk-virtual-scroll-viewport';

/** Reads the CDK viewport's rendered range through the page's lab instrumentation hook. */
function renderedRange(page: Page): Promise<RenderedRange> {
  return page.evaluate<RenderedRange>('window.__m31LongList.getRenderedRange()');
}

/**
 * The fixed-size strategy's update, rewritten from `_updateRenderedRange` (`@angular/cdk` 22.2.1,
 * internal) for a range that stays below the end of the list.
 * @param previous - The range before the scroll: the strategy extends it rather than starting over.
 * @param scrollOffset - The viewport's `scrollTop` after the scroll.
 * @returns The range the strategy should set.
 */
function nextRange(previous: RenderedRange, scrollOffset: number): RenderedRange {
  const firstVisibleIndex = scrollOffset / ITEM_SIZE;
  const startBuffer = scrollOffset - previous.start * ITEM_SIZE;
  if (startBuffer < MIN_BUFFER_PX && previous.start !== 0) {
    const expandStart = Math.ceil((MAX_BUFFER_PX - startBuffer) / ITEM_SIZE);
    return {
      start: Math.max(0, previous.start - expandStart),
      end: Math.min(DATA_LENGTH, Math.ceil(firstVisibleIndex + (VIEWPORT_SIZE + MIN_BUFFER_PX) / ITEM_SIZE)),
    };
  }
  const endBuffer = previous.end * ITEM_SIZE - (scrollOffset + VIEWPORT_SIZE);
  if (endBuffer >= MIN_BUFFER_PX || previous.end === DATA_LENGTH) return previous;
  const expandEnd = Math.ceil((MAX_BUFFER_PX - endBuffer) / ITEM_SIZE);
  return {
    start: Math.max(0, Math.floor(firstVisibleIndex - MIN_BUFFER_PX / ITEM_SIZE)),
    end: Math.min(DATA_LENGTH, previous.end + expandEnd),
  };
}

/** Sets the viewport's `scrollTop`, then waits until the range equals the formula's prediction. */
async function scrollAndCheck(page: Page, offset: number): Promise<RenderedRange> {
  const previous = await renderedRange(page);
  const expected = nextRange(previous, offset);
  const viewport = page.locator(VIEWPORT);

  await viewport.evaluate((element, top) => {
    element.scrollTop = top;
  }, offset);

  expect(await viewport.evaluate((element) => element.scrollTop)).toBe(offset);
  await expect.poll(() => renderedRange(page)).toEqual(expected);
  await expect(page.locator(ROWS)).toHaveCount(expected.end - expected.start);
  return expected;
}

test('Section 11: the rendered range after a scroll matches the fixed-size formula', async ({ page }) => {
  await page.goto('/m31/long-list');
  await expect(page.locator(ROWS)).toHaveCount(15);

  // From 0..15, the end side grows: start = floor(750.5 - 2.5) = 748, end = 15 + ceil(30020 / 40) = 766.
  expect(await scrollAndCheck(page, FAR_OFFSET)).toEqual({ start: 748, end: 766 });

  // One row back, the start buffer is 60 px: start = 748 - ceil(140 / 40) = 744, end = ceil(749.5 + 12.5) = 762.
  expect(await scrollAndCheck(page, BACK_OFFSET)).toEqual({ start: 744, end: 762 });

  // The same offset reached straight from the top gives another range: each update extends the last one.
  await page.reload();
  await expect(page.locator(ROWS)).toHaveCount(15);
  expect(await scrollAndCheck(page, BACK_OFFSET)).toEqual({ start: 747, end: 765 });
});
