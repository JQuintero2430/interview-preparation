import { expect, test, type Page } from '@playwright/test';
import { computed, rect, UI_ORIGIN } from '../support/ui.js';

type CloseWay = 'button' | 'escape';
const CLOSE_WAYS: readonly CloseWay[] = ['button', 'escape'];

interface MenuCase {
  readonly region: string;
  readonly edge: 'left' | 'right';
}

// Under dir ltr the panel's start edge is its left edge; under dir rtl it is the right edge.
const MENU_CASES: readonly MenuCase[] = [
  { region: 'Menu under dir ltr', edge: 'left' },
  { region: 'Menu under dir rtl', edge: 'right' },
];

interface MotionCase {
  readonly reducedMotion: 'reduce' | 'no-preference';
  readonly state: string;
  readonly animationName: string;
}

const MOTION_CASES: readonly MotionCase[] = [
  { reducedMotion: 'reduce', state: 'reduced-motion', animationName: 'none' },
  { reducedMotion: 'no-preference', state: 'enabled', animationName: '_mat-menu-enter' },
];

async function closeDialog(page: Page, way: CloseWay): Promise<void> {
  if (way === 'escape') await page.keyboard.press('Escape');
  else await page.getByRole('dialog').getByRole('button', { name: 'Keep' }).click();
}

test('Section 2: closing a dialog returns focus to the button that opened it', async ({ browser }) => {
  const context = await browser.newContext({ colorScheme: 'light', reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await page.goto(`${UI_ORIGIN}/m36/material-app`);
  const opener = page.getByRole('button', { name: 'Delete draft' });
  const dialog = page.getByRole('dialog');

  for (const way of CLOSE_WAYS) {
    await opener.click();
    await expect(dialog).toBeVisible();
    await expect(dialog.locator(':focus')).toHaveCount(1);

    await closeDialog(page, way);
    await expect(dialog).toHaveCount(0);
    await expect(opener).toBeFocused();
  }

  await context.close();
});

test('Section 2: a menu opens on the start side under dir rtl', async ({ browser }) => {
  const context = await browser.newContext({ colorScheme: 'light', reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await page.goto(`${UI_ORIGIN}/m36/material-app`);

  for (const { region, edge } of MENU_CASES) {
    const trigger = page.getByRole('region', { name: region }).getByRole('button', { name: 'Menu', exact: true });
    await trigger.click();
    const panel = page.getByRole('menu');
    await expect(panel).toBeVisible();

    // The panel is wider than the trigger, so lining up one edge is a real choice: the start edge of the trigger.
    expect((await rect(panel)).width).toBeGreaterThan((await rect(trigger)).width);
    await expect.poll(async () => Math.abs((await rect(panel))[edge] - (await rect(trigger))[edge])).toBeLessThan(1);

    await page.keyboard.press('Escape');
    await expect(panel).toHaveCount(0);
  }

  await context.close();
});

test('Section 2: Material disables its motion when reduced motion is requested', async ({ browser }) => {
  for (const { reducedMotion, state, animationName } of MOTION_CASES) {
    const context = await browser.newContext({ colorScheme: 'light', reducedMotion });
    const page = await context.newPage();
    await page.goto(`${UI_ORIGIN}/m36/material-app-motion`);
    await expect(page.getByText(`Animations state: ${state}`, { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Menu', exact: true }).click();
    const panel = page.getByRole('menu');
    await expect(panel).toBeVisible();
    // The panel's `animation` is `none` when Material disables motion; the name is read, no duration is asserted.
    await expect.poll(() => computed(panel, 'animation-name')).toBe(animationName);

    await context.close();
  }
});
