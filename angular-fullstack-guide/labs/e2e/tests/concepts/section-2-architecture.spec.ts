import { expect, test, type Browser, type BrowserContext } from '@playwright/test';

/** A made-up origin: every request to it is answered by a route, so nothing leaves the machine. */
const ORIGIN = 'http://m30-section-2.test';

/** Answers every request to ORIGIN with an empty HTML page, giving the test a real origin for cookies and storage. */
async function serveBlankPage(context: BrowserContext): Promise<void> {
  await context.route(`${ORIGIN}/**`, (route) =>
    route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>Section 2</title>' }),
  );
}

test('Section 2: test code runs in Node and reaches the page through evaluate', async ({ page }) => {
  const inTest = typeof window;
  const nodeVersion = process.versions.node;

  const inPage = await page.evaluate(() => typeof window);

  expect(inTest).toBe('undefined');
  expect(nodeVersion).toMatch(/^24\./);
  expect(inPage).toBe('object');
});

test.describe.serial('Section 2: each test starts with an empty browser context', () => {
  let firstBrowser: Browser | undefined;

  test('the first test stores a cookie and a localStorage item', async ({ browser, context, page }) => {
    firstBrowser = browser;
    await serveBlankPage(context);
    await page.goto(`${ORIGIN}/`);

    await page.evaluate(() => {
      document.cookie = 'visited=yes';
      localStorage.setItem('visited', 'yes');
    });

    expect(await context.cookies()).toHaveLength(1);
    expect(await page.evaluate(() => localStorage.getItem('visited'))).toBe('yes');
  });

  test('the next test, in the same browser, sees neither', async ({ browser, context, page }) => {
    await serveBlankPage(context);
    await page.goto(`${ORIGIN}/`);

    expect(browser).toBe(firstBrowser);
    expect(await context.cookies()).toEqual([]);
    expect(await page.evaluate(() => document.cookie)).toBe('');
    expect(await page.evaluate(() => localStorage.getItem('visited'))).toBeNull();
  });
});

test('Section 2: two pages in one context share storage while a second context does not', async ({
  browser,
  context,
  page,
}) => {
  await serveBlankPage(context);
  const secondTab = await context.newPage();
  const otherContext = await browser.newContext();
  await serveBlankPage(otherContext);
  const otherPage = await otherContext.newPage();

  await page.goto(`${ORIGIN}/`);
  await secondTab.goto(`${ORIGIN}/`);
  await otherPage.goto(`${ORIGIN}/`);
  await page.evaluate(() => localStorage.setItem('cart', '3 items'));

  expect(await secondTab.evaluate(() => localStorage.getItem('cart'))).toBe('3 items');
  expect(await otherPage.evaluate(() => localStorage.getItem('cart'))).toBeNull();
  await otherContext.close();
});
