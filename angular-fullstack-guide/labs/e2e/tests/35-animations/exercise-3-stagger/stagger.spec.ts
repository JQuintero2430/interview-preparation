import { expect, type Page, test } from '@playwright/test';
import { animationsOf, documentAnimations, finishAll, MOTION_ORIGIN } from '../support/motion.js';

/** Waits two frames, so the work Angular queues for the next render (the end-of-animation listeners) has run. */
function settle(page: Page): Promise<void> {
  return page.evaluate(() => new Promise<void>((done) => requestAnimationFrame(() => requestAnimationFrame(() => done()))));
}

// Exercise 35.3: the same criteria run over variant a (CSS delays) and variant b (element.animate delays).
// The "declares no legacy animations metadata" criterion has no screen: it is the ng test no-legacy.spec.ts.
for (const variant of ['a', 'b']) {
  async function open(page: Page): Promise<void> {
    await page.goto(`${MOTION_ORIGIN}/m35/ex3/${variant}`);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Exercise 35.3');
  }

  test.describe(`variant ${variant}`, () => {
    test('gives each entering item a delay that grows with its position', async ({ browser }) => {
      const context = await browser.newContext({ reducedMotion: 'no-preference' });
      const page = await context.newPage();
      await open(page);

      await page.getByRole('button', { name: 'Show list' }).click();
      await expect(page.locator('[data-item]')).toHaveCount(4);
      await expect.poll(async () => (await documentAnimations(page)).length).toBe(4);
      const delays: number[] = [];
      for (const id of [1, 2, 3, 4]) {
        const [animation] = await animationsOf(page.locator(`[data-item="${id}"]`));
        delays.push(animation?.delay ?? -1);
      }
      expect(delays).toEqual([0, 60, 120, 180]);

      await finishAll(page);
      await context.close();
    });

    test('animates a removed item before it leaves the DOM', async ({ browser }) => {
      const context = await browser.newContext({ reducedMotion: 'no-preference' });
      const page = await context.newPage();
      await open(page);

      await page.getByRole('button', { name: 'Show list' }).click();
      await expect.poll(async () => (await documentAnimations(page)).length).toBe(4);
      // Finishing before the runtime has attached its end listeners would leave the enter class on the items.
      await settle(page);
      await finishAll(page);
      await expect.poll(async () => (await documentAnimations(page)).length).toBe(0);

      await page.getByRole('button', { name: 'Remove first' }).click();
      const first = page.locator('[data-item="1"]');
      // The item is out of the data, yet still attached while its leave animation runs.
      await expect.poll(async () => (await animationsOf(first)).map(({ playState }) => playState)).toEqual(['running']);
      await expect(first).toHaveCount(1);

      await finishAll(page);
      await expect(first).toHaveCount(0);
      await expect(page.locator('[data-item]')).toHaveCount(3);

      await context.close();
    });

    test('runs no animation on reorder', async ({ browser }) => {
      const context = await browser.newContext({ reducedMotion: 'no-preference' });
      const page = await context.newPage();
      await open(page);

      await page.getByRole('button', { name: 'Show list' }).click();
      await expect.poll(async () => (await documentAnimations(page)).length).toBe(4);
      // Let the enters end by themselves: finish() before the runtime attached its end listeners would leave the class on.
      await expect.poll(async () => (await documentAnimations(page)).length).toBe(0);
      await expect(page.locator('.m35-ex3-in')).toHaveCount(0);
      // Mark the elements to prove the reorder moves them instead of recreating them.
      await page.locator('[data-item]').evaluateAll((items) => items.forEach((item) => item.setAttribute('data-kept', '')));

      await page.getByRole('button', { name: 'Reverse' }).click();
      await expect(page.locator('[data-item]').first()).toHaveAttribute('data-item', '4');
      await settle(page);
      await expect(page.locator('[data-item][data-kept]')).toHaveCount(4);
      expect(await documentAnimations(page)).toEqual([]);

      await context.close();
    });

    test('shows the list without animations when reduced motion is requested', async ({ browser }) => {
      const context = await browser.newContext({ reducedMotion: 'reduce' });
      const page = await context.newPage();
      await open(page);

      await page.getByRole('button', { name: 'Show list' }).click();
      await expect(page.locator('[data-item]')).toHaveCount(4);
      expect(await documentAnimations(page)).toEqual([]);

      // No finishAll: with nothing to wait for, the item leaves at once.
      await page.getByRole('button', { name: 'Remove first' }).click();
      await expect(page.locator('[data-item]')).toHaveCount(3);

      await context.close();
    });
  });
}

// The "before" state: the legacy trigger, served only under /legacy/ (section 8 owns the mechanism).
test('Before: the legacy stagger keeps every delay at 0 and lengthens each duration by 60 ms', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await page.goto(`${MOTION_ORIGIN}/legacy/m35/ex3/before`);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Exercise 35.3 before');

  await page.getByRole('button', { name: 'Show list' }).click();
  await expect(page.locator('[data-item]')).toHaveCount(4);
  await expect.poll(async () => (await documentAnimations(page)).length).toBe(4);
  const timings: { delay: number; duration: number }[] = [];
  for (const id of [1, 2, 3, 4]) {
    const timing = await page.locator(`[data-item="${id}"]`).evaluate((element) => {
      const effect = element.getAnimations()[0]?.effect;
      return { delay: Number(effect?.getTiming().delay), duration: Number(effect?.getTiming().duration) };
    });
    timings.push(timing);
  }
  expect(timings.map(({ delay }) => delay)).toEqual([0, 0, 0, 0]);
  expect(timings.map(({ duration }) => duration)).toEqual([800, 860, 920, 980]);

  await finishAll(page);
  await context.close();
});
