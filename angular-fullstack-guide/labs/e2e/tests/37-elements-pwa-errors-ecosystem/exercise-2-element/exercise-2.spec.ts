import { expect, test } from '@playwright/test';
import { ORIGIN } from '../support/sw.js';

for (const variant of ['a', 'b']) {
  const tag = `m37-ex2-rating-${variant}`;

  test.describe(`variant ${variant}`, () => {
    test('renders the number of stars given by the `max-stars` attribute', async ({ browser }) => {
      const context = await browser.newContext({ serviceWorkers: 'block' });
      const page = await context.newPage();
      await page.goto(`${ORIGIN}/host/ex2-${variant}.html`);

      await expect(page.locator(tag).getByRole('radio')).toHaveCount(4);
      await context.close();
    });

    test('shows the value the host page sets through the `value` property', async ({ browser }) => {
      const context = await browser.newContext({ serviceWorkers: 'block' });
      const page = await context.newPage();
      await page.goto(`${ORIGIN}/host/ex2-${variant}.html`);

      await expect(page.locator(tag).getByRole('radio', { name: '2 of 4 stars' })).toBeChecked();
      await expect(page.locator(tag).getByRole('radio', { name: '3 of 4 stars' })).not.toBeChecked();
      await context.close();
    });

    test('dispatches a `ratingChange` event with the chosen value in `detail`', async ({ browser }) => {
      const context = await browser.newContext({ serviceWorkers: 'block' });
      const page = await context.newPage();
      await page.goto(`${ORIGIN}/host/ex2-${variant}.html`);

      await page.locator(tag).getByRole('radio', { name: '4 of 4 stars' }).click();
      await expect(page.getByRole('list', { name: 'Event log' }).getByRole('listitem')).toHaveText(['ratingChange 4']);
      await context.close();
    });

    test('lets the user choose a rating with the keyboard', async ({ browser }) => {
      const context = await browser.newContext({ serviceWorkers: 'block' });
      const page = await context.newPage();
      await page.goto(`${ORIGIN}/host/ex2-${variant}.html`);

      const stars = page.locator(tag);
      await stars.getByRole('radio', { name: '2 of 4 stars' }).focus();
      await page.keyboard.press('ArrowRight');
      await expect(stars.getByRole('radio', { name: '3 of 4 stars' })).toBeChecked();
      await expect(stars.getByRole('radio', { name: '3 of 4 stars' })).toBeFocused();
      await page.keyboard.press('ArrowLeft');
      await page.keyboard.press('ArrowLeft');
      await expect(stars.getByRole('radio', { name: '1 of 4 stars' })).toBeChecked();
      await expect(page.getByRole('list', { name: 'Event log' }).getByRole('listitem')).toHaveText([
        'ratingChange 3',
        'ratingChange 2',
        'ratingChange 1',
      ]);
      await context.close();
    });

    test('keeps its value when the host page moves it to another container', async ({ browser }) => {
      const context = await browser.newContext({ serviceWorkers: 'block' });
      const page = await context.newPage();
      await page.goto(`${ORIGIN}/host/ex2-${variant}.html`);

      const element = page.locator(tag);
      await element.getByRole('radio', { name: '3 of 4 stars' }).click();
      const instance = await element.getAttribute('data-instance');
      expect(instance).not.toBeNull();

      await page.getByRole('button', { name: 'Move' }).click();

      await expect(page.locator(`#second ${tag}`)).toHaveCount(1);
      await expect(page.locator(`#first ${tag}`)).toHaveCount(0);
      await expect(page.locator(`#second ${tag}`).getByRole('radio', { name: '3 of 4 stars' })).toBeChecked();
      // The same component instance: a re-created one would carry a higher creation number.
      await expect(page.locator(tag)).toHaveAttribute('data-instance', instance ?? '');
      await context.close();
    });
  });
}
