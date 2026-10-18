import { expect, test } from '@playwright/test';
import { UI_ORIGIN } from '../support/ui.js';

test('Section 11: the Aria tabs move between tabs with the arrow keys and show one panel', async ({ browser }) => {
  const context = await browser.newContext({ colorScheme: 'light', reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await page.goto(`${UI_ORIGIN}/m36/aria`);
  await expect(page.getByRole('heading', { level: 1, name: 'Section 11: Angular Aria tabs' })).toBeVisible();

  const tablist = page.getByRole('tablist', { name: 'Product information', exact: true });
  const details = tablist.getByRole('tab', { name: 'Details', exact: true });
  const shipping = tablist.getByRole('tab', { name: 'Shipping', exact: true });
  const returns = tablist.getByRole('tab', { name: 'Returns', exact: true });
  const selected = page.getByRole('status', { name: 'Selected tab', exact: true });
  // Every panel, shown or not; getByRole('tabpanel') below counts only the ones in the accessibility tree.
  const allPanels = page.locator('[role="tabpanel"]');

  // The bound model selects Details: it alone is selected and in the tab sequence, and one panel is exposed, named by its tab.
  await expect(details).toHaveAttribute('aria-selected', 'true');
  await expect(shipping).toHaveAttribute('aria-selected', 'false');
  await expect(details).toHaveAttribute('tabindex', '0');
  await expect(shipping).toHaveAttribute('tabindex', '-1');
  await expect(allPanels).toHaveCount(3);
  await expect(page.getByRole('tabpanel')).toHaveCount(1);
  await expect(page.getByRole('tabpanel', { name: 'Details', exact: true })).toHaveText('A cotton shirt in three sizes.');

  // ArrowRight moves focus to the next tab, and selection follows focus by default.
  await details.focus();
  await page.keyboard.press('ArrowRight');
  await expect(shipping).toBeFocused();
  await expect(shipping).toHaveAttribute('aria-selected', 'true');
  await expect(details).toHaveAttribute('aria-selected', 'false');
  await expect(shipping).toHaveAttribute('tabindex', '0');
  await expect(details).toHaveAttribute('tabindex', '-1');
  await expect(page.getByRole('tabpanel')).toHaveCount(1);
  await expect(page.getByRole('tabpanel', { name: 'Shipping', exact: true })).toHaveText('Ships in two working days.');
  await expect(selected).toHaveText('shipping');

  // The panel left behind is inert, and its ngTabContent view is destroyed (preserveContent is off by default).
  await expect(allPanels.first()).toHaveAttribute('inert');
  await expect(allPanels.first()).not.toContainText('cotton');

  // End goes to the last tab; ArrowRight there wraps to the first.
  await page.keyboard.press('End');
  await expect(returns).toBeFocused();
  await expect(returns).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('ArrowRight');
  await expect(details).toBeFocused();
  await expect(details).toHaveAttribute('aria-selected', 'true');
  await expect(selected).toHaveText('details');
  await expect(page.getByRole('tabpanel')).toHaveCount(1);

  await context.close();
});
