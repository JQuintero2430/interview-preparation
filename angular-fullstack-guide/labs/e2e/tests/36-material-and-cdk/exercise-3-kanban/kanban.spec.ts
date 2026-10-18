import { expect, test, type Browser, type Locator, type Page } from '@playwright/test';
import { dragBy, liveText, UI_ORIGIN } from '../support/ui.js';

// Exercise 36.3: the same five criteria run over variant a (cdkDropListGroup) and variant b (cdkDropListConnectedTo with ids).
// The viewport is tall enough that every list is on screen: the mouse moves in viewport coordinates.
// Every keyboard test asserts the visible result of a key (position, focus, announcement) before it presses the next one:
// the board renders on the next application render, and a second key pressed earlier would act on the old board.
const VIEWPORT = { width: 1000, height: 1200 };

type Variant = 'a' | 'b';

interface Board {
  readonly page: Page;
  readonly todo: Locator;
  readonly doing: Locator;
  readonly done: Locator;
}

async function open(browser: Browser, variant: Variant): Promise<Board> {
  const context = await browser.newContext({ colorScheme: 'light', reducedMotion: 'no-preference', viewport: VIEWPORT });
  const page = await context.newPage();
  await page.goto(`${UI_ORIGIN}/m36/ex3/${variant}`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(`Exercise 36.3: a kanban board, variant ${variant}`);
  const cards = (list: string): Locator => page.getByRole('list', { name: list, exact: true }).getByRole('listitem');
  const board = { page, todo: cards('To do'), doing: cards('In progress'), done: cards('Done') };
  await expect(board.todo).toHaveText(['Design', 'Build', 'Test']);
  await expect(board.doing).toHaveText(['Review']);
  await expect(board.done).toHaveText(['Ship']);
  return board;
}

function card(list: Locator, title: string): Locator {
  return list.filter({ hasText: title });
}

for (const variant of ['a', 'b'] as const) {
  test.describe(`variant ${variant}`, () => {
    test('reorders a card within a column by dragging', async ({ browser }) => {
      const board = await open(browser, variant);

      await dragBy(board.page, card(board.todo, 'Design'), card(board.todo, 'Test'));

      // The drop handler gave the store the new index; the store copied the arrays and set the board.
      await expect(board.todo).toHaveText(['Build', 'Test', 'Design']);
      await expect(board.doing).toHaveText(['Review']);
      await expect(board.done).toHaveText(['Ship']);
      await board.page.context().close();
    });

    test('moves a card to another column by dragging', async ({ browser }) => {
      const board = await open(browser, variant);

      await dragBy(board.page, card(board.todo, 'Design'), card(board.doing, 'Review'));

      await expect(board.todo).toHaveText(['Build', 'Test']);
      await expect(board.doing).toHaveCount(2);
      await expect(card(board.doing, 'Design')).toHaveCount(1);
      await expect(card(board.doing, 'Review')).toHaveCount(1);
      await expect(board.done).toHaveText(['Ship']);
      await board.page.context().close();
    });

    test('moves the focused card to the next column with the keyboard', async ({ browser }) => {
      const board = await open(browser, variant);

      // Alt+ArrowRight on the focused card.
      await card(board.todo, 'Design').focus();
      await expect(card(board.todo, 'Design')).toBeFocused();
      await board.page.keyboard.press('Alt+ArrowRight');
      await expect(board.todo).toHaveText(['Build', 'Test']);
      await expect(card(board.doing, 'Design')).toHaveCount(1);

      // The "Move right" button, reached by focus and activated with Enter.
      const button = board.page.getByRole('button', { name: 'Move Design right', exact: true });
      await button.focus();
      await expect(button).toBeFocused();
      await board.page.keyboard.press('Enter');
      await expect(card(board.done, 'Design')).toHaveCount(1);
      await expect(board.doing).toHaveText(['Review']);
      await board.page.context().close();
    });

    test("announces the card's new column and position", async ({ browser }) => {
      const board = await open(browser, variant);

      await card(board.todo, 'Build').focus();
      await expect(card(board.todo, 'Build')).toBeFocused();
      await board.page.keyboard.press('Alt+ArrowRight');
      await expect(card(board.doing, 'Build')).toHaveCount(1);
      // The announcer writes after a delay: poll, never wait a fixed time.
      await expect.poll(() => liveText(board.page)).toContain('Build moved to In progress, position 2 of 2');

      // The moved card gets focus back; only then is the next key pressed.
      await expect(card(board.doing, 'Build')).toBeFocused();
      await board.page.keyboard.press('Alt+ArrowUp');
      await expect(board.doing).toHaveText(['Build', 'Review']);
      await expect.poll(() => liveText(board.page)).toContain('Build moved to In progress, position 1 of 2');
      await board.page.context().close();
    });

    test('keeps focus on the moved card after a keyboard move', async ({ browser }) => {
      const board = await open(browser, variant);

      // Across columns: the card is destroyed in one list and created in the other.
      await card(board.todo, 'Design').focus();
      await expect(card(board.todo, 'Design')).toBeFocused();
      await board.page.keyboard.press('Alt+ArrowRight');
      await expect(board.doing).toHaveText(['Design', 'Review']);
      await expect(card(board.doing, 'Design')).toBeFocused();

      // Within a column: the same element is moved in the list.
      await board.page.keyboard.press('Alt+ArrowDown');
      await expect(board.doing).toHaveText(['Review', 'Design']);
      await expect(card(board.doing, 'Design')).toBeFocused();

      // From a button: the focused button is destroyed with the old card, and the card still gets the focus.
      const button = board.page.getByRole('button', { name: 'Move Design right', exact: true });
      await button.focus();
      await expect(button).toBeFocused();
      await board.page.keyboard.press('Enter');
      await expect(card(board.done, 'Design')).toHaveCount(1);
      await expect(card(board.done, 'Design')).toBeFocused();
      await board.page.context().close();
    });
  });
}
