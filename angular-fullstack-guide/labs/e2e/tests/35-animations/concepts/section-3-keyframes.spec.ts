import { expect, type Page, test } from '@playwright/test';
import { animationsOf, finishAll, MOTION_ORIGIN, recordEvents, seek } from '../support/motion.js';

const ANIMATION_EVENTS = ['animationstart', 'animationiteration', 'animationend', 'animationcancel'] as const;

async function openKeyframes(page: Page): Promise<void> {
  await page.goto(`${MOTION_ORIGIN}/m35/keyframes`);
  await expect(page.getByRole('heading', { level: 1, name: 'Section 3: CSS keyframe animations' })).toBeVisible();
}

const opacityOf = (box: { evaluate: <R>(fn: (element: Element) => R) => Promise<R> }): Promise<string> =>
  box.evaluate((element) => getComputedStyle(element).opacity);

test('Section 3: an animation with fill-mode forwards keeps its last keyframe after finishing', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await openKeyframes(page);
  const box = page.getByTestId('forwards-box');

  await page.getByRole('button', { name: 'Start fades' }).click();
  await expect.poll(async () => (await animationsOf(box)).map(({ kind, fill }) => ({ kind, fill }))).toEqual([{ kind: 'css-animation', fill: 'forwards' }]);
  expect((await animationsOf(box))[0]?.name).toContain('m35-fade');

  await finishAll(page);
  // The animation is finished, yet its effect still applies: the last keyframe (opacity 0.3) wins over the box's own 1.
  await expect.poll(async () => (await animationsOf(box)).map(({ playState }) => playState)).toEqual(['finished']);
  expect(await opacityOf(box)).toBe('0.3');

  await context.close();
});

test('Section 3: without forwards the element returns to its own style', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await openKeyframes(page);
  const box = page.getByTestId('plain-box');

  await page.getByRole('button', { name: 'Start fades' }).click();
  await expect.poll(async () => (await animationsOf(box)).map(({ kind, fill }) => ({ kind, fill }))).toEqual([{ kind: 'css-animation', fill: 'none' }]);

  await finishAll(page);
  // Once it ends, the animation has no effect left: the box has no animation and the cascade's opacity (1) shows again.
  await expect.poll(async () => animationsOf(box)).toEqual([]);
  expect(await opacityOf(box)).toBe('1');

  await context.close();
});

test('Section 3: animationiteration fires once per completed iteration', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await openKeyframes(page);
  const box = page.getByTestId('iterating-box');
  await expect(box).toBeVisible();
  const read = await recordEvents(page, '[data-testid="iterating-box"]', ANIMATION_EVENTS);
  const types = async (): Promise<string[]> => (await read()).map(({ type }) => type);
  // Pause inside the animationstart handler, so no real time passes before the test seeks.
  const paused = page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        document.querySelector('[data-testid="iterating-box"]')?.addEventListener(
          'animationstart',
          () => {
            document.getAnimations().forEach((animation) => animation.pause());
            resolve();
          },
          { once: true },
        );
      }),
  );

  await page.getByRole('button', { name: 'Start three iterations' }).click();
  await paused;
  expect((await animationsOf(box)).map(({ iterations }) => iterations)).toEqual([3]);
  expect(await types()).toEqual(['animationstart']);

  // 1000 ms per iteration: 1500 is inside the second iteration, 2500 inside the third.
  await seek(page, 1500);
  await expect.poll(types).toEqual(['animationstart', 'animationiteration']);
  await seek(page, 2500);
  await expect.poll(types).toEqual(['animationstart', 'animationiteration', 'animationiteration']);

  // The end of the last iteration fires animationend, not another animationiteration.
  await seek(page, 3000);
  await expect.poll(types).toEqual(['animationstart', 'animationiteration', 'animationiteration', 'animationend']);
  expect((await read()).map(({ name }) => name).every((name) => name.includes('m35-slide'))).toBe(true);

  await context.close();
});

test("Section 3: a global class cannot use a component's keyframes", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await openKeyframes(page);
  const local = page.getByTestId('local-box');
  const global = page.getByTestId('global-box');

  await page.getByRole('button', { name: 'Start both grows' }).click();
  // Both classes say `animation: m35-grow 800ms`; only the component's own rule found keyframes with that name.
  await expect.poll(async () => (await animationsOf(local)).map(({ kind }) => kind)).toEqual(['css-animation']);
  const scoped = (await animationsOf(local))[0]?.name ?? '';
  expect(scoped).toMatch(/.+_m35-grow$/);
  expect(await animationsOf(global)).toEqual([]);

  // The stylesheets hold the renamed declaration, and no keyframes called plain `m35-grow`.
  const declared = await page.evaluate(() =>
    [...document.styleSheets].flatMap((sheet) => [...sheet.cssRules]).filter((rule): rule is CSSKeyframesRule => rule instanceof CSSKeyframesRule).map((rule) => rule.name),
  );
  expect(declared).toContain(scoped);
  expect(declared).not.toContain('m35-grow');

  await finishAll(page);
  await context.close();
});
