import { expect, type Page, test } from '@playwright/test';
import { animationsOf, classesOf, documentAnimations, finishAll, MOTION_ORIGIN } from '../support/motion.js';

async function openLegacy(page: Page): Promise<void> {
  await page.goto(`${MOTION_ORIGIN}/legacy/m35/legacy`);
  await expect(page.getByRole('heading', { level: 1, name: 'Section 8: legacy animations' })).toBeVisible();
}

test('Section 8: a legacy trigger plays its transition through element.animate', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await openLegacy(page);
  const panel = page.getByTestId('legacy-panel');
  expect(await animationsOf(panel)).toEqual([]);

  await page.getByRole('button', { name: 'Toggle panel' }).click();
  // The engine plays the computed keyframes with element.animate: a script animation, not a CSS one.
  await expect.poll(async () => (await animationsOf(panel)).map(({ kind, playState }) => `${kind} ${playState}`)).toEqual(['script running']);
  await finishAll(page);
  await expect(panel).toHaveText('Panel is closed');
  await context.close();
});

test('Section 8: stagger lengthens each entering item\'s animation by the step and keeps its delay at 0', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await openLegacy(page);

  await page.getByRole('button', { name: 'Add three items' }).click();
  const items = page.getByTestId('legacy-list').getByRole('listitem');
  await expect(items).toHaveCount(3);
  await expect.poll(async () => (await documentAnimations(page)).length).toBe(3);
  const timings: { kind: string; delay: number; duration: number; offsets: number[] }[] = [];
  for (let index = 0; index < 3; index += 1) {
    const [info] = await animationsOf(items.nth(index));
    const detail = await items.nth(index).evaluate((element) => {
      const effect = element.getAnimations()[0]?.effect as KeyframeEffect;
      return { duration: Number(effect.getTiming().duration), offsets: effect.getKeyframes().map((frame) => Number(frame.offset)) };
    });
    timings.push({ kind: info?.kind ?? '', delay: info?.delay ?? -1, ...detail });
  }
  // The engine does not use the animation's delay: it holds the first keyframe for the item's share of a longer timeline.
  expect(timings.map(({ kind, delay }) => `${kind} ${delay}`)).toEqual(['script 0', 'script 0', 'script 0']);
  expect(timings.map(({ duration }) => duration)).toEqual([900, 1050, 1200]);
  expect(timings.map(({ offsets }) => offsets.length)).toEqual([2, 3, 3]);
  await finishAll(page);
  await context.close();
});

test('Section 8: elements carry ng-animating while a legacy animation runs', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await openLegacy(page);
  const panel = page.getByTestId('legacy-panel');
  expect(await classesOf(panel)).toContain('ng-trigger');
  expect(await classesOf(panel)).not.toContain('ng-animating');

  await page.getByRole('button', { name: 'Toggle panel' }).click();
  await expect.poll(async () => (await animationsOf(panel)).length).toBe(1);
  expect(await classesOf(panel)).toContain('ng-animating');
  await finishAll(page);
  await expect.poll(() => classesOf(panel)).not.toContain('ng-animating');
  await context.close();
});
