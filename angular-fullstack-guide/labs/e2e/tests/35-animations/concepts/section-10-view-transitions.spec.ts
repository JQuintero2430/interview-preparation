import { expect, type Page, test } from '@playwright/test';
import { documentAnimations, finishAll, MOTION_ORIGIN } from '../support/motion.js';

/** Settles every `ViewTransition` the page started and reports how each one ended. */
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

/** How the last transition ended: `resolved` or the name of the rejection. */
function lastOutcome(page: Page): Promise<TransitionOutcome | null> {
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

/** The pseudo-element selectors of the document's running animations, without duplicates, sorted. */
async function pseudoElements(page: Page): Promise<string[]> {
  const all = await documentAnimations(page);
  return [...new Set(all.flatMap((animation) => (animation.pseudoElement ? [animation.pseudoElement] : [])))].sort();
}

async function openList(page: Page, path = '/m35/vt/list'): Promise<void> {
  await page.goto(`${MOTION_ORIGIN}${path}`);
  await expect(page.getByRole('heading', { level: 1, name: 'Section 10: view transitions' })).toBeVisible();
}

test('Section 10: a navigation runs the root group\'s old and new animations', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await recordTransitions(page);
  await openList(page);

  await page.getByRole('link', { name: 'Bellows' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Bellows' })).toBeVisible();
  await expect.poll(() => pseudoElements(page)).toContain('::view-transition-old(root)');
  const running = await pseudoElements(page);
  expect(running).toContain('::view-transition-new(root)');
  expect(running).toContain('::view-transition-group(root)');
  await finishAll(page);
  expect(await lastOutcome(page)).toEqual({ ready: 'resolved', finished: 'resolved' });
  await context.close();
});

test('Section 10: an element with a view-transition-name gets its own group', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await openList(page);

  await page.getByRole('link', { name: 'Bellows' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Bellows' })).toBeVisible();
  await expect.poll(() => pseudoElements(page)).toContain('::view-transition-group(card-2)');
  const running = await pseudoElements(page);
  // card-2 exists on both pages: old and new snapshots plus a group that moves between the two boxes.
  expect(running).toContain('::view-transition-old(card-2)');
  expect(running).toContain('::view-transition-new(card-2)');
  // card-1 and card-3 exist only on the old page: an old snapshot, nothing to morph into.
  expect(running).toContain('::view-transition-old(card-1)');
  expect(running).not.toContain('::view-transition-new(card-1)');
  expect(running).not.toContain('::view-transition-group(card-1)');
  await finishAll(page);
  await context.close();
});

test('Section 10: onViewTransitionCreated receives the from and to routes', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await openList(page);
  // The first navigation of the page is a transition too: the router records it from the root.
  await expect(page.getByTestId('last-transition')).toHaveText('/ to /m35/vt/list, skipped: false');

  await page.getByRole('link', { name: 'Chisel' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Chisel' })).toBeVisible();
  await expect(page.getByTestId('last-transition')).toHaveText('/m35/vt/list to /m35/vt/item/3, skipped: false');
  await finishAll(page);

  await page.getByRole('link', { name: 'Back to the list' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'Section 10: view transitions' })).toBeVisible();
  await expect(page.getByTestId('last-transition')).toHaveText('/m35/vt/item/3 to /m35/vt/list, skipped: false');
  await finishAll(page);
  await context.close();
});

test('Section 10: skipTransition on a query-only navigation runs no view-transition animation', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await recordTransitions(page);
  await openList(page, '/m35/vt/filtered?tag=tools');
  await expect(page.getByText('Current filter: tools')).toBeVisible();

  await page.getByRole('link', { name: 'Filter: metal' }).click();
  await expect(page.getByText('Current filter: metal')).toBeVisible();
  await expect(page.getByTestId('last-transition')).toHaveText('/m35/vt/filtered to /m35/vt/filtered, skipped: true');
  // The transition was created, then skipped: its ready promise rejects with an AbortError and the page was updated.
  expect(await lastOutcome(page)).toEqual({ ready: 'AbortError', finished: 'resolved' });
  expect(await pseudoElements(page)).toEqual([]);
  await context.close();
});

test('Section 10: two elements with the same view-transition-name make the transition skip', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await recordTransitions(page);
  await openList(page);

  await page.getByRole('link', { name: 'Open item 1 with a twin' }).click();
  await expect(page.getByText('A second element with the same name.')).toBeVisible();
  // The navigation completed, the transition did not run: ready rejects, the update still finished.
  expect(await lastOutcome(page)).toEqual({ ready: 'InvalidStateError', finished: 'resolved' });
  expect(await pseudoElements(page)).toEqual([]);
  await context.close();
});
