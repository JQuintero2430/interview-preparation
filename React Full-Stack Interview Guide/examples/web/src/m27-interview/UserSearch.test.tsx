import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserSearchFixed } from './UserSearchFixed';
import { UserSearchFlawed } from './UserSearchFlawed';
import type { User } from './types';

// A hand-controlled fake backend: each search() call returns a promise the test resolves itself,
// so the ORDER of responses is decided by the test (never by timing).
type Deferred = { resolve: (users: User[]) => void; reject: (error: Error) => void; signal?: AbortSignal };
let calls: Map<string, Deferred>;

function fakeSearch(query: string, signal?: AbortSignal): Promise<User[]> {
  return new Promise<User[]>((resolve, reject) => {
    calls.set(query, { resolve, reject, signal });
  });
}

function call(query: string): Deferred {
  const found = calls.get(query);
  if (!found) throw new Error(`search("${query}") was never called`);
  return found;
}

const ALICE: User = { id: 1, name: 'Alice' };
const ANN: User = { id: 2, name: 'Ann' };
const ABBY: User = { id: 3, name: 'Abby' };

beforeEach(() => {
  calls = new Map();
});

describe('UserSearchFixed (the reviewed version)', () => {
  test('has an accessible name, and does not search for an empty query', () => {
    render(<UserSearchFixed search={fakeSearch} onSelect={() => {}} />);
    expect(screen.getByLabelText('Search users')).toBeInTheDocument();
    expect(calls.size).toBe(0);
  });

  test('shows results, a status message and real buttons', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<UserSearchFixed search={fakeSearch} onSelect={onSelect} />);

    await user.type(screen.getByLabelText('Search users'), 'a');
    expect(screen.getByRole('status')).toHaveTextContent('Searching…');

    await act(async () => {
      call('a').resolve([ALICE, ANN]);
    });
    expect(screen.getByRole('status')).toHaveTextContent('2 results');

    await user.click(screen.getByRole('button', { name: 'Ann' }));
    expect(onSelect).toHaveBeenCalledWith(ANN);
  });

  test('the latest query wins even when responses arrive out of order, and the old request is aborted', async () => {
    const user = userEvent.setup();
    render(<UserSearchFixed search={fakeSearch} onSelect={() => {}} />);
    await user.type(screen.getByLabelText('Search users'), 'ab');

    expect(call('a').signal?.aborted).toBe(true);
    expect(call('ab').signal?.aborted).toBe(false);

    await act(async () => {
      call('ab').resolve([ABBY]);
      call('a').resolve([ALICE, ANN]); // the stale answer arrives last
    });

    expect(screen.getByRole('button', { name: 'Abby' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Alice' })).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('1 result');
  });

  test('keeps showing "Searching…" while the latest query is pending, even if a stale one resolves', async () => {
    const user = userEvent.setup();
    render(<UserSearchFixed search={fakeSearch} onSelect={() => {}} />);
    await user.type(screen.getByLabelText('Search users'), 'ab');

    await act(async () => {
      call('a').resolve([ALICE]);
    });
    expect(screen.getByRole('status')).toHaveTextContent('Searching…');
    expect(screen.queryByRole('button', { name: 'Alice' })).not.toBeInTheDocument();
  });

  test('shows an error in an alert instead of failing silently', async () => {
    const user = userEvent.setup();
    render(<UserSearchFixed search={fakeSearch} onSelect={() => {}} />);
    await user.type(screen.getByLabelText('Search users'), 'a');

    await act(async () => {
      call('a').reject(new Error('503 Service Unavailable'));
    });
    expect(screen.getByRole('alert')).toHaveTextContent('Could not load users: 503 Service Unavailable');
  });

  test('clearing the input hides old results and sends no request', async () => {
    const user = userEvent.setup();
    render(<UserSearchFixed search={fakeSearch} onSelect={() => {}} />);
    const input = screen.getByLabelText('Search users');
    await user.type(input, 'a');
    await act(async () => {
      call('a').resolve([ALICE]);
    });
    await user.clear(input);

    expect(screen.queryByRole('button', { name: 'Alice' })).not.toBeInTheDocument();
    expect(calls.has('')).toBe(false);
  });
});

// The tests below PASS BY ASSERTING THE BUGGY BEHAVIOUR of the flawed component. They document the flaws;
// if someone "fixes" UserSearchFlawed, they should fail.
describe('UserSearchFlawed (documents the bugs)', () => {
  test('BUG: a stale response overwrites the newest one (last response wins, not last request)', async () => {
    const user = userEvent.setup();
    render(<UserSearchFlawed search={fakeSearch} onSelect={() => {}} />);
    await user.type(screen.getByPlaceholderText('Search users'), 'ab');

    await act(async () => {
      call('ab').resolve([ABBY]);
      call('a').resolve([ALICE, ANN]); // arrives last, so it wins
    });

    expect(screen.getByPlaceholderText('Search users')).toHaveValue('ab');
    expect(screen.getByText('Alice')).toBeInTheDocument(); // results for "a" under a query of "ab"
    expect(screen.queryByText('Abby')).not.toBeInTheDocument();
  });

  test('BUG: the loading indicator disappears when a stale request finishes, although the latest is pending', async () => {
    const user = userEvent.setup();
    render(<UserSearchFlawed search={fakeSearch} onSelect={() => {}} />);
    await user.type(screen.getByPlaceholderText('Search users'), 'ab');
    expect(screen.getByText('Searching…')).toBeInTheDocument();

    await act(async () => {
      call('a').resolve([ALICE]);
    });
    expect(screen.queryByText('Searching…')).not.toBeInTheDocument(); // "ab" is still in flight
  });

  test('BUG: clearing the input still sends a request for the empty string', async () => {
    const user = userEvent.setup();
    render(<UserSearchFlawed search={fakeSearch} onSelect={() => {}} />);
    const input = screen.getByPlaceholderText('Search users');
    await user.type(input, 'a');
    await user.clear(input);
    expect(calls.has('')).toBe(true);
  });

  test('BUG: no accessible name and results are not buttons', async () => {
    const user = userEvent.setup();
    render(<UserSearchFlawed search={fakeSearch} onSelect={() => {}} />);
    expect(screen.queryByLabelText('Search users')).not.toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('Search users'), 'a');
    await act(async () => {
      call('a').resolve([ALICE]);
    });
    expect(screen.queryByRole('button', { name: 'Alice' })).not.toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });
});
