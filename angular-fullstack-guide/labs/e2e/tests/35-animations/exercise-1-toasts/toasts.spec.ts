import { expect, type Page, test } from '@playwright/test';
import { animationsOf, classesOf, finishAll, MOTION_ORIGIN } from '../support/motion.js';

// Exercise 35.1: the same five criteria run over variant a (classes) and variant b (functions).
for (const variant of ['a', 'b']) {
  async function open(page: Page): Promise<void> {
    await page.goto(`${MOTION_ORIGIN}/m35/ex1/${variant}`);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Exercise 35.1');
  }

  test.describe(`variant ${variant}`, () => {
    test('shows a new toast with an enter animation', async ({ browser }) => {
      const context = await browser.newContext({ reducedMotion: 'no-preference' });
      const page = await context.newPage();
      await open(page);

      await page.getByRole('button', { name: 'Show toast' }).click();
      const toast = page.locator('[data-toast="1"]');
      await expect(toast).toHaveCount(1);
      // The class can appear before the browser lists the animation, so wait on the animation.
      await expect.poll(async () => (await animationsOf(toast)).map(({ playState }) => playState)).toEqual(['running']);
      expect(await classesOf(toast)).toContain('m35-toast-in');

      await context.close();
    });

    test('removes the enter class when the animation ends', async ({ browser }) => {
      const context = await browser.newContext({ reducedMotion: 'no-preference' });
      const page = await context.newPage();
      await open(page);

      await page.getByRole('button', { name: 'Show toast' }).click();
      const toast = page.locator('[data-toast="1"]');
      await expect.poll(async () => (await animationsOf(toast)).length).toBe(1);
      expect(await classesOf(toast)).toContain('m35-toast-in');

      await finishAll(page);
      await expect(toast).not.toHaveClass(/m35-toast-in/);
      // Only the class goes: the toast stays.
      await expect(toast).toBeVisible();

      await context.close();
    });

    test('keeps a dismissed toast until its leave animation ends', async ({ browser }) => {
      const context = await browser.newContext({ reducedMotion: 'no-preference' });
      const page = await context.newPage();
      await open(page);

      await page.getByRole('button', { name: 'Show toast' }).click();
      const toast = page.locator('[data-toast="1"]');
      await expect.poll(async () => (await animationsOf(toast)).length).toBe(1);
      await finishAll(page);
      await expect.poll(async () => (await animationsOf(toast)).length).toBe(0);

      await page.getByRole('button', { name: 'Dismiss 1' }).click();
      // The toast is out of the store, yet still attached while its leave animation runs.
      await expect.poll(async () => (await animationsOf(toast)).map(({ playState }) => playState)).toEqual(['running']);
      await expect(toast).toHaveCount(1);

      await finishAll(page);
      await expect(toast).toHaveCount(0);

      await context.close();
    });

    test('leaves the other toasts in place when one is dismissed', async ({ browser }) => {
      const context = await browser.newContext({ reducedMotion: 'no-preference' });
      const page = await context.newPage();
      await open(page);

      await page.getByRole('button', { name: 'Show toast' }).click();
      await page.getByRole('button', { name: 'Show toast' }).click();
      const first = page.locator('[data-toast="1"]');
      const second = page.locator('[data-toast="2"]');
      await expect.poll(async () => (await animationsOf(first)).length + (await animationsOf(second)).length).toBe(2);
      await finishAll(page);
      await expect.poll(async () => (await animationsOf(second)).length).toBe(0);

      await page.getByRole('button', { name: 'Dismiss 1' }).click();
      await expect.poll(async () => (await animationsOf(first)).length).toBe(1);
      // The other toast keeps its element, with no animation of its own.
      await expect(second).toHaveCount(1);
      expect(await animationsOf(second)).toEqual([]);

      await finishAll(page);
      await expect(first).toHaveCount(0);
      await expect(second).toHaveCount(1);

      await context.close();
    });

    test('shows and removes toasts without animations when reduced motion is requested', async ({ browser }) => {
      const context = await browser.newContext({ reducedMotion: 'reduce' });
      const page = await context.newPage();
      await open(page);

      await page.getByRole('button', { name: 'Show toast' }).click();
      const toast = page.locator('[data-toast="1"]');
      await expect(toast).toBeVisible();
      expect(await animationsOf(toast)).toEqual([]);
      expect(await classesOf(toast)).not.toContain('m35-toast-in');

      // No finishAll: with nothing to wait for, the toast leaves at once.
      await page.getByRole('button', { name: 'Dismiss 1' }).click();
      await expect(toast).toHaveCount(0);

      await context.close();
    });
  });
}
