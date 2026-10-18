import { expect, test } from '@playwright/test';
import { animationsOf, classesOf, distScripts, finishAll, MOTION_ORIGIN } from './support/motion.js';

// A string of the legacy package's renderer (its NG_ANIMATING_CLASSNAME): present only where @angular/animations is bundled.
const LEGACY_MARKER = 'ng-animating';

test('Smoke: the animations lab serves the home page and runs its enter animation', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();

  await page.goto(`${MOTION_ORIGIN}/`);
  await expect(page.getByRole('heading', { level: 1, name: 'Module 35 animations lab' })).toBeVisible();
  await page.getByRole('button', { name: 'Toggle message' }).click();

  const message = page.getByText('The message entered with a 400 ms fade.');
  await expect(message).toBeVisible();
  expect(await classesOf(message)).toContain('m35-fade-in');
  const running = await animationsOf(message);
  expect(running.map((animation) => animation.kind)).toEqual(['css-animation']);
  expect(running[0]?.name).toContain('m35-fade');
  await finishAll(page);
  await context.close();
});

test('Smoke: no chunk of the native build contains the legacy animation engine', async () => {
  const native = await distScripts('animations-lab/browser');
  expect(native).not.toContain(LEGACY_MARKER);
});

test('Smoke: the legacy build serves the same page under /legacy/', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();

  await page.goto(`${MOTION_ORIGIN}/legacy/`);
  await expect(page.getByRole('heading', { level: 1, name: 'Module 35 animations lab' })).toBeVisible();
  expect(await distScripts('animations-lab-legacy/browser')).toContain(LEGACY_MARKER);
  await context.close();
});
