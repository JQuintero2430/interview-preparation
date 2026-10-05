import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransitionSearch } from './SearchTransition';

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

/** A fake search API whose responses the test releases by hand, in any order. */
function controlledSearch() {
  const pending = new Map<string, ReturnType<typeof deferred<string[]>>>();
  const search = vi.fn((query: string) => {
    const d = deferred<string[]>();
    pending.set(query, d);
    return d.promise;
  });
  async function respond(query: string, results: string[]) {
    const d = pending.get(query);
    if (!d) throw new Error(`no pending request for "${query}"`);
    await act(async () => d.resolve(results));
  }
  return { search, respond };
}

const items = () => within(screen.getByRole('list', { name: 'Results' })).queryAllByRole('listitem');

test('the input is urgent, the results are not: the old list stays until the new one arrives', async () => {
  const { search, respond } = controlledSearch();
  const user = userEvent.setup();
  render(<TransitionSearch search={search} />);
  const input = screen.getByLabelText('Search');

  await user.type(input, 'a');
  expect(input).toHaveValue('a'); // urgent update, already committed
  expect(screen.getByRole('status')).toHaveTextContent('Searching…'); // isPending
  expect(items()).toHaveLength(0);

  await respond('a', ['apple', 'avocado']);
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  expect(items().map((li) => li.textContent)).toEqual(['apple', 'avocado']);

  await user.type(input, 'p');
  expect(input).toHaveValue('ap');
  expect(screen.getByRole('status')).toBeInTheDocument();
  // still the OLD results: the transition has not committed
  expect(items().map((li) => li.textContent)).toEqual(['apple', 'avocado']);

  await respond('ap', ['apple']);
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  expect(items().map((li) => li.textContent)).toEqual(['apple']);
});

test('an older response that arrives last is ignored', async () => {
  const { search, respond } = controlledSearch();
  const user = userEvent.setup();
  render(<TransitionSearch search={search} />);

  await user.type(screen.getByLabelText('Search'), 'ab'); // two requests in flight: "a" and "ab"
  expect(search).toHaveBeenCalledTimes(2);

  await respond('ab', ['ab result']);
  expect(screen.getByRole('status')).toBeInTheDocument(); // "a" is still outstanding, so still pending

  await respond('a', ['a result (stale)']);
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  expect(items().map((li) => li.textContent)).toEqual(['ab result']);
});
