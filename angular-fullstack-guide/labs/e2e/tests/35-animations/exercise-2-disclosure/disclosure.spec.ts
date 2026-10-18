import { expect, type Page, test } from '@playwright/test';
import { animationsOf, finishAll, MOTION_ORIGIN, pauseAll, seek } from '../support/motion.js';

// Exercise 35.2: the same five criteria run over variant a (grid rows) and variant b (interpolate-size).
for (const variant of ['a', 'b']) {
  async function open(page: Page): Promise<void> {
    await page.goto(`${MOTION_ORIGIN}/m35/ex2/${variant}`);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Exercise 35.2');
  }

  test.describe(`variant ${variant}`, () => {
    test('starts closed with its content not focusable', async ({ browser }) => {
      const context = await browser.newContext({ reducedMotion: 'no-preference' });
      const page = await context.newPage();
      await open(page);

      const toggle = page.getByRole('button', { name: 'Toggle details' });
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      const focused = await page
        .locator('[data-content] a')
        .evaluate((link) => (link as HTMLElement).focus() ?? document.activeElement === link);
      expect(focused).toBe(false);
      expect(await page.locator('[data-disclosure]').evaluate((panel) => panel.getBoundingClientRect().height)).toBe(0);

      await context.close();
    });

    test('opens with a running transition', async ({ browser }) => {
      const context = await browser.newContext({ reducedMotion: 'no-preference' });
      const page = await context.newPage();
      await open(page);

      const panel = page.locator('[data-disclosure]');
      await page.getByRole('button', { name: 'Toggle details' }).click();
      await expect(page.getByRole('button', { name: 'Toggle details' })).toHaveAttribute('aria-expanded', 'true');
      await expect
        .poll(async () => (await animationsOf(panel)).map(({ kind, playState }) => `${kind} ${playState}`))
        .toEqual(['css-transition running']);
      const [transition] = await animationsOf(panel);
      expect(transition?.property).toBe(variant === 'a' ? 'grid-template-rows' : 'height');

      await context.close();
    });

    test("ends at the content's natural height", async ({ browser }) => {
      const context = await browser.newContext({ reducedMotion: 'no-preference' });
      const page = await context.newPage();
      await open(page);

      const panel = page.locator('[data-disclosure]');
      await page.getByRole('button', { name: 'Toggle details' }).click();
      await expect.poll(async () => (await animationsOf(panel)).length).toBe(1);
      await finishAll(page);
      await expect.poll(async () => (await animationsOf(panel)).length).toBe(0);

      const heights = await page.evaluate(() => {
        const wrapper = document.querySelector('[data-disclosure]');
        const content = document.querySelector('[data-content]');
        return { panel: wrapper?.getBoundingClientRect().height ?? -1, natural: content?.scrollHeight ?? -2 };
      });
      expect(heights.natural).toBeGreaterThan(0);
      expect(Math.abs(heights.panel - heights.natural)).toBeLessThanOrEqual(1);
      // The closed content could not be focused; the open content can.
      const focused = await page
        .locator('[data-content] a')
        .evaluate((link) => (link as HTMLElement).focus() ?? document.activeElement === link);
      expect(focused).toBe(true);

      await context.close();
    });

    test('reverses from its current height when toggled mid-animation', async ({ browser }) => {
      const context = await browser.newContext({ reducedMotion: 'no-preference' });
      const page = await context.newPage();
      await open(page);

      const panel = page.locator('[data-disclosure]');
      const toggle = page.getByRole('button', { name: 'Toggle details' });
      const heightOf = (): Promise<number> => panel.evaluate((element) => element.getBoundingClientRect().height);
      const natural = await page.locator('[data-content]').evaluate((element) => element.scrollHeight);

      await toggle.click();
      await expect.poll(async () => (await animationsOf(panel)).length).toBe(1);
      await pauseAll(page);
      await seek(page, 400);
      const midway = await heightOf();
      expect(midway).toBeGreaterThan(0);
      expect(midway).toBeLessThan(natural);

      // Closing now starts a new transition from the height it has, not from the open or closed end.
      await toggle.click();
      await expect(toggle).toHaveAttribute('aria-expanded', 'false');
      await expect
        .poll(async () => (await animationsOf(panel)).map(({ kind }) => kind))
        .toEqual(['css-transition']);
      await pauseAll(page);
      const reversing = await heightOf();
      expect(reversing).toBeGreaterThan(0);
      expect(reversing).toBeLessThan(natural);

      await context.close();
    });

    test('opens and closes without a transition when reduced motion is requested', async ({ browser }) => {
      const context = await browser.newContext({ reducedMotion: 'reduce' });
      const page = await context.newPage();
      await open(page);

      const panel = page.locator('[data-disclosure]');
      const toggle = page.getByRole('button', { name: 'Toggle details' });
      const natural = await page.locator('[data-content]').evaluate((element) => element.scrollHeight);

      await toggle.click();
      await expect.poll(() => panel.evaluate((element) => element.getBoundingClientRect().height)).toBeGreaterThan(0);
      expect(await animationsOf(panel)).toEqual([]);
      expect(Math.abs((await panel.evaluate((element) => element.getBoundingClientRect().height)) - natural)).toBeLessThanOrEqual(1);

      await toggle.click();
      await expect.poll(() => panel.evaluate((element) => element.getBoundingClientRect().height)).toBe(0);
      expect(await animationsOf(panel)).toEqual([]);

      await context.close();
    });
  });
}
