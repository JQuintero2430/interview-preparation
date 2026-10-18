import { expect, type Page, test } from '@playwright/test';
import { animationsOf, classesOf, finishAll, MOTION_ORIGIN } from '../support/motion.js';

async function openInternals(page: Page): Promise<void> {
  await page.goto(`${MOTION_ORIGIN}/m35/internals`);
  await expect(page.getByRole('heading', { level: 1, name: 'Section 12: under the hood' })).toBeVisible();
}

test('Section 12: the leaving element is still attached after the render that removed it from the model', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await openInternals(page);
  const note = page.getByTestId('note');

  await page.getByRole('button', { name: 'Hide the note' }).click();
  // The page sets this text when ApplicationRef.whenStable() resolves after the removal: the render is over.
  await expect(page.getByTestId('stable-status')).toHaveText('Stable after removal: yes');
  await expect(note).toHaveCount(1);
  expect(await classesOf(note)).toEqual(['m35-internals-box', 'm35-internals-out']);
  expect((await animationsOf(note)).map(({ kind, playState }) => `${kind} ${playState}`)).toEqual(['css-animation running']);

  await finishAll(page);
  await expect(note).toHaveCount(0);

  await context.close();
});

test('Section 12: two removals in one change detection resolve together', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await openInternals(page);
  const first = page.getByTestId('card-1');
  const second = page.getByTestId('card-2');

  await page.getByRole('button', { name: 'Remove both cards' }).click();
  // Both leave animations started from the same queued callback and run side by side.
  await expect(first).toHaveClass(/m35-internals-out/);
  await expect(second).toHaveClass(/m35-internals-out/);
  expect((await animationsOf(first)).map(({ playState }) => playState)).toEqual(['running']);
  expect((await animationsOf(second)).map(({ playState }) => playState)).toEqual(['running']);

  // One finishAll ends both animations, and both elements go.
  await finishAll(page);
  await expect(first).toHaveCount(0);
  await expect(second).toHaveCount(0);

  await context.close();
});

test('Section 12: toggling an @if twice during a leave leaves one element', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await openInternals(page);
  const note = page.getByTestId('note');
  const toggle = page.getByRole('button', { name: 'Toggle the note' });

  await toggle.click();
  await expect(note).toHaveClass(/m35-internals-out/);
  const leaving = await note.elementHandle();
  expect(leaving).not.toBeNull();

  // The @if becomes true again before the leave animation has ended.
  await toggle.click();
  // Every element the @if shows, with its classes: one, and not leaving.
  await expect.poll(() => note.evaluateAll((elements) => elements.map((element) => element.className))).toEqual([
    'm35-internals-box',
  ]);
  // The leaving element was detached at once, not kept beside the new one until its animation ended.
  expect(await leaving?.evaluate((element) => element.isConnected)).toBe(false);

  await context.close();
});
