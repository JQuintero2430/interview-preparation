import { expect, type Page, test } from '@playwright/test';
import { animationsOf, documentAnimations, finishAll, MOTION_ORIGIN } from '../support/motion.js';

async function openWaapi(page: Page): Promise<void> {
  await page.goto(`${MOTION_ORIGIN}/m35/waapi`);
  await expect(page.getByRole('heading', { level: 1, name: 'Section 4: the Web Animations API' })).toBeVisible();
}

test('Section 4: element.animate returns an Animation that getAnimations lists with CSS ones', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await openWaapi(page);
  const box = page.getByTestId('both-box');

  await page.getByRole('button', { name: 'Start both' }).click();
  // The page printed what element.animate() handed back: a plain Animation, already running.
  await expect(page.getByTestId('animate-result')).toHaveText('animate() returned Animation, running');
  // One element, two mechanisms, one list: the class toggle's CSSTransition and the script's Animation.
  const animations = await animationsOf(box);
  expect(animations.map(({ kind, property }) => ({ kind, property }))).toEqual([
    { kind: 'css-transition', property: 'transform' },
    { kind: 'script', property: '' },
  ]);
  // The script animation carries exactly the options it was given.
  const timing = await box.evaluate((element) =>
    element
      .getAnimations()
      .filter((animation) => !(animation instanceof CSSTransition))
      .map((animation) => animation.effect?.getTiming().duration),
  );
  expect(timing).toEqual([2000]);

  await finishAll(page);
  await context.close();
});

test('Section 4: finished resolves after finish and rejects after cancel', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await openWaapi(page);
  const result = page.getByTestId('finished-result');

  await page.getByRole('button', { name: 'Run and finish' }).click();
  await expect(result).toHaveText('finished resolved with the Animation');

  await page.getByRole('button', { name: 'Run and cancel' }).click();
  await expect(result).toHaveText('finished rejected with AbortError');

  await context.close();
});

test('Section 4: commitStyles then cancel keeps the end style without an animation', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await openWaapi(page);
  const forwards = page.getByTestId('forwards-only-box');
  const committed = page.getByTestId('committed-box');
  const opacityOf = (box: typeof forwards): Promise<string> => box.evaluate((element) => getComputedStyle(element).opacity);

  await page.getByRole('button', { name: 'Keep end styles' }).click();
  // Both boxes end at the last keyframe, but only the first still has an animation: a finished one with fill forwards.
  expect(await opacityOf(forwards)).toBe('0.4');
  expect(await opacityOf(committed)).toBe('0.4');
  expect((await animationsOf(forwards)).map(({ playState, fill }) => ({ playState, fill }))).toEqual([{ playState: 'finished', fill: 'forwards' }]);
  expect(await animationsOf(committed)).toEqual([]);
  expect(await committed.evaluate((element) => (element as HTMLElement).style.opacity)).toBe('0.4');

  // Later style changes: the lingering effect keeps overriding the inline style; the committed value is just a style.
  await page.evaluate(() => document.querySelectorAll<HTMLElement>('.m35-box').forEach((element) => (element.style.opacity = '1')));
  expect(await opacityOf(forwards)).toBe('0.4');
  expect(await opacityOf(committed)).toBe('1');

  await context.close();
});

test("Section 4: pausing every animation from getAnimations freezes the page's motion", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await openWaapi(page);

  await page.getByRole('button', { name: 'Start script animation' }).click();
  // The spinner is a CSS animation and the box a script animation; one list holds both.
  await expect.poll(async () => (await documentAnimations(page)).map(({ kind }) => kind).sort()).toEqual(['css-animation', 'script']);
  expect((await documentAnimations(page)).map(({ playState }) => playState)).toEqual(['running', 'running']);

  await page.getByRole('button', { name: 'Pause all' }).click();
  expect((await documentAnimations(page)).map(({ playState }) => playState)).toEqual(['paused', 'paused']);
  // A pause takes effect when each animation's ready promise resolves; from then on its current time holds still.
  const times = (): Promise<(number | null)[]> => page.evaluate(() => document.getAnimations().map((animation) => animation.currentTime as number | null));
  await page.evaluate(() => Promise.all(document.getAnimations().map((animation) => animation.ready)));
  const frozen = await times();
  expect(frozen.every((time) => typeof time === 'number')).toBe(true);
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
  expect(await times()).toEqual(frozen);

  await page.getByRole('button', { name: 'Play all' }).click();
  expect((await documentAnimations(page)).map(({ playState }) => playState)).toEqual(['running', 'running']);

  await finishAll(page);
  await context.close();
});
