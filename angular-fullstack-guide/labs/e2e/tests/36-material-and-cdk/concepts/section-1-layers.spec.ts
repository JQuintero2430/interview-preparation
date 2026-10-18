import { expect, test } from '@playwright/test';
import { UI_ORIGIN } from '../support/ui.js';

const VERSIONS: readonly string[] = ['Material', 'CDK', 'Aria'];
const SIZES: readonly string[] = ['Small', 'Medium', 'Large'];

test('Section 1: the Material, CDK and Aria versions expose the same accessible role and name', async ({ browser }) => {
  const context = await browser.newContext({ colorScheme: 'light', reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await page.goto(`${UI_ORIGIN}/m36/layers`);
  await expect(page.getByRole('heading', { level: 1, name: 'Section 1: one control, three layers' })).toBeVisible();

  for (const version of VERSIONS) {
    const region = page.getByRole('region', { name: `${version} version` });
    const listbox = region.getByRole('listbox', { name: 'Size', exact: true });
    await expect(listbox).toBeVisible();
    await expect(listbox).toHaveAttribute('aria-multiselectable', 'false');
    await expect(listbox.getByRole('option')).toHaveCount(SIZES.length);
    for (const size of SIZES) await expect(listbox.getByRole('option', { name: size })).toBeVisible();
  }

  await context.close();
});
