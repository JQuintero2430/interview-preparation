import { expect, test, type Page } from '@playwright/test';

/** The worker file the production build names `worker-<hash>.js` (hash of upper-case letters and digits). */
const WORKER_FILE = /\/worker-[A-Z0-9]+\.js$/;

/** Lab instrumentation: the page's `requestAnimationFrame` counter, and the limit its button counts to. */
const FRAMES_HOOK = '__m31Frames';
const PRIME_LIMIT = 5_000_000;

/** Frames that must be drawn between the click and the result; the count runs for many more. */
const MIN_FRAMES = 5;

const PAGE_HEADING = 'Worker lab';
const START_LABEL = 'Count primes';
const RESULT_LABEL = 'Primes found:';

/** Counts the primes up to `limit` with a sieve, a different algorithm from the page's trial division. */
function expectedPrimeCount(limit: number): number {
  const composite = new Uint8Array(limit + 1);
  let count = 0;
  for (let n = 2; n <= limit; n++) {
    if (composite[n] === 1) continue;
    count++;
    for (let multiple = n * n; multiple <= limit; multiple += n) composite[multiple] = 1;
  }
  return count;
}

/** Reads the page's frame counter, or -1 when the hook is missing. */
async function readFrames(page: Page): Promise<number> {
  return page.evaluate((hook) => {
    const value: unknown = Reflect.get(window, hook);
    return typeof value === 'number' ? value : -1;
  }, FRAMES_HOOK);
}

test('Section 9: the production build serves the worker as its own file', async ({ page }) => {
  const workerRequests: string[] = [];
  page.on('request', (request) => {
    if (WORKER_FILE.test(new URL(request.url()).pathname)) workerRequests.push(request.url());
  });

  await page.goto('/m31/worker');
  await expect(page.getByRole('heading', { name: PAGE_HEADING, exact: true })).toBeVisible();
  expect(workerRequests).toHaveLength(0);

  const workerRequest = page.waitForRequest((request) => WORKER_FILE.test(new URL(request.url()).pathname));
  await page.getByRole('button', { name: START_LABEL }).click();
  const request = await workerRequest;

  expect(new URL(request.url()).pathname).toMatch(WORKER_FILE);
  expect((await request.response())?.status()).toBe(200);
  await expect(page.getByText(RESULT_LABEL)).toBeVisible();
});

test('Section 9: animation frames keep running while the worker computes', async ({ page }) => {
  await page.goto('/m31/worker');
  await expect(page.getByRole('heading', { name: PAGE_HEADING, exact: true })).toBeVisible();
  await expect.poll(() => readFrames(page)).toBeGreaterThan(0);

  const framesAtStart = await readFrames(page);
  await page.getByRole('button', { name: START_LABEL }).click();
  await expect(page.getByText(RESULT_LABEL)).toBeVisible();
  const framesAtResult = await readFrames(page);

  expect(framesAtResult - framesAtStart).toBeGreaterThanOrEqual(MIN_FRAMES);
  await expect(page.locator('output')).toHaveText(String(expectedPrimeCount(PRIME_LIMIT)));
});
