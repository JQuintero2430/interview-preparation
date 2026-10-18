import { expect, type Page, test } from '@playwright/test';
import { animationsOf, classesOf, documentAnimations, finishAll, MOTION_ORIGIN, recordEvents } from '../support/motion.js';

async function openLists(page: Page): Promise<void> {
  await page.goto(`${MOTION_ORIGIN}/m35/lists`);
  await expect(page.getByRole('heading', { level: 1, name: 'Section 7: animating lists' })).toBeVisible();
  // The first render runs the enter animation of the three keyed and the three indexed rows: end them, so every
  // test starts from a quiet page.
  await expect.poll(async () => (await documentAnimations(page)).length).toBe(6);
  await finishAll(page);
  await expect(page.locator('.m35-row-in')).toHaveCount(0);
}

/** Waits two frames, so work the runtime queues for the next render has run before an absence is asserted. */
function settle(page: Page): Promise<void> {
  return page.evaluate(() => new Promise<void>((done) => requestAnimationFrame(() => requestAnimationFrame(() => done()))));
}

/** The texts of the rows of a list, in DOM order. */
function rowTexts(page: Page, testId: string): Promise<string[]> {
  return page.getByTestId(testId).getByRole('listitem').allTextContents().then((texts) => texts.map((text) => text.trim()));
}

test('Section 7: an added row runs its enter animation and a removed row its leave animation', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await openLists(page);

  await page.getByRole('button', { name: 'Toggle row D' }).click();
  const added = page.getByTestId('row-D');
  await expect(added).toHaveClass(/m35-row-in/);
  expect((await animationsOf(added)).map(({ kind, playState }) => `${kind} ${playState}`)).toEqual(['css-animation running']);
  // The other rows were not touched.
  expect(await animationsOf(page.getByTestId('row-A'))).toEqual([]);
  await finishAll(page);
  await expect(added).not.toHaveClass(/m35-row-in/);

  await page.getByRole('button', { name: 'Toggle row B' }).click();
  const removed = page.getByTestId('row-B');
  // The row left the model, yet it is still attached, with its leave class and a running animation.
  await expect(removed).toHaveClass(/m35-row-out/);
  await expect(removed).toHaveCount(1);
  expect((await animationsOf(removed)).map(({ playState }) => playState)).toEqual(['running']);
  await finishAll(page);
  await expect(removed).toHaveCount(0);
  expect(await rowTexts(page, 'keyed-list')).toEqual(['Row A', 'Row C', 'Row D']);

  await context.close();
});

test('Section 7: reordering with a stable track keeps every element and runs no leave animation', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await openLists(page);
  const list = page.getByTestId('keyed-list');
  // Tag the elements, to tell afterwards that the same elements moved rather than new ones appeared.
  await list.getByRole('listitem').evaluateAll((items) => items.forEach((item) => item.setAttribute('data-kept', 'yes')));

  await page.getByRole('button', { name: 'Reverse order' }).click();
  await expect.poll(() => rowTexts(page, 'keyed-list')).toEqual(['Row C', 'Row B', 'Row A']);
  // The row that moved to the end replays its enter class (run, not the plan): the other two move silently.
  await expect(page.getByTestId('row-A')).toHaveClass(/m35-row-in/);
  await settle(page);

  await expect(list.locator('[data-kept="yes"]')).toHaveCount(3);
  await expect(list.locator('.m35-row-out')).toHaveCount(0);
  expect(await classesOf(page.getByTestId('row-B'))).toEqual(['m35-row']);
  expect(await classesOf(page.getByTestId('row-C'))).toEqual(['m35-row']);
  expect((await documentAnimations(page)).map(({ kind }) => kind)).toEqual(['css-animation']);
  await finishAll(page);
  await expect(list.getByRole('listitem')).toHaveCount(3);

  await context.close();
});

test('Section 7: track $index rewrites rows in place on a reorder and animates the last row when the first item goes', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await openLists(page);
  const readEvents = await recordEvents(page, '[data-testid="index-list"]', ['animationstart', 'animationend', 'animationcancel']);

  await page.getByRole('button', { name: 'Reverse index list' }).click();
  await expect.poll(() => rowTexts(page, 'index-list')).toEqual(['C', 'B', 'A']);
  await settle(page);
  // The same three elements stay where they are and only their text changed: nothing entered or left.
  expect(await documentAnimations(page)).toEqual([]);
  expect(await readEvents()).toEqual([]);

  await page.getByRole('button', { name: 'Remove first indexed item' }).click();
  const last = page.getByTestId('index-row-2');
  // The item that left the model is the first one (C), but the element that leaves is the last one.
  await expect(last).toHaveClass(/m35-row-out/);
  expect((await animationsOf(last)).map(({ playState }) => playState)).toEqual(['running']);
  expect(await classesOf(page.getByTestId('index-row-0'))).toEqual(['m35-row']);
  expect(await classesOf(page.getByTestId('index-row-1'))).toEqual(['m35-row']);
  await expect(page.getByTestId('index-row-0')).toHaveText('B');
  await expect(page.getByTestId('index-row-1')).toHaveText('A');
  await finishAll(page);
  await expect(last).toHaveCount(0);

  await context.close();
});

test('Section 7: re-adding a row during its leave animation leaves one copy', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await openLists(page);
  const row = page.getByTestId('row-B');

  await page.getByRole('button', { name: 'Toggle row B' }).click();
  await expect(row).toHaveClass(/m35-row-out/);
  const leaving = await row.elementHandle();
  expect(leaving).not.toBeNull();

  // The same row comes back before its leave animation has ended.
  await page.getByRole('button', { name: 'Toggle row B' }).click();
  await expect(row).toHaveCount(1);
  await expect(row).toHaveClass(/m35-row-in/);
  // The leaving copy was detached, not kept beside the new one.
  expect(await leaving?.evaluate((element) => element.isConnected)).toBe(false);
  expect(await rowTexts(page, 'keyed-list')).toEqual(['Row A', 'Row B', 'Row C']);

  await finishAll(page);
  await expect(row).toHaveCount(1);
  await expect(page.getByTestId('keyed-list').getByRole('listitem')).toHaveCount(3);

  await context.close();
});

test("Section 7: each row's animation-delay follows its index", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await openLists(page);

  await page.getByRole('button', { name: 'Toggle staggered list' }).click();
  const rows = page.getByTestId('stagger-list').getByRole('listitem');
  await expect(rows).toHaveCount(4);
  const delays: number[] = [];
  for (let index = 0; index < 4; index++) {
    const [animation] = await animationsOf(page.getByTestId(`stagger-row-${index}`));
    expect(animation?.kind).toBe('css-animation');
    delays.push(animation?.delay ?? -1);
  }
  expect(delays).toEqual([0, 40, 80, 120]);

  await context.close();
});

test('Section 7: a FLIP glide on a reorder plays a script animation on each row that changed place', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await openLists(page);

  await page.getByRole('checkbox', { name: 'Glide on reorder' }).check();
  await page.getByRole('button', { name: 'Reverse order' }).click();
  await expect.poll(() => rowTexts(page, 'keyed-list')).toEqual(['Row C', 'Row B', 'Row A']);
  const scripts = async (row: string): Promise<number> =>
    (await animationsOf(page.getByTestId(`row-${row}`))).filter(({ kind }) => kind === 'script').length;
  // Rows A and C swapped places and glide; row B stays in the middle, so it has nothing to play.
  await expect.poll(() => scripts('A')).toBe(1);
  expect(await scripts('C')).toBe(1);
  expect(await scripts('B')).toBe(0);
  await expect(page.getByTestId('keyed-list').locator('.m35-row-out')).toHaveCount(0);

  await context.close();
});
