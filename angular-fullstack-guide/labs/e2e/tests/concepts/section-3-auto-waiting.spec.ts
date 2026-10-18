import { expect, test } from '@playwright/test';

/** A status that stays empty until `delayMs` after the page script runs, then reads "Saved". */
const SLOW_STATUS = `<p role="status"></p>
<script>
  setTimeout(() => { document.querySelector('[role=status]').textContent = 'Saved'; }, 600);
</script>`;

/** A disabled "Pay" button that becomes enabled after 600 ms; its click handler writes the outcome. */
const SLOW_BUTTON = `<button disabled>Pay</button><p role="status"></p>
<script>
  const button = document.querySelector('button');
  button.addEventListener('click', () => { document.querySelector('[role=status]').textContent = 'Paid'; });
  setTimeout(() => { button.disabled = false; }, 600);
</script>`;

test('Section 3: a web-first assertion retries until the text appears', async ({ page }) => {
  await page.setContent(SLOW_STATUS);
  const status = page.getByRole('status');
  await expect(status).toHaveText('');

  await expect(status).toHaveText('Saved');
});

test('Section 3: a value read once does not retry', async ({ page }) => {
  await page.setContent(SLOW_STATUS);
  const status = page.getByRole('status');

  const readOnce = await status.textContent();
  const evaluatedOnce = await page.evaluate(() => document.querySelector('[role=status]')?.textContent);
  await expect(status).toHaveText('Saved');

  expect(readOnce).toBe('');
  expect(evaluatedOnce).toBe('');
  expect(await status.textContent()).toBe('Saved');
});

test('Section 3: click waits for a disabled button to become enabled', async ({ page }) => {
  await page.setContent(SLOW_BUTTON);
  const pay = page.getByRole('button', { name: 'Pay' });
  await expect(pay).toBeDisabled();

  await pay.click();

  await expect(page.getByRole('status')).toHaveText('Paid');
});

test('Section 3: an action fails with TimeoutError when its target never becomes actionable', async ({ page }) => {
  await page.setContent('<button disabled>Pay</button>');

  const error = await page
    .getByRole('button', { name: 'Pay' })
    .click({ timeout: 500 })
    .then(
      () => null,
      (e: Error) => e,
    );

  expect(error?.name).toBe('TimeoutError');
  expect(error?.message.split('\n')[0]).toBe('locator.click: Timeout 500ms exceeded.');
  expect(error?.message).toContain('waiting for element to be visible, enabled and stable');
  expect(error?.message).toContain('element is not enabled');
  expect(error?.message).toContain('retrying click action');
});
