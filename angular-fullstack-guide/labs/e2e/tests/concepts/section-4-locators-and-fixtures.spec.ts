import { expect, test as base, type Locator, type Page } from '@playwright/test';

/** One page's locators and actions: the only place that knows how the todos page is built. */
class TodosPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/m30/todos');
    await expect(this.page.getByRole('heading', { name: 'Todos' })).toBeVisible();
  }

  async add(title: string): Promise<void> {
    await this.page.getByLabel('New todo').fill(title);
    await this.page.getByRole('button', { name: 'Add' }).click();
    await expect(this.page.getByRole('status')).toHaveText('Saved');
  }

  row(title: string): Locator {
    return this.page.getByRole('listitem').filter({ hasText: title });
  }

  async deleteRow(title: string): Promise<void> {
    await this.row(title).getByRole('button', { name: 'Delete' }).click();
  }
}

/** A fixture hands each test its own tenant (server-side data) and a page object already on the page. */
const test = base.extend<{ todosPage: TodosPage }>({
  todosPage: async ({ page, context, baseURL }, use, testInfo) => {
    const tenant = `section-4-${testInfo.testId}-${testInfo.repeatEachIndex}`;
    await context.addCookies([{ name: 'm30-tenant', value: tenant, url: baseURL ?? '' }]);
    await page.request.post('/api/__reset', { data: [{ title: 'Buy milk' }, { title: 'Walk the dog' }] });
    const todosPage = new TodosPage(page);
    await todosPage.goto();
    await use(todosPage);
  },
});

test('Section 4: getByRole finds a button by its accessible name', async ({ page }) => {
  await page.setContent('<button aria-label="Close dialog">x</button><button>Save</button>');

  await expect(page.getByRole('button', { name: 'Close dialog' })).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Save' })).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'x' })).toHaveCount(0);
});

test('Section 4: a locator that matches two elements throws a strict mode violation', async ({ page, todosPage }) => {
  await expect(todosPage.row('Walk the dog')).toBeVisible();

  const error = await page
    .getByRole('button', { name: 'Delete' })
    .click({ timeout: 2000 })
    .then(
      () => null,
      (e: Error) => e,
    );

  expect(error?.message.split('\n')[0]).toBe(
    "locator.click: Error: strict mode violation: getByRole('button', { name: 'Delete' }) resolved to 2 elements:",
  );
  expect(error?.message).toContain("aka getByRole('listitem').filter({ hasText: 'Buy milk Delete' }).getByRole('button')");
  expect(error?.message).toContain("aka getByRole('listitem').filter({ hasText: 'Walk the dog Delete' }).getByRole('button')");
});

test('Section 4: filtering by row text narrows to one Delete button', async ({ page, todosPage }) => {
  await expect(todosPage.row('Walk the dog').getByRole('button', { name: 'Delete' })).toHaveCount(1);

  await todosPage.deleteRow('Walk the dog');

  await expect(page.getByRole('listitem')).toHaveCount(1);
  await expect(todosPage.row('Buy milk')).toBeVisible();
  const log = await (await page.request.get('/api/__log')).json();
  expect(log).toEqual([
    { method: 'GET', url: '/api/todos' },
    { method: 'DELETE', url: '/api/todos/2' },
  ]);
});

const recorded: string[] = [];
const withLifecycle = base.extend<{ lifecycle: string[] }>({
  lifecycle: async ({}, use) => {
    recorded.push('setup');
    await use(recorded);
    recorded.push('teardown');
  },
});

withLifecycle.describe('Section 4 lifecycle', () => {
  withLifecycle("Section 4: a fixture's teardown runs after the test", async ({ lifecycle }) => {
    lifecycle.push('test');

    expect(lifecycle).toEqual(['setup', 'test']);
  });

  withLifecycle.afterAll(() => {
    expect(recorded).toEqual(['setup', 'test', 'teardown']);
  });
});

test('Section 4: a page object delivered as a fixture drives the journey', async ({ todosPage }) => {
  await todosPage.add('Book the venue');
  await todosPage.deleteRow('Buy milk');

  await expect(todosPage.row('Book the venue')).toBeVisible();
  await expect(todosPage.row('Buy milk')).toHaveCount(0);
  await expect(todosPage.row('Walk the dog')).toHaveCount(1);
});
