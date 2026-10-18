import { expect, type Locator, type Page, test } from '@playwright/test';
import { animationsOf, finishAll, MOTION_ORIGIN } from '../support/motion.js';

async function openCallbacks(page: Page, path = '/m35/callbacks'): Promise<void> {
  await page.goto(`${MOTION_ORIGIN}${path}`);
  await expect(page.getByRole('heading', { level: 1, name: 'Section 6: function callbacks and nested leaves' })).toBeVisible();
}

/** Lets the page render two frames, so a removal that was going to happen has happened. */
async function twoFrames(page: Page): Promise<void> {
  await page.evaluate(
    () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))),
  );
}

/** The kinds and play states of the animations on one element. */
async function runningKinds(box: Locator): Promise<string[]> {
  return (await animationsOf(box)).map(({ kind, playState }) => `${kind} ${playState}`);
}

test('Section 6: the leave callback receives the element and removal waits for animationComplete', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await openCallbacks(page);
  const box = page.getByTestId('manual-box');

  await page.getByRole('button', { name: 'Remove manual box' }).click();
  // The callback ran with the element itself as event.target.
  await expect(page.getByTestId('callback-target')).toHaveText('manual-box');
  await twoFrames(page);
  // Nothing animates, yet the element stays: it waits for animationComplete.
  await expect(box).toHaveCount(1);
  expect(await animationsOf(box)).toEqual([]);

  await page.getByRole('button', { name: 'Complete leave' }).click();
  await expect(box).toHaveCount(0);

  await context.close();
});

test("Section 6: a leave callback that never calls animationComplete is removed after the route's MAX_ANIMATION_TIMEOUT", async ({
  browser,
}) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  // Without a route provider, nothing builds the page's own value.
  await openCallbacks(page);
  await page.getByRole('button', { name: 'Show timeout reads' }).click();
  await expect(page.getByTestId('timeout-reads')).toHaveText('0');

  // The short-timeout route provides MAX_ANIMATION_TIMEOUT through a factory that counts its calls.
  await openCallbacks(page, '/m35/callbacks/short-timeout');
  await page.getByRole('button', { name: 'Show timeout reads' }).click();
  // The page itself never injects the token: the animate.leave runtime asked the route's injector for it.
  await expect(page.getByTestId('timeout-reads')).toHaveText('1');

  const box = page.getByTestId('forgotten-box');
  await page.getByRole('button', { name: 'Remove forgotten box' }).click();
  // The callback ran (it marks the element) and never calls animationComplete; the timer removes the element.
  await expect(box).toHaveAttribute('data-leaving', 'true');
  await expect(box).toHaveCount(0);

  await context.close();
});

test('Section 6: a leave callback completes on a CSS animationend but not on an element.animate finish', async ({
  browser,
}) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await openCallbacks(page);
  const cssBox = page.getByTestId('css-callback-box');
  const silentBox = page.getByTestId('script-silent-box');
  const doneBox = page.getByTestId('script-done-box');

  await page.getByRole('button', { name: 'Remove animated boxes' }).click();
  // None of the three callbacks has called animationComplete yet.
  await expect.poll(() => runningKinds(cssBox)).toEqual(['css-animation running']);
  await expect.poll(() => runningKinds(silentBox)).toEqual(['script running']);
  await expect.poll(() => runningKinds(doneBox)).toEqual(['script running']);

  await finishAll(page);
  // The CSS animation fires animationend on the element: removed without animationComplete.
  await expect(cssBox).toHaveCount(0);
  // The script animation that calls animationComplete from its finished promise is removed too.
  await expect(doneBox).toHaveCount(0);
  // The script animation without animationComplete has finished, but fired no animationend: still attached.
  await twoFrames(page);
  await expect(silentBox).toHaveCount(1);
  expect(await runningKinds(silentBox)).toEqual(['script finished']);

  await context.close();
});

test('Section 6: descendants with animate.leave in the same template run before the parent is removed', async ({
  browser,
}) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await openCallbacks(page);
  const card = page.getByTestId('card');
  const line = page.getByTestId('card-line');
  const blockLine = page.getByTestId('card-block-line');

  await page.getByRole('button', { name: 'Remove card' }).click();
  // The card has no animate.leave of its own; its descendant and the element inside its inner @if animate.
  await expect(line).toHaveClass(/m35-line-out/);
  await expect(blockLine).toHaveClass(/m35-line-out/);
  expect(await runningKinds(line)).toEqual(['css-animation running']);
  expect(await runningKinds(blockLine)).toEqual(['css-animation running']);
  // Two frames later the card, whose removal the runtime is holding, is still attached.
  await twoFrames(page);
  await expect(card).toHaveCount(1);

  await finishAll(page);
  await expect(card).toHaveCount(0);

  await context.close();
});

test("Section 6: a child component's own animate.leave does not run when its parent is removed", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await openCallbacks(page);
  const card = page.getByTestId('child-card');
  const plainChild = page.getByTestId('child-plain');
  const hostLeaveChild = page.getByTestId('child-with-host-leave');

  await page.getByRole('button', { name: 'Remove child card' }).click();
  // The card's own leave runs, so the children are still attached while it does.
  await expect(card).toHaveClass(/m35-card-out/);
  await expect(card).toHaveCount(1);
  // animate.leave inside the child's template: no class, no animation.
  await expect(plainChild.getByTestId('child-inner')).not.toHaveClass(/m35-inner-out/);
  expect(await animationsOf(plainChild.getByTestId('child-inner'))).toEqual([]);
  // animate.leave on the child's host element, written in the parent's template: it runs.
  await expect(hostLeaveChild).toHaveClass(/m35-host-out/);
  expect(await runningKinds(hostLeaveChild)).toEqual(['css-animation running']);
  await expect(hostLeaveChild.getByTestId('child-inner')).not.toHaveClass(/m35-inner-out/);

  await finishAll(page);
  await expect(card).toHaveCount(0);

  await context.close();
});

test("Section 6: a dynamically created component's host animate.leave runs on clear", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await openCallbacks(page);
  const card = page.getByTestId('dynamic-card');

  await page.getByRole('button', { name: 'Create dynamic card' }).click();
  await expect(card).toHaveCount(1);
  await expect(card).not.toHaveClass(/m35-dynamic-out/);

  await page.getByRole('button', { name: 'Clear dynamic cards' }).click();
  await expect(card).toHaveClass(/m35-dynamic-out/);
  await expect(card).toHaveCount(1);
  expect(await runningKinds(card)).toEqual(['css-animation running']);

  await finishAll(page);
  await expect(card).toHaveCount(0);

  await context.close();
});
