import { expect, test, type Browser, type Locator, type Page } from '@playwright/test';
import { dragBy, UI_ORIGIN } from '../support/ui.js';

// The viewport is tall enough that every list is on screen: the mouse moves in viewport coordinates.
const VIEWPORT = { width: 1000, height: 1200 };

async function openDragPage(browser: Browser): Promise<Page> {
  const context = await browser.newContext({ colorScheme: 'light', reducedMotion: 'no-preference', viewport: VIEWPORT });
  const page = await context.newPage();
  await page.goto(`${UI_ORIGIN}/m36/drag-drop`);
  await expect(page.getByRole('heading', { level: 1, name: 'Section 6: drag and drop' })).toBeVisible();
  return page;
}

function items(page: Page, list: string): Locator {
  return page.getByRole('list', { name: list, exact: true }).getByRole('listitem');
}

function report(page: Page, name: string): Locator {
  return page.getByRole('status', { name, exact: true });
}

test('Section 6: dragging the first item below the third reorders the list', async ({ browser }) => {
  const page = await openDragPage(browser);
  const list = items(page, 'Sortable list');
  await expect(list).toHaveText(['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5']);

  await dragBy(page, list.nth(0), list.nth(2));

  // The handler copied the array, moved the item and set the signal, so the template renders the new order.
  await expect(list).toHaveText(['Item 2', 'Item 3', 'Item 1', 'Item 4', 'Item 5']);
  await expect(report(page, 'Sortable report')).toHaveText('Dropped Item 1: previousIndex 0, currentIndex 2, same container: true');
  await page.context().close();
});

test('Section 6: without moveItemInArray the list snaps back', async ({ browser }) => {
  const page = await openDragPage(browser);
  const list = items(page, 'Snap-back list');

  await dragBy(page, list.nth(0), list.nth(2));

  // The drop was reported with the same fields, but the handler left the data alone: the item returns to its place.
  await expect(report(page, 'Snap-back report')).toHaveText('Dropped Snap A: previousIndex 0, currentIndex 2, same container: true');
  await expect(list).toHaveText(['Snap A', 'Snap B', 'Snap C']);
  await page.context().close();
});

test('Section 6: an item moves to a connected list', async ({ browser }) => {
  const page = await openDragPage(browser);
  const todo = items(page, 'To do');
  const done = items(page, 'Done');
  await expect(todo).toHaveText(['Write', 'Test']);
  await expect(done).toHaveText(['Ship']);

  await dragBy(page, todo.filter({ hasText: 'Write' }), done.filter({ hasText: 'Ship' }));

  await expect(report(page, 'Board report')).toHaveText('Dropped Write: todo to done');
  await expect(todo).toHaveText(['Test']);
  await expect(done).toHaveCount(2);
  await expect(done.filter({ hasText: 'Write' })).toHaveCount(1);
  await page.context().close();
});

test('Section 6: an unconnected list does not accept the item', async ({ browser }) => {
  const page = await openDragPage(browser);
  const inbox = items(page, 'Inbox');
  const archive = items(page, 'Archive');

  await dragBy(page, inbox.filter({ hasText: 'Mail' }), archive.filter({ hasText: 'Old' }));

  // The inbox still reports the drop, in its own container; the archive gained nothing.
  await expect(report(page, 'Inbox report')).toHaveText('Dropped Mail: previousIndex 0, currentIndex 0, same container: true');
  await expect(inbox).toHaveText(['Mail']);
  await expect(archive).toHaveText(['Old']);
  await page.context().close();
});

test('Section 6: arrow keys on a focused item do not move it', async ({ browser }) => {
  const page = await openDragPage(browser);
  const list = items(page, 'Sortable list');

  await list.nth(0).focus();
  await expect(list.nth(0)).toBeFocused();
  for (const key of ['ArrowDown', 'ArrowUp', 'Alt+ArrowDown', 'Space', 'Enter', 'ArrowDown']) {
    await page.keyboard.press(key);
  }

  // No drop was reported and the order is the original one: the CDK listens to mouse and touch events, not keys.
  await expect(list).toHaveText(['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5']);
  await expect(report(page, 'Sortable report')).toHaveText('No drop yet');
  await page.context().close();
});

test('Section 6: moveItemInArray on a signal array leaves a computed value stale', async ({ browser }) => {
  const page = await openDragPage(browser);
  const list = items(page, 'In-place list');
  const order = report(page, 'In-place order');
  await expect(order).toHaveText('Order: Sig 1, Sig 2, Sig 3');

  await dragBy(page, list.filter({ hasText: 'Sig 1' }), list.filter({ hasText: 'Sig 3' }));

  // The handler ran (its own counter, set with `update`, shows it), but the array changed without `set` or `update`:
  // the computed that reads it was never notified and still holds the old order.
  await expect(report(page, 'In-place drops')).toHaveText('Drops: 1');
  await expect(order).toHaveText('Order: Sig 1, Sig 2, Sig 3');
  await page.context().close();
});
