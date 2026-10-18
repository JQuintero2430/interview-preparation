import { expect, test, type Page } from '@playwright/test';
import { cdp, countInstances, forceGc, windowListenerCount } from '../support/perf.js';

const PAGE_URL = 'http://localhost:4300/m31/leak-hunt';
const CYCLES = 10;
const HOOK = '__m31LeakHunt';
const FIXES: readonly string[] = ['destroyref', 'signals'];
/** The panel's own counter has passed at least two intervals since it opened. */
const AT_LEAST_THREE_TICKS = /Ticks: (?:[3-9]|[1-9]\d+)/;
const AT_LEAST_ONE_RESIZE = /Resizes: [1-9]\d*/;

/** The page's timer counters (lab instrumentation on `window`). */
interface TimerStats {
  live: number;
  ticks: number;
  orphanTicks: number;
}

/** Opens the leak hunt page of the production build with one panel variant. */
async function openPage(page: Page, variant: string): Promise<void> {
  await page.goto(`${PAGE_URL}?variant=${variant}`);
  await expect(page.getByRole('heading', { name: 'Leak hunt lab', level: 1 })).toBeVisible();
  await expect(page.getByText(`Variant: ${variant}`)).toBeVisible();
}

/** Opens the panel and waits until it is rendered. */
async function openPanel(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Open panel' }).click();
  await expect(page.getByRole('region', { name: 'Chart panel' })).toBeVisible();
}

/** Closes the panel and waits until it is gone. */
async function closePanel(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Close panel' }).click();
  await expect(page.getByRole('region', { name: 'Chart panel' })).toHaveCount(0);
}

/** Opens and closes the panel `cycles` times. */
async function cyclePanel(page: Page, cycles: number): Promise<void> {
  for (let cycle = 0; cycle < cycles; cycle++) {
    await openPanel(page);
    await closePanel(page);
  }
}

/** Reads the timer counters the page exposes. */
function timerStats(page: Page): Promise<TimerStats> {
  return page.evaluate((hookName) => {
    const hook: unknown = Reflect.get(window, hookName);
    if (typeof hook !== 'object' || hook === null) throw new Error(`${hookName} is missing`);
    const timers: unknown = Reflect.get(hook, 'timers');
    if (typeof timers !== 'object' || timers === null) throw new Error(`${hookName}.timers is missing`);
    return {
      live: Number(Reflect.get(timers, 'live')),
      ticks: Number(Reflect.get(timers, 'ticks')),
      orphanTicks: Number(Reflect.get(timers, 'orphanTicks')),
    };
  }, HOOK);
}

/** Expression for the exposed prototype of one variant's panel class. */
function prototypeOf(variant: string): string {
  return `window.${HOOK}.${variant}`;
}

test('Before the fix: ten cycles of the leaky panel leave 10 instances, 10 window listeners and 10 live timers', async ({ page }) => {
  await openPage(page, 'leaky');
  const session = await cdp(page);
  const listenersBefore = await windowListenerCount(session);

  await cyclePanel(page, CYCLES);
  await expect.poll(async () => (await timerStats(page)).orphanTicks).toBeGreaterThan(0);
  expect((await timerStats(page)).live).toBe(CYCLES);
  expect((await windowListenerCount(session)) - listenersBefore).toBe(CYCLES);

  // Counted last and once: the array `Runtime.queryObjects` returns retains what it lists.
  await forceGc(session);
  expect(await countInstances(session, prototypeOf('leaky'))).toBe(CYCLES);
});

for (const variant of FIXES) {
  test.describe(`variant ${variant}`, () => {
    test('leaves no panel instance after ten open-close cycles', async ({ page }) => {
      await openPage(page, variant);
      await cyclePanel(page, CYCLES);
      const session = await cdp(page);
      await forceGc(session);

      expect(await countInstances(session, prototypeOf(variant))).toBe(0);
    });

    test('removes its window listener when closed', async ({ page }) => {
      await openPage(page, variant);
      const session = await cdp(page);
      const listenersBefore = await windowListenerCount(session);

      await openPanel(page);
      expect(await windowListenerCount(session)).toBe(listenersBefore + 1);
      await closePanel(page);
      await cyclePanel(page, CYCLES);

      expect(await windowListenerCount(session)).toBe(listenersBefore);
    });

    test('stops its timer when closed', async ({ page }) => {
      await openPage(page, variant);
      await cyclePanel(page, CYCLES);
      await expect.poll(async () => (await timerStats(page)).live).toBe(0);

      // A fresh panel ticking three times proves time has passed for any closed panel's timer too.
      await openPanel(page);
      await expect(page.getByRole('region', { name: 'Chart panel' })).toContainText(AT_LEAST_THREE_TICKS);
      const stats = await timerStats(page);
      expect(stats.orphanTicks).toBe(0);
      expect(stats.live).toBe(1);
    });

    test('keeps updating while open', async ({ page }) => {
      await openPage(page, variant);
      await openPanel(page);
      const panel = page.getByRole('region', { name: 'Chart panel' });

      await expect(panel).toContainText(AT_LEAST_THREE_TICKS);
      await expect.poll(async () => (await timerStats(page)).ticks).toBeGreaterThanOrEqual(3);
      await page.setViewportSize({ width: 1000, height: 700 });
      await expect(panel).toContainText(AT_LEAST_ONE_RESIZE);
    });
  });
}
