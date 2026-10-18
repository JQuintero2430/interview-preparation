import { expect, type Page, test } from '@playwright/test';
import { animationsOf, classesOf, finishAll, MOTION_ORIGIN, recordEvents, seek } from '../support/motion.js';

const TRANSITION_EVENTS = ['transitionrun', 'transitionstart', 'transitionend', 'transitioncancel'] as const;

async function openTransitions(page: Page): Promise<void> {
  await page.goto(`${MOTION_ORIGIN}/m35/transitions`);
  await expect(page.getByRole('heading', { level: 1, name: 'Section 2: CSS transitions' })).toBeVisible();
}

/** Resolves once the first `transitionrun` fires and pauses every animation in that handler, inside the delay phase. */
function pauseOnFirstRun(page: Page, selector: string): Promise<void> {
  return page.evaluate(
    (scope) =>
      new Promise<void>((resolve) => {
        document.querySelector(scope)?.addEventListener(
          'transitionrun',
          () => {
            document.getAnimations().forEach((animation) => animation.pause());
            resolve();
          },
          { once: true },
        );
      }),
    selector,
  );
}

test('Section 2: a class change starts a CSSTransition for each listed property', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await openTransitions(page);

  await page.getByRole('button', { name: 'Toggle class' }).click();
  const box = page.getByTestId('listed-box');
  // The class also changes background-color, but it is not in transition-property: it changes at once.
  await expect.poll(async () => (await animationsOf(box)).map(({ property }) => property).sort()).toEqual(['opacity', 'transform']);
  const transitions = await animationsOf(box);
  expect(transitions.map(({ kind }) => kind)).toEqual(['css-transition', 'css-transition']);
  expect(transitions.map(({ delay }) => delay)).toEqual([400, 400]);
  expect(await box.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe('rgb(254, 202, 202)');

  await finishAll(page);
  await context.close();
});

test('Section 2: transitionrun fires before transitionstart, and transitionend comes last', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await openTransitions(page);
  await expect(page.getByTestId('listed-box')).toBeVisible();
  const read = await recordEvents(page, '[data-testid="listed-box"]', TRANSITION_EVENTS);
  const paused = pauseOnFirstRun(page, '[data-testid="listed-box"]');

  await page.getByRole('button', { name: 'Toggle class' }).click();
  await paused;
  // Inside the delay: both transitions have run, none has started.
  expect((await read()).map(({ type }) => type)).toEqual(['transitionrun', 'transitionrun']);

  // Seek to the end of the delay (400 ms): the start events fire.
  await seek(page, 400);
  await expect.poll(async () => (await read()).map(({ type }) => type)).toEqual(['transitionrun', 'transitionrun', 'transitionstart', 'transitionstart']);

  // Seek to the end of the transition (400 ms delay + 600 ms): the end events fire.
  await seek(page, 1000);
  await expect.poll(async () => (await read()).length).toBe(6);
  const events = await read();
  expect(events.map(({ type }) => type)).toEqual([
    'transitionrun',
    'transitionrun',
    'transitionstart',
    'transitionstart',
    'transitionend',
    'transitionend',
  ]);
  expect(events.map(({ name }) => name)).toEqual(['opacity', 'transform', 'opacity', 'transform', 'opacity', 'transform']);

  await context.close();
});

test('Section 2: removing the class mid-flight cancels the transitions and starts reverse ones', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await openTransitions(page);
  const box = page.getByTestId('listed-box');
  await expect(box).toBeVisible();
  const read = await recordEvents(page, '[data-testid="listed-box"]', TRANSITION_EVENTS);
  const paused = pauseOnFirstRun(page, '[data-testid="listed-box"]');

  await page.getByRole('button', { name: 'Toggle class' }).click();
  await paused;
  // 700 ms is 300 ms into the 600 ms transition (after the 400 ms delay): halfway in time, not at either end value.
  await seek(page, 700);
  await expect.poll(async () => (await read()).length).toBe(4);
  const midway = Number(await box.evaluate((element) => getComputedStyle(element).opacity));
  expect(midway).toBeGreaterThan(0.4);
  expect(midway).toBeLessThan(1);

  await page.getByRole('button', { name: 'Toggle class' }).click();
  await expect.poll(async () => (await read()).length).toBe(8);
  // The running transitions are cancelled and new ones run back to the old values.
  expect((await read()).map(({ type }) => type)).toEqual([
    'transitionrun',
    'transitionrun',
    'transitionstart',
    'transitionstart',
    'transitioncancel',
    'transitioncancel',
    'transitionrun',
    'transitionrun',
  ]);
  const timings = await box.evaluate((element) =>
    element.getAnimations().map((animation) => ({ duration: Number(animation.effect?.getTiming().duration), delay: Number(animation.effect?.getTiming().delay) })),
  );
  expect(timings).toHaveLength(2);
  // Reversing shortening: the reverse runs for less than the 600 ms the rule declares, because it starts partway.
  for (const { duration, delay } of timings) {
    expect(duration).toBeGreaterThan(0);
    expect(duration).toBeLessThan(600);
    expect(delay).toBe(400);
  }

  await finishAll(page);
  await context.close();
});

test('Section 2: an inserted element transitions only with @starting-style', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await openTransitions(page);

  await page.getByRole('button', { name: 'Toggle inserted boxes' }).click();
  const withStart = page.getByTestId('with-start-box');
  const withoutStart = page.getByTestId('without-start-box');
  await expect(withoutStart).toBeVisible();
  await expect.poll(async () => (await animationsOf(withStart)).map(({ kind, property }) => ({ kind, property }))).toEqual([{ kind: 'css-transition', property: 'opacity' }]);
  // Both boxes declare the same transition; only the first has a "before" value to start from.
  expect(await animationsOf(withoutStart)).toEqual([]);

  await finishAll(page);
  await context.close();
});

test('Section 2: display none animates out only with transition-behavior allow-discrete', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await openTransitions(page);
  const discrete = page.getByTestId('discrete-box');
  const plain = page.getByTestId('plain-box');
  const displayOf = (locator: typeof discrete): Promise<string> => locator.evaluate((element) => getComputedStyle(element).display);

  await page.getByRole('button', { name: 'Toggle display none' }).click();
  await expect.poll(() => classesOf(plain)).toContain('m35-gone');
  await expect.poll(async () => (await animationsOf(discrete)).map(({ property }) => property).sort()).toEqual(['display', 'opacity']);
  // The element is still displayed while its display transition runs; the box without allow-discrete is gone at once.
  expect(await displayOf(discrete)).toBe('block');
  expect(await displayOf(plain)).toBe('none');
  expect(await animationsOf(plain)).toEqual([]);

  await finishAll(page);
  await expect.poll(() => displayOf(discrete)).toBe('none');
  await context.close();
});
