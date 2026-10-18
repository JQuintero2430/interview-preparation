import { expect, test, type Browser, type Locator, type Page } from '@playwright/test';
import { liveText, rect, topLayer, UI_ORIGIN } from '../support/ui.js';

// Exercise 36.2: the same five criteria run over variant a (a CDK overlay with an ActiveDescendantKeyManager)
// and variant b (Angular Aria's combobox with a listbox in activedescendant focus mode).
// The tolerance of one pixel absorbs the rounding of fractional layout positions.
const PIXEL = 1;

type Variant = 'a' | 'b';

interface Select {
  readonly page: Page;
  readonly input: Locator;
  readonly listbox: Locator;
  readonly options: Locator;
  readonly selected: Locator;
}

async function open(browser: Browser, variant: Variant): Promise<Select> {
  const context = await browser.newContext({ colorScheme: 'light', reducedMotion: 'no-preference' });
  const page = await context.newPage();
  await page.goto(`${UI_ORIGIN}/m36/ex2/${variant}`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(`Exercise 36.2: a filterable select, variant ${variant}`);
  const listbox = page.getByRole('listbox', { name: 'Countries', exact: true });
  return {
    page,
    input: page.getByRole('combobox', { name: 'Country', exact: true }),
    listbox,
    options: listbox.getByRole('option'),
    selected: page.getByRole('status', { name: 'Selected country', exact: true }),
  };
}

/** Focuses the input and types, one key at a time, as a user would. */
async function type(select: Select, text: string): Promise<void> {
  await select.input.focus();
  await select.input.pressSequentially(text);
}

/** The ids of the rendered options, in order. */
async function optionIds(select: Select): Promise<string[]> {
  const ids = await select.options.evaluateAll((elements) => elements.map((element) => element.id));
  if (ids.some((id) => id === '')) throw new Error('every option needs an id for aria-activedescendant to point at');
  return ids;
}

/**
 * Waits until opening has made the first option active. In variant a the options render as soon as the portal attaches,
 * but the first option becomes active only after the next application render; a key pressed before that starts from no active option.
 */
async function firstOptionActive(select: Select): Promise<void> {
  const [first] = await optionIds(select);
  await expect(select.input).toHaveAttribute('aria-activedescendant', first);
}

for (const variant of ['a', 'b'] as const) {
  test.describe(`variant ${variant}`, () => {
    test('opens the options below the input when the user types', async ({ browser }) => {
      const select = await open(browser, variant);
      await expect(select.input).toHaveAttribute('aria-expanded', 'false');
      await expect(select.listbox).toHaveCount(0);

      await type(select, 'C');
      await expect(select.input).toHaveAttribute('aria-expanded', 'true');
      await expect(select.listbox).toBeVisible();
      await expect(select.options).toHaveText(['Canada', 'Chile', 'Colombia']);
      // The input names the list it controls.
      const listboxId = await select.listbox.getAttribute('id');
      expect(listboxId).toBeTruthy();
      await expect(select.input).toHaveAttribute('aria-controls', listboxId ?? '');

      // The list sits in a CDK overlay pane whose host is a popover in the top layer.
      await expect(select.listbox.locator('xpath=ancestor::*[contains(concat(" ", @class, " "), " cdk-overlay-pane ")]')).toHaveCount(1);
      const popovers = (await topLayer(select.page)).filter((entry) => entry.classes.includes('cdk-overlay-popover'));
      expect(popovers).toHaveLength(1);

      // Below the input, left edges aligned (the first of the standard dropdown positions). The position applies on a later frame.
      await expect
        .poll(async () => {
          const field = await rect(select.input);
          const list = await rect(select.listbox);
          return list.top >= field.bottom - PIXEL && Math.abs(list.left - field.left) <= PIXEL;
        })
        .toBe(true);

      await select.page.context().close();
    });

    test('moves the active option with the arrow keys while focus stays in the input', async ({ browser }) => {
      const select = await open(browser, variant);
      await type(select, 'C');
      await expect(select.options).toHaveCount(3);
      const ids = await optionIds(select);

      // Opening makes the first option active; the input points at it and keeps focus.
      await expect(select.input).toHaveAttribute('aria-activedescendant', ids[0]);
      await select.page.keyboard.press('ArrowDown');
      await expect(select.input).toHaveAttribute('aria-activedescendant', ids[1]);
      await expect(select.options.nth(1)).toHaveAttribute('data-active', 'true');
      await expect(select.options.nth(0)).toHaveAttribute('data-active', 'false');
      await select.page.keyboard.press('ArrowDown');
      await expect(select.input).toHaveAttribute('aria-activedescendant', ids[2]);
      await select.page.keyboard.press('ArrowUp');
      await expect(select.input).toHaveAttribute('aria-activedescendant', ids[1]);
      await expect(select.input).toBeFocused();

      await select.page.context().close();
    });

    test('selects the active option with Enter and closes the list', async ({ browser }) => {
      const select = await open(browser, variant);
      await type(select, 'C');
      await expect(select.options).toHaveCount(3);
      await firstOptionActive(select);
      await select.page.keyboard.press('ArrowDown');
      await expect(select.options.nth(1)).toHaveAttribute('data-active', 'true');

      await select.page.keyboard.press('Enter');
      await expect(select.listbox).toHaveCount(0);
      await expect(select.input).toHaveAttribute('aria-expanded', 'false');
      await expect(select.input).toHaveValue('Chile');
      await expect(select.selected).toHaveText('Chile');
      await expect(select.input).toBeFocused();

      await select.page.context().close();
    });

    test('closes on Escape without changing the value', async ({ browser }) => {
      const select = await open(browser, variant);
      // A committed value first, so there is a value that Escape must leave alone.
      await type(select, 'C');
      await expect(select.options).toHaveCount(3);
      await firstOptionActive(select);
      await select.page.keyboard.press('ArrowDown');
      // Variant b relays each key to the listbox on the next render through one signal; an Enter pressed before that render
      // replaces the pending ArrowDown, so the test waits for the move as a user would see it.
      await expect(select.options.nth(1)).toHaveAttribute('data-active', 'true');
      await select.page.keyboard.press('Enter');
      await expect(select.selected).toHaveText('Chile');

      // The user starts a new search and moves to another option, then presses Escape.
      await select.input.press('ControlOrMeta+a');
      await select.input.pressSequentially('A');
      await expect(select.options).toHaveText(['Argentina', 'Australia', 'Austria']);
      await firstOptionActive(select);
      await select.page.keyboard.press('ArrowDown');
      await expect(select.options.nth(1)).toHaveAttribute('data-active', 'true');

      await select.page.keyboard.press('Escape');
      await expect(select.listbox).toHaveCount(0);
      await expect(select.input).toHaveAttribute('aria-expanded', 'false');
      await expect(select.input).toHaveValue('A');
      await expect(select.selected).toHaveText('Chile');
      await expect(select.input).toBeFocused();

      await select.page.context().close();
    });

    test('announces how many options match the filter', async ({ browser }) => {
      const select = await open(browser, variant);

      // The announcer writes after a delay, so its text is polled; one live element serves the whole page.
      await type(select, 'C');
      await expect(select.options).toHaveCount(3);
      await expect.poll(() => liveText(select.page)).toEqual(['3 countries match']);

      await select.input.pressSequentially('o');
      await expect(select.options).toHaveText(['Colombia']);
      await expect.poll(() => liveText(select.page)).toEqual(['1 country matches']);

      await select.input.pressSequentially('x');
      await expect(select.options).toHaveCount(0);
      await expect.poll(() => liveText(select.page)).toEqual(['No countries match']);

      await select.page.context().close();
    });
  });
}
