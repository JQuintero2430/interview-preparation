import { expect, test, type Browser, type Page } from '@playwright/test';
import { liveText, UI_ORIGIN } from '../support/ui.js';

async function openA11y(browser: Browser): Promise<Page> {
  const context = await browser.newContext({ colorScheme: 'light', reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await page.goto(`${UI_ORIGIN}/m36/a11y`);
  await expect(page.getByRole('heading', { level: 1, name: 'Section 9: CDK accessibility' })).toBeVisible();
  return page;
}

test('Section 9: Tab from the last element of a trapped region returns to the first', async ({ browser }) => {
  const page = await openA11y(browser);
  const first = page.getByRole('button', { name: 'Trap first', exact: true });
  const last = page.getByRole('button', { name: 'Trap last', exact: true });
  const outsideAfter = page.getByRole('button', { name: 'Outside after', exact: true });

  // Two invisible anchors, one on each side of the region, are what the Tab key reaches.
  const anchors = page.locator('.cdk-focus-trap-anchor');
  await expect(anchors).toHaveCount(2);
  for (const anchor of [anchors.first(), anchors.last()]) {
    await expect(anchor).toHaveAttribute('aria-hidden', 'true');
    await expect(anchor).toHaveAttribute('tabindex', '0');
  }

  // Tab from the last button lands on the end anchor, whose focus listener moves focus to the first button.
  await last.focus();
  await expect(last).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(first).toBeFocused();

  // The directive only redirects Tab: nothing outside the region is inert, and a click outside it still takes focus.
  await expect(page.locator('[inert]')).toHaveCount(0);
  await outsideAfter.click();
  await expect(outsideAfter).toBeFocused();
  await page.context().close();
});

test('Section 9: keyboard focus gets cdk-keyboard-focused and a click does not', async ({ browser }) => {
  const page = await openA11y(browser);
  const before = page.getByRole('button', { name: 'Before the monitored button', exact: true });
  const monitored = page.getByRole('button', { name: 'Monitored button', exact: true });
  const origin = page.getByRole('status', { name: 'Focus origin', exact: true });
  await expect(origin).toHaveText('Origin: none');

  // Tab is a key press, so the input-modality detector reports keyboard before the focus event.
  await before.focus();
  await page.keyboard.press('Tab');
  await expect(monitored).toBeFocused();
  await expect(monitored).toHaveClass(/cdk-keyboard-focused/);
  await expect(monitored).toHaveClass(/cdk-focused/);
  await expect(monitored).not.toHaveClass(/cdk-mouse-focused/);
  await expect(origin).toHaveText('Origin: keyboard');

  // Moving focus away clears the classes; a click is a mouse press, so the same button now reports mouse.
  await before.click();
  await expect(monitored).not.toHaveClass(/cdk-focused/);
  await expect(origin).toHaveText('Origin: none');
  await monitored.click();
  await expect(monitored).toBeFocused();
  await expect(monitored).toHaveClass(/cdk-mouse-focused/);
  await expect(monitored).not.toHaveClass(/cdk-keyboard-focused/);
  await expect(origin).toHaveText('Origin: mouse');
  await page.context().close();
});

test('Section 9: LiveAnnouncer writes the message into its live element', async ({ browser }) => {
  const page = await openA11y(browser);
  const live = page.locator('.cdk-live-announcer-element');

  await page.getByRole('button', { name: 'Announce results', exact: true }).click();

  // The write is delayed, so the text is read with expect.poll; there is one element, polite and atomic by default.
  await expect.poll(() => liveText(page)).toEqual(['3 results found']);
  await expect(live).toHaveCount(1);
  await expect(live).toHaveAttribute('aria-live', 'polite');
  await expect(live).toHaveAttribute('aria-atomic', 'true');
  await page.context().close();
});
