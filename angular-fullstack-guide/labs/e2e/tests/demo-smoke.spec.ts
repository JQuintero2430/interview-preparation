import { expect, test } from '@playwright/test';

test('Smoke: the todos page loads from the production build', async ({ page, context, baseURL }) => {
  await context.addCookies([{ name: 'm30-tenant', value: 'demo-smoke', url: baseURL! }]);
  await page.request.post('/api/__reset', { data: [{ title: 'Write the plan' }] });

  await page.goto('/m30/todos');

  await expect(page.getByRole('heading', { name: 'Todos' })).toBeVisible();
  await expect(page.getByRole('listitem')).toHaveCount(1);
  await expect(page.getByRole('checkbox', { name: 'Write the plan' })).not.toBeChecked();
});
