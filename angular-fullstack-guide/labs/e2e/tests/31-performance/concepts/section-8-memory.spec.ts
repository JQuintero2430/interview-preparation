import { expect, test, type Page } from '@playwright/test';
import { cdp, countInstances, forceGc, windowListenerCount } from '../support/perf.js';

const PAGE_URL = 'http://localhost:4300/m31/leaks';
const CYCLES = 5;
const CANVAS_PROTOTYPE = 'HTMLCanvasElement.prototype';

/** One panel of the leaks page: its toggle button, its region and the exposed prototype (lab instrumentation). */
interface PanelVariant {
  button: string;
  region: string;
  prototype: string;
}

const LEAKY: PanelVariant = { button: 'Toggle leaky panel', region: 'Leaky panel', prototype: 'window.__m31Leaks.leakyPanel' };
const FIXED: PanelVariant = { button: 'Toggle fixed panel', region: 'Fixed panel', prototype: 'window.__m31Leaks.fixedPanel' };

/** Opens the leaks page of the production build and waits for its heading. */
async function openLeaksPage(page: Page): Promise<void> {
  await page.goto(PAGE_URL);
  await expect(page.getByRole('heading', { name: 'Memory leaks lab', level: 1 })).toBeVisible();
}

/** Opens and closes a panel `cycles` times, waiting each time until it is rendered and then gone. */
async function togglePanel(page: Page, variant: PanelVariant, cycles: number): Promise<void> {
  const button = page.getByRole('button', { name: variant.button });
  const panel = page.getByRole('region', { name: variant.region });
  for (let cycle = 0; cycle < cycles; cycle++) {
    await button.click();
    await expect(panel).toBeVisible();
    await button.click();
    await expect(panel).toHaveCount(0);
  }
}

test("Section 8: a leaky panel's instances survive garbage collection", async ({ page }) => {
  await openLeaksPage(page);
  const session = await cdp(page);
  const listenersBefore = await windowListenerCount(session);

  await togglePanel(page, LEAKY, CYCLES);
  await forceGc(session);

  expect(await countInstances(session, LEAKY.prototype)).toBe(CYCLES);
  expect((await windowListenerCount(session)) - listenersBefore).toBe(CYCLES);
});

test('Section 8: the fixed panel leaves no instance after garbage collection', async ({ page }) => {
  await openLeaksPage(page);
  const session = await cdp(page);
  const listenersBefore = await windowListenerCount(session);

  await togglePanel(page, FIXED, CYCLES);
  await forceGc(session);

  expect(await countInstances(session, FIXED.prototype)).toBe(0);
  expect(await windowListenerCount(session)).toBe(listenersBefore);
});

test('Section 8: a removed element held by a service is still counted as a node', async ({ page }) => {
  await openLeaksPage(page);
  await expect(page.getByRole('img', { name: 'Sales chart' })).toBeVisible();
  const session = await cdp(page);

  await page.getByRole('button', { name: 'Remove chart' }).click();
  await expect(page.getByRole('img', { name: 'Sales chart' })).toHaveCount(0);
  await forceGc(session);
  expect(await countInstances(session, CANVAS_PROTOTYPE)).toBe(1);

  // The array `Runtime.queryObjects` returned is itself a retainer while the session
  // lives; detaching releases it, so the next count sees only the page's own references.
  await session.detach();
  await page.getByRole('button', { name: 'Release chart' }).click();
  const fresh = await cdp(page);
  await forceGc(fresh);
  expect(await countInstances(fresh, CANVAS_PROTOTYPE)).toBe(0);
});
