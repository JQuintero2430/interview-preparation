import { expect, test, type Page } from '@playwright/test';

const VARIANTS: readonly string[] = ['long-lived', 'per-request'];

/** Lab instrumentation: the page's `requestAnimationFrame` counter, and the limit its button lists primes to. */
const FRAMES_HOOK = '__m31Frames';
const PRIME_LIMIT = 5_000_000;

/** Frames that must be drawn between the click and the result; the work runs for many more. */
const MIN_FRAMES = 5;

const PAGE_HEADING = 'Primes lab';
const START_LABEL = 'List primes';

/** Lists the primes up to `limit` with a sieve, a different algorithm from the page's trial division. */
function expectedPrimes(limit: number): number[] {
  const composite = new Uint8Array(limit + 1);
  const primes: number[] = [];
  for (let n = 2; n <= limit; n++) {
    if (composite[n] === 1) continue;
    primes.push(n);
    for (let multiple = n * n; multiple <= limit; multiple += n) composite[multiple] = 1;
  }
  return primes;
}

/** The text the page shows for a list of primes. */
function expectedSummary(primes: number[]): string {
  return `${primes.length} primes, largest ${primes[primes.length - 1]}`;
}

/** Opens the primes page of the production build with one client variant. */
async function openPage(page: Page, variant: string): Promise<void> {
  await page.goto(`/m31/primes?variant=${variant}`);
  await expect(page.getByRole('heading', { name: PAGE_HEADING, exact: true })).toBeVisible();
  await expect(page.getByText(`Variant: ${variant}`)).toBeVisible();
}

/** Reads the page's frame counter, or -1 when the hook is missing. */
async function readFrames(page: Page): Promise<number> {
  return page.evaluate((hook) => {
    const value: unknown = Reflect.get(window, hook);
    return typeof value === 'number' ? value : -1;
  }, FRAMES_HOOK);
}

for (const variant of VARIANTS) {
  test.describe(`variant ${variant}`, () => {
    test('returns the same primes as the main-thread function', async ({ page }) => {
      await openPage(page, variant);

      await page.getByRole('button', { name: START_LABEL }).click();

      await expect(page.locator('output')).toHaveText(expectedSummary(expectedPrimes(PRIME_LIMIT)));
    });

    test('keeps animation frames running while computing', async ({ page }) => {
      await openPage(page, variant);
      await expect.poll(() => readFrames(page)).toBeGreaterThan(0);

      const framesAtStart = await readFrames(page);
      await page.getByRole('button', { name: START_LABEL }).click();
      await expect(page.locator('output')).toBeVisible();
      const framesAtResult = await readFrames(page);

      expect(framesAtResult - framesAtStart).toBeGreaterThanOrEqual(MIN_FRAMES);
    });
  });
}
