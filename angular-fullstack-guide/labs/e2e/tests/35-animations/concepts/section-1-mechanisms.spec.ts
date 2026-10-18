import { expect, test } from '@playwright/test';
import { animationsOf, classesOf, finishAll, MOTION_ORIGIN } from '../support/motion.js';

test('Section 1: each mechanism creates an Animation object on the element', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await page.goto(`${MOTION_ORIGIN}/m35/mechanisms`);

  await page.getByRole('button', { name: 'Start transition' }).click();
  await page.getByRole('button', { name: 'Start keyframe animation' }).click();
  await page.getByRole('button', { name: 'Start script animation' }).click();

  const transition = await animationsOf(page.getByTestId('transition-box'));
  const keyframes = await animationsOf(page.getByTestId('keyframes-box'));
  const script = await animationsOf(page.getByTestId('script-box'));
  expect(transition.map(({ kind, property }) => ({ kind, property }))).toEqual([{ kind: 'css-transition', property: 'transform' }]);
  expect(keyframes.map(({ kind }) => kind)).toEqual(['css-animation']);
  expect(keyframes[0]?.name).toContain('m35-pulse');
  expect(script.map(({ kind }) => kind)).toEqual(['script']);

  await finishAll(page);
  await context.close();
});

test('Section 1: the native build has no animation provider and still runs animate.enter', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await page.goto(`${MOTION_ORIGIN}/m35/mechanisms`);
  // The page prints inject(ANIMATION_MODULE_TYPE, { optional: true }): no provider supplies it in the native build.
  await expect(page.getByText('Animation provider: null')).toBeVisible();

  await page.goto(`${MOTION_ORIGIN}/`);
  await page.getByRole('button', { name: 'Toggle message' }).click();
  const message = page.getByText('The message entered with a 400 ms fade.');
  await expect(message).toBeVisible();
  expect(await classesOf(message)).toContain('m35-fade-in');

  // Angular removes the enter class when the animation ends.
  await finishAll(page);
  await expect.poll(() => classesOf(message)).not.toContain('m35-fade-in');
  await context.close();
});
