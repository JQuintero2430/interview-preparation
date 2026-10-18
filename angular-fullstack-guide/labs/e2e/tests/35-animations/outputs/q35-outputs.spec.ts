import { expect, type Page, test } from '@playwright/test';
import { animationsOf, classesOf, documentAnimations, finishAll, MOTION_ORIGIN, pauseAll, recordEvents, seek } from '../support/motion.js';

const TRANSITION_EVENTS = ['transitionrun', 'transitionstart', 'transitionend', 'transitioncancel'] as const;

test('Q35.02 removing the class halfway cancels both transitions, starts two shorter reverse ones and ends at opacity 1', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await page.goto(`${MOTION_ORIGIN}/m35/outputs/q35-02`);
  await expect(page.getByRole('heading', { level: 1, name: 'Q35.02: a class removed halfway' })).toBeVisible();
  const box = page.getByTestId('q02-box');
  const read = await recordEvents(page, '[data-testid="q02-box"]', TRANSITION_EVENTS);
  const types = async (): Promise<string[]> => (await read()).map(({ type }) => type);

  await page.getByRole('button', { name: 'Toggle class' }).click();
  await expect.poll(types).toHaveLength(4);
  await pauseAll(page);
  await seek(page, 200);
  // While running: one CSSTransition per listed property, 400 ms each, and an opacity between the two ends.
  expect((await animationsOf(box)).map(({ kind, property }) => ({ kind, property })).sort((a, b) => a.property.localeCompare(b.property))).toEqual([
    { kind: 'css-transition', property: 'opacity' },
    { kind: 'css-transition', property: 'transform' },
  ]);
  const midway = Number(await box.evaluate((element) => getComputedStyle(element).opacity));
  expect(midway).toBeGreaterThan(0.2);
  expect(midway).toBeLessThan(1);

  // The reverse transitions are shorter than 400 ms: hold them in the handler of their first start, so none ends early.
  await page.evaluate(() =>
    document.querySelector('[data-testid="q02-box"]')?.addEventListener('transitionstart', () => document.getAnimations().forEach((animation) => animation.pause()), { once: true }),
  );
  await page.getByRole('button', { name: 'Toggle class' }).click();
  await expect.poll(types).toHaveLength(10);
  const timings = await box.evaluate((element) =>
    element.getAnimations().map((animation) => Number(animation.effect?.getTiming().duration)),
  );
  expect(timings).toHaveLength(2);
  for (const duration of timings) {
    expect(duration).toBeGreaterThan(0);
    expect(duration).toBeLessThan(400);
  }

  // The reverse transitions are paused: finish them directly (finishAll skips paused ones).
  await page.evaluate(() => document.getAnimations().forEach((animation) => animation.finish()));
  await expect.poll(types).toHaveLength(12);
  expect(await types()).toEqual([
    'transitionrun',
    'transitionstart',
    'transitionrun',
    'transitionstart',
    'transitioncancel',
    'transitioncancel',
    'transitionrun',
    'transitionstart',
    'transitionrun',
    'transitionstart',
    'transitionend',
    'transitionend',
  ]);
  expect(await animationsOf(box)).toEqual([]);
  expect(await box.evaluate((element) => getComputedStyle(element).opacity)).toBe('1');
  await context.close();
});

/** Lets the page render two frames, so a removal or a listener that was going to happen has happened. */
async function twoFrames(page: Page): Promise<void> {
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
}

test('Q35.06 the enter class stays on the element until the longer of its two animations ends', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await page.goto(`${MOTION_ORIGIN}/m35/outputs/q35-06`);
  await expect(page.getByRole('heading', { level: 1, name: 'Q35.06: two animations in one enter class' })).toBeVisible();
  const box = page.getByTestId('q06-box');

  await page.getByRole('button', { name: 'Toggle box' }).click();
  await expect(box).toHaveClass(/m35-pop/);
  // While both run: one class and two CSSAnimations, the fade and the slide.
  expect(await classesOf(box)).toContain('m35-pop');
  const names = async (): Promise<string[]> => (await animationsOf(box)).map(({ kind, name }) => `${kind} ${name.replace(/^.*?(m35-[a-z-]+)$/, '$1')}`).sort();
  expect(await names()).toEqual(['css-animation m35-pop-fade', 'css-animation m35-pop-slide']);

  // Finish only the short one: the class stays and one animation is left.
  await page.evaluate(() =>
    document.querySelector('[data-testid="q06-box"]')?.getAnimations().forEach((animation) => {
      if (animation instanceof CSSAnimation && animation.animationName.endsWith('m35-pop-fade')) animation.finish();
    }),
  );
  await twoFrames(page);
  await expect(box).toHaveClass(/m35-pop/);
  expect(await names()).toEqual(['css-animation m35-pop-slide']);

  // Finish the long one: the class goes, the element stays.
  await finishAll(page);
  await expect(box).not.toHaveClass(/m35-pop/);
  expect(await animationsOf(box)).toEqual([]);
  await expect(box).toBeVisible();
  await context.close();
});

test('Q35.08 a leave class that animates nothing or only loops removes the element at once, a transition waits', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await page.goto(`${MOTION_ORIGIN}/m35/outputs/q35-08`);
  await expect(page.getByRole('heading', { level: 1, name: 'Q35.08: three kinds of leave class' })).toBeVisible();
  const plain = page.getByTestId('q08-plain');
  const fade = page.getByTestId('q08-fade');
  const spin = page.getByTestId('q08-spin');

  // The infinite class really declares an infinite animation (read from the computed style, not from an event).
  expect(
    await spin.evaluate((element) => {
      element.classList.add('m35-q08-spin');
      const count = getComputedStyle(element).animationIterationCount;
      element.classList.remove('m35-q08-spin');
      return count;
    }),
  ).toBe('infinite');

  await page.getByRole('button', { name: 'Toggle transition box' }).click();
  // The transition: still attached, with its leave class and one running CSSTransition on opacity.
  await expect(fade).toHaveClass(/m35-q08-fade/);
  expect((await animationsOf(fade)).map(({ kind, property, playState }) => `${kind} ${property} ${playState}`)).toEqual(['css-transition opacity running']);
  await twoFrames(page);
  await expect(fade).toHaveCount(1);

  // Nothing animates, and an infinite animation does not count: both leave without a finish.
  await page.getByRole('button', { name: 'Toggle plain box' }).click();
  await page.getByRole('button', { name: 'Toggle infinite box' }).click();
  await expect(plain).toHaveCount(0);
  await expect(spin).toHaveCount(0);
  await expect(fade).toHaveCount(1);

  await finishAll(page);
  await expect(fade).toHaveCount(0);
  await context.close();
});

test("Q35.10 a leave in the removed block's own template runs before removal and a child component's own leave does not", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await page.goto(`${MOTION_ORIGIN}/m35/outputs/q35-10`);
  await expect(page.getByRole('heading', { level: 1, name: 'Q35.10: a block with two leaves' })).toBeVisible();
  const block = page.getByTestId('q10-block');
  const line = page.getByTestId('q10-line');
  const inner = page.getByTestId('q10-child-inner');

  await page.getByRole('button', { name: 'Remove block' }).click();
  await expect(line).toHaveClass(/m35-q10-line-out/);
  expect((await animationsOf(line)).map(({ kind, playState }) => `${kind} ${playState}`)).toEqual(['css-animation running']);
  // The child's own leave: no class and no animation, although the block is still attached.
  await twoFrames(page);
  await expect(block).toHaveCount(1);
  await expect(inner).not.toHaveClass(/m35-q10-out/);
  expect(await animationsOf(inner)).toEqual([]);

  await finishAll(page);
  await expect(block).toHaveCount(0);
  await context.close();
});

test('Q35.13 a moved row runs neither animation, a removed row leaves, and a row restored in place mid-leave leaves one element', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await page.goto(`${MOTION_ORIGIN}/m35/outputs/q35-13`);
  await expect(page.getByRole('heading', { level: 1, name: 'Q35.13: move, remove and re-add in a keyed list' })).toBeVisible();
  const list = page.getByTestId('q13-list');
  const texts = async (): Promise<string[]> => (await list.getByRole('listitem').allTextContents()).map((text) => text.trim());
  const states = async (): Promise<string[]> =>
    Promise.all(
      [1, 2, 3].map(async (id) => {
        const row = page.getByTestId(`q13-row-${id}`);
        const kinds = (await animationsOf(row)).map(({ kind }) => kind);
        return `${id}:${(await classesOf(row)).filter((name) => name !== 'm35-q13-row').join('+') || '-'}:${kinds.length}`;
      }),
    );

  // The first render enters all three rows: end that, then tag the elements.
  await expect.poll(async () => (await documentAnimationsCount(page))).toBe(3);
  await finishAll(page);
  await expect(page.locator('.m35-q13-in')).toHaveCount(0);
  await list.getByRole('listitem').evaluateAll((items) => items.forEach((item) => item.setAttribute('data-kept', 'yes')));

  // Move: the same three elements, a new order, no leave class anywhere.
  await page.getByRole('button', { name: 'Move first to end' }).click();
  await expect.poll(texts).toEqual(['Item 2', 'Item 3', 'Item 1']);
  await twoFrames(page);
  await expect(list.locator('[data-kept="yes"]')).toHaveCount(3);
  await expect(list.locator('.m35-q13-out')).toHaveCount(0);
  const afterMove = await states();
  await finishAll(page);
  await expect(page.locator('.m35-q13-in')).toHaveCount(0);

  // Remove: the row stays attached with its leave class and a running animation.
  await page.getByRole('button', { name: 'Remove item 2' }).click();
  const leaving = page.getByTestId('q13-row-2');
  await expect(leaving).toHaveClass(/m35-q13-out/);
  const leavingHandle = await leaving.elementHandle();
  expect((await animationsOf(leaving)).map(({ playState }) => playState)).toEqual(['running']);

  // Restore before the leave ends: one element carries the item, with the enter class; the leaving copy is gone.
  await page.getByRole('button', { name: 'Restore item 2', exact: true }).click();
  await expect(page.getByTestId('q13-row-2')).toHaveCount(1);
  await expect(page.getByTestId('q13-row-2')).toHaveClass(/m35-q13-in/);
  expect(await leavingHandle?.evaluate((element) => element.isConnected)).toBe(false);
  await finishAll(page);
  await expect(page.getByTestId('q13-row-2')).toHaveCount(1);
  expect(await texts()).toEqual(['Item 2', 'Item 3', 'Item 1']);

  // After the rotation no row had a class or an animation: the move ran neither enter nor leave.
  expect(afterMove).toEqual(['1:-:0', '2:-:0', '3:-:0']);
  await context.close();
});

test('Q35.13 a row restored away from its leaving copy shows two elements until the leave ends', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await page.goto(`${MOTION_ORIGIN}/m35/outputs/q35-13`);
  await expect(page.getByRole('heading', { level: 1, name: 'Q35.13: move, remove and re-add in a keyed list' })).toBeVisible();
  const rows = page.getByTestId('q13-row-2');
  await expect.poll(async () => documentAnimationsCount(page)).toBe(3);
  await finishAll(page);
  await expect(page.locator('.m35-q13-in')).toHaveCount(0);

  await page.getByRole('button', { name: 'Remove item 2' }).click();
  await expect(rows).toHaveClass(/m35-q13-out/);
  await page.getByRole('button', { name: 'Restore item 2 at the end' }).click();
  // The leaving copy (leave class) and the new element (enter class) are attached together.
  await expect(rows).toHaveCount(2);
  expect(await rows.evaluateAll((elements) => elements.map((element) => element.classList.contains('m35-q13-out') ? 'leaving' : 'new'))).toEqual(['leaving', 'new']);

  await finishAll(page);
  await expect(rows).toHaveCount(1);
  await expect(rows).not.toHaveClass(/m35-q13-out/);
  await context.close();
});

/** The number of animations in the whole document. */
function documentAnimationsCount(page: Page): Promise<number> {
  return page.evaluate(() => document.getAnimations().length);
}

/** The pseudo-element selectors of the document's running animations, without duplicates, sorted. */
async function runningPseudoElements(page: Page): Promise<string[]> {
  const all = await documentAnimations(page);
  return [...new Set(all.flatMap((animation) => (animation.pseudoElement ? [animation.pseudoElement] : [])))].sort();
}

/** How the last view transition the page started ended: `resolved` or the name of the rejection. */
function lastTransitionOutcome(page: Page): Promise<{ ready: string; finished: string } | null> {
  return page.evaluate(async () => {
    const started = (window as unknown as { labTransitions: ViewTransition[] }).labTransitions;
    const last = started.at(-1);
    if (!last) return null;
    const settle = (promise: Promise<unknown>): Promise<string> =>
      promise.then(
        () => 'resolved',
        (error: unknown) => (error instanceof DOMException ? error.name : 'rejected'),
      );
    return { ready: await settle(last.ready), finished: await settle(last.finished) };
  });
}

test('Q35.20 a shared name adds one group with both snapshots to the root group, and skipTransition runs none', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
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
  await page.goto(`${MOTION_ORIGIN}/m35/outputs/q35-20`);
  await expect(page.getByRole('heading', { level: 1, name: 'Q35.20: a shared element' })).toBeVisible();
  // The first load is a view transition too: let it end before the navigation under test.
  await expect.poll(async () => (await documentAnimations(page)).length).toBeGreaterThan(0);
  await finishAll(page);
  await expect.poll(() => runningPseudoElements(page)).toEqual([]);

  await page.getByRole('link', { name: 'Card' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Q35.20: the detail page' })).toBeVisible();
  await expect.poll(() => runningPseudoElements(page)).toContain('::view-transition-group(q20-card)');
  expect(await runningPseudoElements(page)).toEqual([
    '::view-transition-group(q20-card)',
    '::view-transition-group(root)',
    '::view-transition-new(q20-card)',
    '::view-transition-new(root)',
    '::view-transition-old(q20-card)',
    '::view-transition-old(root)',
  ]);
  await finishAll(page);
  expect(await lastTransitionOutcome(page)).toEqual({ ready: 'resolved', finished: 'resolved' });

  // Skipped: the hook calls skipTransition(), the page still updates and no pseudo-element animates.
  await page.getByRole('link', { name: 'Back to the list' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Q35.20: a shared element' })).toBeVisible();
  await finishAll(page);
  await expect.poll(() => runningPseudoElements(page)).toEqual([]);
  await page.getByRole('link', { name: 'Open the detail page, skipped' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Q35.20: the detail page' })).toBeVisible();
  expect(await lastTransitionOutcome(page)).toEqual({ ready: 'AbortError', finished: 'resolved' });
  expect(await runningPseudoElements(page)).toEqual([]);
  await context.close();
});

test('Q35.24 under reduce the guarded keyframe animation does not run, the leaving element is removed at once and an unguarded view transition still animates', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
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
  await page.goto(`${MOTION_ORIGIN}/m35/motion`);
  await expect(page.getByRole('heading', { level: 1, name: 'Section 11: performance and reduced motion' })).toBeVisible();

  // The keyframe animation sits inside the no-preference query: nothing runs.
  expect(await animationsOf(page.getByTestId('pulse'))).toEqual([]);

  // The leave class has a reduced rule with animation: none: the element goes without any finishAll.
  await page.getByRole('button', { name: 'Remove note' }).click();
  await expect(page.getByTestId('note')).toHaveCount(0);

  // The router reads no reduced-motion setting: with the page's guard off, the navigation still animates.
  await expect(page.getByTestId('last-transition')).toHaveText('/ to /m35/motion, skipped: false');
  await finishAll(page);
  await page.getByRole('checkbox', { name: 'Guard view transitions' }).uncheck();
  await page.getByRole('link', { name: 'Next step' }).click();
  await expect(page.getByTestId('step')).toHaveText('Step 1');
  await page.evaluate(async () => {
    const started = (window as unknown as { labTransitions: ViewTransition[] }).labTransitions;
    await started.at(-1)?.ready;
  });
  expect(await runningPseudoElements(page)).toEqual([
    '::view-transition-group(root)',
    '::view-transition-new(root)',
    '::view-transition-old(root)',
  ]);
  await context.close();
});
