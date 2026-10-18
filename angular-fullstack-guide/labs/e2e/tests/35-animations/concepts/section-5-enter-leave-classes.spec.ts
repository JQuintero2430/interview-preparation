import { expect, type Locator, type Page, test } from '@playwright/test';
import { animationsOf, classesOf, finishAll, MOTION_ORIGIN } from '../support/motion.js';

async function openEnterLeave(page: Page): Promise<void> {
  await page.goto(`${MOTION_ORIGIN}/m35/enter-leave`);
  await expect(page.getByRole('heading', { level: 1, name: 'Section 5: enter and leave with classes' })).toBeVisible();
}

/** The names of the CSS animations running on one element. */
async function animationNames(box: Locator): Promise<string[]> {
  return (await animationsOf(box)).map(({ name }) => name.replace(/^.*?(m35-[a-z-]+)$/, '$1'));
}

test('Section 5: the enter class is present while the animation runs and removed after it', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await openEnterLeave(page);
  const box = page.getByTestId('enter-box');

  await page.getByRole('button', { name: 'Toggle enter box' }).click();
  await expect(box).toHaveClass(/m35-enter-slide/);
  expect(await animationNames(box)).toEqual(['m35-slide-in']);

  await finishAll(page);
  await expect(box).not.toHaveClass(/m35-enter-slide/);
  expect(await animationsOf(box)).toEqual([]);
  // The element itself stays: only the classes go.
  await expect(box).toBeVisible();

  await context.close();
});

test('Section 5: the element stays in the DOM until its leave animation ends', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await openEnterLeave(page);
  const box = page.getByTestId('leave-box');

  await page.getByRole('button', { name: 'Toggle leave box' }).click();
  // The binding is false now, yet the element is still attached and carries the leave class.
  await expect(box).toHaveClass(/m35-leave-fade/);
  await expect(box).toHaveCount(1);
  expect((await animationsOf(box)).map(({ playState }) => playState)).toEqual(['running']);

  await finishAll(page);
  await expect(box).toHaveCount(0);

  await context.close();
});

test('Section 5: a leave class that animates nothing removes the element at once', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await openEnterLeave(page);
  const box = page.getByTestId('plain-box');
  await expect(box).toHaveCount(1);

  await page.getByRole('button', { name: 'Toggle plain box' }).click();
  // No finishAll: nothing animates, so nothing is waited for.
  await expect(box).toHaveCount(0);

  await context.close();
});

test('Section 5: an infinite animation does not delay removal', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await openEnterLeave(page);
  const box = page.getByTestId('infinite-box');
  await expect(box).toHaveCount(1);
  // The leave class really declares an infinite animation, so removal skips it rather than finding none. Read from
  // the computed style: an animationstart listener races the removal under load and can miss the event.
  const iterations = await box.evaluate((element) => {
    element.classList.add('m35-leave-spin');
    const count = getComputedStyle(element).animationIterationCount;
    element.classList.remove('m35-leave-spin');
    return count;
  });
  expect(iterations).toBe('infinite');

  await page.getByRole('button', { name: 'Toggle infinite box' }).click();
  await expect(box).toHaveCount(0);

  await context.close();
});

test('Section 5: an array and a signal-bound class list both apply', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await openEnterLeave(page);
  const arrayBox = page.getByTestId('array-box');
  const signalBox = page.getByTestId('signal-box');

  await page.getByRole('button', { name: 'Toggle bound boxes' }).click();
  // One class names the keyframes and the other sets the duration: an animation exists only if both applied.
  for (const [box, prefix] of [
    [arrayBox, 'array'],
    [signalBox, 'sig'],
  ] as const) {
    await expect(box).toHaveClass(new RegExp(`m35-${prefix}-a`));
    expect(await classesOf(box)).toEqual(expect.arrayContaining([`m35-${prefix}-a`, `m35-${prefix}-b`]));
    expect(await animationNames(box)).toEqual(['m35-slide-in']);
  }

  await finishAll(page);
  await expect(arrayBox).not.toHaveClass(/m35-array/);
  await expect(signalBox).not.toHaveClass(/m35-sig/);

  await context.close();
});

test('Section 5: animate.enter works as a host binding', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await openEnterLeave(page);
  const host = page.getByTestId('host-box');

  await page.getByRole('button', { name: 'Toggle host box' }).click();
  await expect(host).toHaveClass(/m35-host-in/);
  expect(await host.evaluate((element) => element.tagName.toLowerCase())).toBe('lab-m35-host-enter');
  expect((await animationsOf(host)).map(({ kind }) => kind)).toEqual(['css-animation']);

  await finishAll(page);
  await expect(host).not.toHaveClass(/m35-host-in/);

  await context.close();
});
