import { expect, test, type Page } from '@playwright/test';

// Q30.04: a button whose label changes to "Saved" 500 ms after a click.
const SAVE_BUTTON = `<button>Save</button>
<script>
  document.querySelector('button').addEventListener('click', (event) => {
    setTimeout(() => { event.target.textContent = 'Saved'; }, 500);
  });
</script>`;

test('Q30.04 a web-first assertion waits for "Saved" while textContent right after the click returns "Save"', async ({
  page,
}) => {
  await page.setContent(SAVE_BUTTON);
  const button = page.getByRole('button');

  await button.click();
  const readOnce = await button.textContent();
  const waitedFrom = Date.now();
  await expect(button).toHaveText('Saved');
  const waitedMs = Date.now() - waitedFrom;

  expect(readOnce).toBe('Save');
  expect(waitedMs).toBeGreaterThanOrEqual(300);
  expect(await button.textContent()).toBe('Saved');
});

// Q30.06: two rows, each with a "Delete" button.
const TWO_ROWS = `<ul>
  <li>Milk <button>Delete</button></li>
  <li>Bread <button>Delete</button></li>
</ul>
<script>
  document.querySelectorAll('li button').forEach((button) => {
    button.addEventListener('click', () => button.closest('li').remove());
  });
</script>`;

test('Q30.06 a bare Delete locator throws a strict mode violation and a row-scoped one deletes only Milk', async ({
  page,
}) => {
  await page.setContent(TWO_ROWS);

  const failure = await page
    .getByRole('button', { name: 'Delete' })
    .click()
    .then(
      () => undefined,
      (error: Error) => error,
    );

  expect(failure?.message.split('\n')[0]).toBe(
    "locator.click: Error: strict mode violation: getByRole('button', { name: 'Delete' }) resolved to 2 elements:",
  );
  await expect(page.getByRole('listitem')).toHaveCount(2);

  await page
    .getByRole('listitem')
    .filter({ hasText: 'Milk' })
    .getByRole('button', { name: 'Delete' })
    .click();

  await expect(page.getByRole('listitem')).toHaveCount(1);
  await expect(page.getByRole('listitem')).toHaveText('Bread Delete');
});

// Q30.09: two handlers on one API URL; the page is itself routed, so no network is used.
const ORIGIN = 'http://q30-09.test';

async function answerFromHandlers(page: Page, laterFallsBack: boolean): Promise<{ body: string; order: string[] }> {
  const order: string[] = [];
  await page.route(`${ORIGIN}/`, (route) => route.fulfill({ contentType: 'text/html', body: '<p>page</p>' }));
  await page.route(`${ORIGIN}/api/value`, (route) => {
    order.push('A');
    return route.fulfill({ body: 'A' });
  });
  await page.route(`${ORIGIN}/api/value`, (route) => {
    order.push('B');
    return laterFallsBack ? route.fallback() : route.fulfill({ body: 'B' });
  });
  await page.goto(`${ORIGIN}/`);
  const body = await page.evaluate(async () => (await fetch('/api/value')).text());
  return { body, order };
}

test('Q30.09 the later handler answers first, and route.fallback hands the request to the earlier one', async ({
  page,
}) => {
  expect(await answerFromHandlers(page, false)).toEqual({ body: 'B', order: ['B'] });

  const second = await page.context().newPage();
  expect(await answerFromHandlers(second, true)).toEqual({ body: 'A', order: ['B', 'A'] });
});
