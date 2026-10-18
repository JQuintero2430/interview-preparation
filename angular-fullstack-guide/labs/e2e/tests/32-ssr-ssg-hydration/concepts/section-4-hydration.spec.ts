// Section 4: hydration on the production build of `ssr-lab` (port 4400); every page here is RenderMode.Server.
// The main bundle is held (`holdScripts`) so a node can be grabbed before Angular runs, then compared after hydration.
import { expect, test } from '@playwright/test';
import { consoleErrors, holdScripts, rawHtml, SSR_ORIGIN, stateScript } from '../support/ssr.js';

const PAGES = '/m32/hydration';
const MAIN = /\/main-[^/]*\.js$/;

test('Section 4: the server HTML carries hydration annotations and the state script', async ({ request }) => {
  const { status, body } = await rawHtml(request, `${PAGES}/plain`);
  expect(status).toBe(200);
  expect(body).toContain('<body><!--nghm-->');
  expect(body).toContain('<lab-m32-hydration-plain ngh="0"><h2>Hydration: plain page</h2>');
  expect(stateScript(body)).toHaveProperty('__nghData__');
});

test('Section 4: hydration keeps the nodes the server rendered', async ({ page }) => {
  const errors = consoleErrors(page);
  const release = await holdScripts(page, MAIN);
  await page.goto(`${SSR_ORIGIN}${PAGES}/plain`, { waitUntil: 'commit' });
  const heading = page.getByRole('heading', { name: 'Hydration: plain page' });
  await expect(heading).toBeVisible();
  const serverHeading = await heading.elementHandle();

  await release();
  const button = page.getByRole('button', { name: 'Clicks: 0' });
  await button.click();
  await expect(page.getByRole('button', { name: 'Clicks: 1' })).toBeVisible();

  const sameNode = await page.evaluate(
    (node) => node !== null && node.isConnected && node === document.querySelector('lab-m32-hydration-plain h2'),
    serverHeading,
  );
  expect(sameNode).toBe(true);
  expect(errors).toEqual([]);
});

test("Section 4: ngSkipHydration renders the component's nodes again", async ({ request, page }) => {
  const { body } = await rawHtml(request, `${PAGES}/skip`);
  // The server writes the content but no annotation for the skipped component.
  expect(body).toContain('<lab-m32-skipped-card ngskiphydration=""><p>Skipped card content</p></lab-m32-skipped-card>');

  const release = await holdScripts(page, MAIN);
  await page.goto(`${SSR_ORIGIN}${PAGES}/skip`, { waitUntil: 'commit' });
  await expect(page.getByText('Skipped card content')).toBeVisible();
  const serverHeading = await page.getByRole('heading', { name: 'Hydration: skipped child' }).elementHandle();
  const serverCardText = await page.getByText('Skipped card content').elementHandle();

  await release();
  await page.getByRole('button', { name: 'Clicks: 0' }).click();
  await expect(page.getByRole('button', { name: 'Clicks: 1' })).toBeVisible();

  const kept = await page.evaluate(([heading, card]) => [heading?.isConnected, card?.isConnected], [serverHeading, serverCardText]);
  expect(kept).toEqual([true, false]);
  await expect(page.getByText('Skipped card content')).toHaveCount(1);
});

test('Section 4: a component that adds DOM nodes outside Angular fails hydration with its error code', async ({ page }) => {
  const errors = consoleErrors(page);
  await page.goto(`${SSR_ORIGIN}${PAGES}/dom-append`);
  await expect.poll(() => errors.length).toBeGreaterThan(0);
  // The production build prints the code alone: the message text is stripped (`ngDevMode` is false).
  expect(errors[0]).toMatch(/^ERROR \w+: NG0500\n/);
  await expect(page.locator('lab-m32-sales-chart canvas')).toHaveCount(1);
});

test('Section 4: markup the parser repairs fails hydration', async ({ request, page }) => {
  const { body } = await rawHtml(request, `${PAGES}/invalid-nesting`);
  expect(body).toContain('<p>Intro <lab-m32-note-box ngh="0"><div>Box content</div></lab-m32-note-box></p>');

  const errors = consoleErrors(page);
  await page.goto(`${SSR_ORIGIN}${PAGES}/invalid-nesting`);
  await expect.poll(() => errors.length).toBeGreaterThan(0);
  expect(errors[0]).toMatch(/^ERROR \w+: NG0502\n/);
  // The browser's parser closed the <p> before the <div>, so the component host is empty.
  await expect(page.locator('lab-m32-note-box')).toBeEmpty();
  await expect(page.locator('lab-m32-hydration-invalid-nesting > div')).toHaveText('Box content');
});
