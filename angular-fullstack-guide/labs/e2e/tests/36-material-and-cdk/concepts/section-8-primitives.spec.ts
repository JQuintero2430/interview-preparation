import { expect, test, type Browser, type Page, type ViewportSize } from '@playwright/test';
import { grantClipboard, readClipboard, UI_ORIGIN } from '../support/ui.js';

const DESKTOP: ViewportSize = { width: 1280, height: 720 };
const PHONE: ViewportSize = { width: 375, height: 667 };

async function openPrimitives(browser: Browser, viewport: ViewportSize, withClipboard = false): Promise<Page> {
  const context = await browser.newContext({ colorScheme: 'light', reducedMotion: 'no-preference', viewport });
  if (withClipboard) await grantClipboard(context);
  const page = await context.newPage();
  await page.goto(`${UI_ORIGIN}/m36/primitives`);
  await expect(page.getByRole('heading', { level: 1, name: 'Section 8: the smaller primitives' })).toBeVisible();
  return page;
}

test('Section 8: a linear stepper does not advance past an invalid step', async ({ browser }) => {
  const page = await openPrimitives(browser, DESKTOP);
  const emailTab = page.getByRole('tab', { name: 'Email step' });
  const noteTab = page.getByRole('tab', { name: 'Note step' });
  const finishTab = page.getByRole('tab', { name: 'Finish step' });
  const report = page.getByRole('status', { name: 'Step report', exact: true });
  await expect(emailTab).toHaveAttribute('aria-selected', 'true');
  await expect(report).toHaveText('No move yet');

  // The email control is empty, so it is invalid: the click on Next is refused.
  await page.getByRole('button', { name: 'To note' }).click();
  // `fill` needs the email input visible, which only the first step's panel is, so it also proves the step did not move.
  await page.getByRole('textbox', { name: 'Email address' }).fill('ada@example.com');
  await expect(emailTab).toHaveAttribute('aria-selected', 'true');
  await expect(noteTab).toHaveAttribute('aria-selected', 'false');
  await expect(report).toHaveText('No move yet');

  // With a valid control the same click moves, and selectionChange reports both indexes.
  await page.getByRole('button', { name: 'To note' }).click();
  await expect(noteTab).toHaveAttribute('aria-selected', 'true');
  await expect(emailTab).toHaveAttribute('aria-selected', 'false');
  await expect(report).toHaveText('Moved: selectedIndex 1, previouslySelectedIndex 0');

  // The note step has no stepControl, so it never blocks.
  await page.getByRole('button', { name: 'To finish' }).click();
  await expect(finishTab).toHaveAttribute('aria-selected', 'true');
  await expect(report).toHaveText('Moved: selectedIndex 2, previouslySelectedIndex 1');
  await page.context().close();
});

test('Section 8: BreakpointObserver reports Handset at 375 px and not at 1280 px', async ({ browser }) => {
  const page = await openPrimitives(browser, PHONE);
  const state = page.getByRole('status', { name: 'Handset state', exact: true });
  const emissions = page.getByRole('status', { name: 'Handset emissions', exact: true });
  const queries = page.getByRole('list', { name: 'Handset queries', exact: true }).getByRole('listitem');

  // The Handset string is two queries; the portrait one matches a 375 x 667 viewport, the landscape one does not.
  await expect(state).toHaveText('Handset: true');
  await expect(emissions).toHaveText('Emissions: 1');
  await expect(queries).toHaveText([
    '(max-width: 599.98px) and (orientation: portrait): true',
    '(max-width: 959.98px) and (orientation: landscape): false',
  ]);

  // Crossing the portrait query's edge is one change event, so the observer emits once more.
  await page.setViewportSize(DESKTOP);
  await expect(state).toHaveText('Handset: false');
  await expect(emissions).toHaveText('Emissions: 2');
  await expect(queries).toHaveText([
    '(max-width: 599.98px) and (orientation: portrait): false',
    '(max-width: 959.98px) and (orientation: landscape): false',
  ]);
  await page.context().close();
});

test('Section 8: Clipboard.copy puts the text on the clipboard', async ({ browser }) => {
  const page = await openPrimitives(browser, DESKTOP, true);
  const result = page.getByRole('status', { name: 'Copy result', exact: true });
  await expect(result).toHaveText('Not copied yet');

  await page.getByRole('button', { name: 'Copy link' }).click();

  // `copy` returned true, the clipboard (read through the async API the test was granted) holds the text,
  // and the off-screen textarea the copy needed is gone.
  await expect(result).toHaveText('Copied: true');
  await expect.poll(() => readClipboard(page)).toBe('example.com/share/42');
  await expect(page.locator('textarea')).toHaveCount(0);
  await page.context().close();
});
