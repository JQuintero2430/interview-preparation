import { AxeBuilder } from '@axe-core/playwright';
import { expect, test, type BrowserContext, type Page, type TestInfo } from '@playwright/test';

const WCAG_A_AND_AA = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

/** Gives each test (and each repeat) its own server-side data, then seeds it. */
async function seedOwnTenant(page: Page, context: BrowserContext, testInfo: TestInfo, titles: string[]): Promise<void> {
  const tenant = `section-6-${testInfo.testId}-${testInfo.repeatEachIndex}`;
  await context.addCookies([{ name: 'm30-tenant', value: tenant, url: 'http://localhost:4300' }]);
  await page.request.post('/api/__reset', { data: titles.map((title) => ({ title })) });
}

test('Section 6: the empty todos page matches its baseline screenshot', async ({ page, context }, testInfo) => {
  await seedOwnTenant(page, context, testInfo, []);

  await page.goto('/m30/todos');

  await expect(page.getByText('No todos yet')).toBeVisible();
  await expect(page).toHaveScreenshot('todos-empty.png');
});

test('Section 6: a button shifted by CSS fails the screenshot while a functional assertion still passes', async ({ page, context }, testInfo) => {
  await seedOwnTenant(page, context, testInfo, []);
  await page.goto('/m30/todos');
  await expect(page.getByText('No todos yet')).toBeVisible();

  await page.addStyleTag({ content: 'button[type="submit"] { position: relative; left: 40px; }' });

  await expect(page.getByRole('button', { name: 'Add' })).toBeVisible();
  await expect(page).not.toHaveScreenshot('todos-empty.png');
});

test('Section 6: the baseline file name carries the project and the platform', async ({ page }, testInfo) => {
  await page.setContent('<p>x</p>');

  expect(testInfo.snapshotPath('todos-empty.png')).toMatch(
    new RegExp(`section-6-visual-and-a11y\\.spec\\.ts-snapshots/todos-empty-chromium-${process.platform}\\.png$`),
  );
});

test('Section 6: axe finds no violations on the todos page for the WCAG A and AA tags', async ({ page, context }, testInfo) => {
  await seedOwnTenant(page, context, testInfo, ['Buy milk']);
  await page.goto('/m30/todos');
  await expect(page.getByRole('checkbox', { name: 'Buy milk' })).toBeVisible();

  const results = await new AxeBuilder({ page }).withTags(WCAG_A_AND_AA).analyze();

  expect(results.violations).toEqual([]);
});

test('Section 6: axe reports an unlabelled input as a label violation', async ({ page }) => {
  await page.setContent('<main><h1>Form</h1><input type="text"></main>');

  const results = await new AxeBuilder({ page }).analyze();

  expect(results.violations.map((violation) => violation.id)).toContain('label');
});

test('Section 6: the todo list matches its ARIA snapshot', async ({ page, context }, testInfo) => {
  await seedOwnTenant(page, context, testInfo, ['Buy milk', 'Walk dog']);
  await page.goto('/m30/todos');

  await expect(page.getByRole('list')).toMatchAriaSnapshot(`
    - list:
      - listitem:
        - checkbox "Buy milk"
        - button "Delete"
      - listitem:
        - checkbox "Walk dog"
        - button "Delete"
  `);
});
