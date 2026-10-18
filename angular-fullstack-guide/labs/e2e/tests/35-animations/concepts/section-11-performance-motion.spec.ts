import { type Browser, expect, type Page, test } from '@playwright/test';
import { animationsOf, documentAnimations, finishAll, MOTION_ORIGIN } from '../support/motion.js';

type MotionPreference = 'no-preference' | 'reduce';

async function openMotion(page: Page): Promise<void> {
  await page.goto(`${MOTION_ORIGIN}/m35/motion`);
  await expect(page.getByRole('heading', { level: 1, name: 'Section 11: performance and reduced motion' })).toBeVisible();
}

/** A fresh page whose context sets `reducedMotion` explicitly. */
async function motionPage(browser: Browser, reducedMotion: MotionPreference): Promise<Page> {
  const context = await browser.newContext({ reducedMotion });
  return context.newPage();
}

/** Lets the page render `count` frames. */
function frames(page: Page, count: number): Promise<void> {
  return page.evaluate(async (total) => {
    for (let index = 0; index < total; index += 1) {
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    }
  }, count);
}

/**
 * Layout passes (`LayoutCount` of the DevTools Protocol) added over ten frames once `start` has run for three frames.
 * One session stays open for the whole measure: the counter restarts with each new session.
 */
async function layoutsWhile(page: Page, start: () => Promise<void>): Promise<number> {
  const session = await page.context().newCDPSession(page);
  const read = async (): Promise<number> => {
    const { metrics } = await session.send('Performance.getMetrics');
    return metrics.find((metric) => metric.name === 'LayoutCount')?.value ?? 0;
  };
  try {
    await session.send('Performance.enable');
    await start();
    await frames(page, 3);
    const before = await read();
    await frames(page, 10);
    return (await read()) - before;
  } finally {
    await session.detach();
  }
}

/** Wraps `document.startViewTransition` before the page runs, so the test can wait for a transition's `ready`. */
async function recordTransitions(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const started: ViewTransition[] = [];
    Object.assign(window, { labTransitions: started });
    const original = document.startViewTransition.bind(document);
    document.startViewTransition = (...args: Parameters<Document['startViewTransition']>) => {
      const transition = original(...args);
      started.push(transition);
      return transition;
    };
  });
}

/** Waits until the last transition the page started is ready, then returns the pseudo-elements that animate. */
async function pseudoElementsOfLastTransition(page: Page): Promise<string[]> {
  await page.evaluate(async () => {
    const started = (window as unknown as { labTransitions: ViewTransition[] }).labTransitions;
    await started.at(-1)?.ready;
  });
  const all = await documentAnimations(page);
  return [...new Set(all.flatMap((animation) => (animation.pseudoElement ? [animation.pseudoElement] : [])))].sort();
}

test('Section 11: animating width adds layouts while animating transform adds none', async ({ browser }) => {
  const page = await motionPage(browser, 'no-preference');
  await openMotion(page);

  const moveLayouts = await layoutsWhile(page, () => page.getByRole('button', { name: 'Animate transform' }).click());
  expect(await animationsOf(page.getByTestId('move-bar'))).toHaveLength(1);
  const widthLayouts = await layoutsWhile(page, () => page.getByRole('button', { name: 'Animate width' }).click());
  expect(await animationsOf(page.getByTestId('width-bar'))).toHaveLength(1);

  expect(moveLayouts).toBe(0);
  expect(widthLayouts).toBeGreaterThan(0);
  await page.context().close();
});

test('Section 11: with reduced motion the guarded keyframe animation does not run', async ({ browser }) => {
  const calm = await motionPage(browser, 'no-preference');
  await openMotion(calm);
  expect((await animationsOf(calm.getByTestId('pulse'))).map(({ kind, playState }) => `${kind} ${playState}`)).toEqual([
    'css-animation running',
  ]);
  await calm.context().close();

  const reduced = await motionPage(browser, 'reduce');
  await openMotion(reduced);
  expect(await animationsOf(reduced.getByTestId('pulse'))).toEqual([]);
  await reduced.context().close();
});

test('Section 11: with reduced motion a leaving element is removed without an animation', async ({ browser }) => {
  const calm = await motionPage(browser, 'no-preference');
  await openMotion(calm);
  await calm.getByRole('button', { name: 'Remove note' }).click();
  // The leave class animates, so the element stays until the animation ends.
  await expect.poll(async () => (await animationsOf(calm.getByTestId('note'))).map(({ playState }) => playState)).toEqual(['running']);
  await finishAll(calm);
  await expect(calm.getByTestId('note')).toHaveCount(0);
  await calm.context().close();

  const reduced = await motionPage(browser, 'reduce');
  await openMotion(reduced);
  await reduced.getByRole('button', { name: 'Remove note' }).click();
  // The reduced rule is animation: none, so nothing ends the removal later: it happens by itself.
  await expect(reduced.getByTestId('note')).toHaveCount(0);
  await reduced.context().close();
});

test('Section 11: with reduced motion a leave callback completes at once', async ({ browser }) => {
  const calm = await motionPage(browser, 'no-preference');
  await openMotion(calm);
  await calm.getByRole('button', { name: 'Remove card' }).click();
  await expect.poll(async () => (await animationsOf(calm.getByTestId('card'))).map(({ kind }) => kind)).toEqual(['script']);
  await finishAll(calm);
  await expect(calm.getByTestId('card')).toHaveCount(0);
  await calm.context().close();

  const reduced = await motionPage(browser, 'reduce');
  await openMotion(reduced);
  await reduced.getByRole('button', { name: 'Remove card' }).click();
  // The callback saw the query and called animationComplete without starting an animation.
  await expect(reduced.getByTestId('card')).toHaveCount(0);
  await reduced.context().close();
});

test('Section 11: with reduced motion a navigation runs no view-transition animation', async ({ browser }) => {
  const page = await motionPage(browser, 'reduce');
  await recordTransitions(page);
  await openMotion(page);
  await expect(page.getByTestId('last-transition')).toHaveText('/ to /m35/motion, skipped: false');

  // Guard on (the default): the global rule sets animation: none on the pseudo-elements.
  await page.getByRole('link', { name: 'Next step' }).click();
  await expect(page.getByTestId('step')).toHaveText('Step 1');
  expect(await pseudoElementsOfLastTransition(page)).toEqual([]);
  await finishAll(page);

  // Guard off: the router has no reduced-motion logic of its own, so the same navigation animates.
  await page.getByRole('checkbox', { name: 'Guard view transitions' }).uncheck();
  await page.getByRole('link', { name: 'Next step' }).click();
  await expect(page.getByTestId('step')).toHaveText('Step 2');
  expect(await pseudoElementsOfLastTransition(page)).toContain('::view-transition-old(root)');
  await finishAll(page);
  await page.context().close();
});
