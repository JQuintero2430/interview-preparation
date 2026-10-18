import { expect, type Page, test } from '@playwright/test';
import { documentAnimations, finishAll, MOTION_ORIGIN } from '../support/motion.js';

/** How a `ViewTransition` ended: `resolved` or the name of the rejection. */
interface TransitionOutcome {
  ready: string;
  finished: string;
}

/** Wraps `document.startViewTransition` before the page runs, so the test can read each transition's outcome. */
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

/** How the last transition ended, and how many transitions the page started. */
function lastOutcome(page: Page): Promise<TransitionOutcome & { count: number }> {
  return page.evaluate(async () => {
    const started = (window as unknown as { labTransitions: ViewTransition[] }).labTransitions;
    const last = started.at(-1);
    const settle = (promise: Promise<unknown> | undefined): Promise<string> =>
      promise
        ? promise.then(
            () => 'resolved',
            (error: unknown) => (error instanceof DOMException ? error.name : 'rejected'),
          )
        : Promise.resolve('none');
    return { count: started.length, ready: await settle(last?.ready), finished: await settle(last?.finished) };
  });
}

/**
 * Ends the last transition without waiting for it: once `ready` settles its animations exist, `finishAll` ends them,
 * then `finished` settles.
 */
async function endTransition(page: Page): Promise<void> {
  await page.evaluate(() =>
    (window as unknown as { labTransitions: ViewTransition[] }).labTransitions.at(-1)?.ready.catch(() => undefined),
  );
  await finishAll(page);
  await lastOutcome(page);
}

/** The pseudo-element selectors of the document's running animations, without duplicates, sorted. */
async function pseudoElements(page: Page): Promise<string[]> {
  const all = await documentAnimations(page);
  return [...new Set(all.flatMap((animation) => (animation.pseudoElement ? [animation.pseudoElement] : [])))].sort();
}

/** The transition names the running pseudo-elements belong to, without duplicates, sorted. */
async function transitionNames(page: Page): Promise<string[]> {
  const names = (await pseudoElements(page)).map((selector) => /\((.+)\)$/.exec(selector)?.[1] ?? selector);
  return [...new Set(names)].sort();
}

/** Every pseudo-element of one shared element: the group and both snapshots. */
const morphOf = (name: string): string[] => [
  `::view-transition-group(${name})`,
  `::view-transition-new(${name})`,
  `::view-transition-old(${name})`,
];

// Exercise 35.4: the same five criteria run over variant a (click state) and variant b (the router hook's record).
for (const variant of ['a', 'b']) {
  async function openList(page: Page, path = ''): Promise<void> {
    await recordTransitions(page);
    await page.goto(`${MOTION_ORIGIN}/m35/ex4/${variant}${path}`);
    await expect(page.getByRole('heading', { level: 1, name: `Exercise 35.4${variant}: products` })).toBeVisible();
    // The first load is a view transition too: end it before the test acts.
    await endTransition(page);
  }

  async function openProduct(page: Page, name: string): Promise<void> {
    await page.getByRole('link', { name }).click();
    await expect(page.getByRole('heading', { level: 1, name })).toBeVisible();
  }

  test.describe(`variant ${variant}`, () => {
    test('morphs the clicked card into the detail header', async ({ browser }) => {
      const context = await browser.newContext({ reducedMotion: 'no-preference' });
      const page = await context.newPage();
      await openList(page);

      await openProduct(page, 'Drill');
      await expect.poll(() => pseudoElements(page)).toEqual(expect.arrayContaining(morphOf('product-2')));
      await endTransition(page);
      expect(await lastOutcome(page)).toMatchObject({ ready: 'resolved', finished: 'resolved' });

      await context.close();
    });

    test("gives no other card that card's transition name", async ({ browser }) => {
      const context = await browser.newContext({ reducedMotion: 'no-preference' });
      const page = await context.newPage();
      await openList(page);
      const cards = page.locator('[data-product]');
      const named = (): Promise<string[]> =>
        cards.evaluateAll((elements) =>
          elements.map((element) => getComputedStyle(element).viewTransitionName).filter((name) => name !== 'none'),
        );
      expect(await named()).toEqual([]);

      // Drill and back: Drill's card carries the name on the list again.
      await openProduct(page, 'Drill');
      await endTransition(page);
      await page.getByRole('link', { name: 'Back to the products' }).click();
      await expect(cards).toHaveCount(4);
      await endTransition(page);
      expect(await named()).toEqual(['product-2']);

      // Saw next: only Saw's card is captured with a name; Drill's card gave it up.
      await openProduct(page, 'Saw');
      await expect.poll(() => transitionNames(page)).toEqual(['product-3', 'root']);
      await endTransition(page);
      expect(await lastOutcome(page)).toMatchObject({ ready: 'resolved', finished: 'resolved' });

      await context.close();
    });

    test('animates the way back to the list', async ({ browser }) => {
      const context = await browser.newContext({ reducedMotion: 'no-preference' });
      const page = await context.newPage();
      await openList(page);
      await openProduct(page, 'Drill');
      await endTransition(page);

      await page.getByRole('link', { name: 'Back to the products' }).click();
      await expect(page.getByRole('heading', { level: 1, name: `Exercise 35.4${variant}: products` })).toBeVisible();
      await expect.poll(() => pseudoElements(page)).toEqual(expect.arrayContaining(morphOf('product-2')));
      await endTransition(page);
      expect(await lastOutcome(page)).toMatchObject({ ready: 'resolved', finished: 'resolved' });

      await context.close();
    });

    test('skips the transition when only the filter changes', async ({ browser }) => {
      const context = await browser.newContext({ reducedMotion: 'no-preference' });
      const page = await context.newPage();
      await openList(page, '/filtered?tag=hand');
      await expect(page.getByText('Showing: hand')).toBeVisible();
      const before = (await lastOutcome(page)).count;

      await page.getByRole('link', { name: 'Filter: power' }).click();
      await expect(page.getByText('Showing: power')).toBeVisible();
      await expect(page.locator('[data-product]')).toHaveText(['Drill', 'Sander']);
      expect(await pseudoElements(page)).toEqual([]);
      // The router started a transition and the hook skipped it: ready rejects, the update still ran.
      expect(await lastOutcome(page)).toEqual({ count: before + 1, ready: 'AbortError', finished: 'resolved' });

      await context.close();
    });

    test('navigates without view-transition animations when reduced motion is requested', async ({ browser }) => {
      const context = await browser.newContext({ reducedMotion: 'reduce' });
      const page = await context.newPage();
      await openList(page);
      const before = (await lastOutcome(page)).count;

      await openProduct(page, 'Drill');
      expect(await pseudoElements(page)).toEqual([]);
      // A transition ran all the same, with every pseudo-element's animation set to none.
      expect(await lastOutcome(page)).toEqual({ count: before + 1, ready: 'resolved', finished: 'resolved' });

      await context.close();
    });
  });
}
