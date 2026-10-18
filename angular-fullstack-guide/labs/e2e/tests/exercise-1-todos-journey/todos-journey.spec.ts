import { DEFAULT_SEED, expect, test, type Backend } from './fixtures.js';
import { TodosPage } from './todos-page.js';

interface Journey {
  todos: TodosPage;
  backend: Backend;
}

const criteria: ReadonlyArray<readonly [string, (journey: Journey) => Promise<void>]> = [
  [
    'lists the todos the server returns',
    async ({ todos }) => {
      await todos.goto();

      expect(await todos.titles()).toEqual(DEFAULT_SEED);
    },
  ],
  [
    'adds a todo and shows it in the list',
    async ({ todos }) => {
      await todos.goto();
      await todos.add('Book the venue');

      await expect(todos.row('Book the venue')).toBeVisible();
      expect(await todos.titles()).toEqual([...DEFAULT_SEED, 'Book the venue']);
    },
  ],
  [
    'shows a validation message for an empty title and sends nothing',
    async ({ todos, backend }) => {
      await todos.goto();
      await todos.titles();
      const before = await backend.requests();

      await todos.submitEmpty();

      await expect(todos.validation).toHaveText('Title is required');
      expect(await backend.requests()).toEqual(before);
    },
  ],
  [
    'filters the list by the q query parameter',
    async ({ todos }) => {
      await todos.goto('milk');

      expect(await todos.titles()).toEqual(['Buy milk']);
    },
  ],
  [
    'deletes one todo by its title',
    async ({ todos }) => {
      await todos.goto();
      await todos.deleteRow('Walk the dog');

      await expect(todos.row('Walk the dog')).toHaveCount(0);
      await todos.goto();
      expect(await todos.titles()).toEqual(['Buy milk', 'Write the plan']);
    },
  ],
  [
    'starts each test from its own seeded data',
    async ({ todos }) => {
      await todos.goto();

      expect(await todos.titles()).toEqual(DEFAULT_SEED);
    },
  ],
];

test.describe('E30.1 todos journey (page object constructed in the test)', () => {
  test.beforeEach(async ({ backend }) => {
    await backend.seed();
  });

  for (const [title, run] of criteria) {
    test(title, async ({ page, backend }) => {
      await run({ todos: new TodosPage(page), backend });
    });
  }
});

test.describe('E30.1 todos journey (page object delivered by the fixture)', () => {
  for (const [title, run] of criteria) {
    test(title, async ({ todos, backend }) => {
      await run({ todos, backend });
    });
  }
});
