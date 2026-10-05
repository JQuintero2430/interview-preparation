import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BatchingPuzzle } from './BatchingPuzzle';

function setup() {
  const commits: string[] = [];
  const logs: string[] = [];
  render(<BatchingPuzzle onCommit={(phase) => commits.push(phase)} onLog={(m) => logs.push(m)} />);
  commits.length = 0; // ignore the mount commit
  const user = userEvent.setup();
  const click = (name: string) => user.click(screen.getByRole('button', { name }));
  return { commits, logs, click };
}

test('setCount(count + 1) three times: every call reads the same snapshot', async () => {
  const { commits, click } = setup();
  await click('value ×3');
  expect(screen.getByText('Count: 1')).toBeInTheDocument();
  expect(commits).toEqual(['update']);
});

test('a second click sees the new snapshot', async () => {
  const { commits, click } = setup();
  await click('value ×3');
  await click('value ×3');
  expect(screen.getByText('Count: 2')).toBeInTheDocument();
  expect(commits).toEqual(['update', 'update']);
});

test('setCount(c => c + 1) three times: updaters are queued and chained', async () => {
  const { commits, click } = setup();
  await click('updater ×3');
  expect(screen.getByText('Count: 3')).toBeInTheDocument();
  expect(commits).toEqual(['update']);
});

test('setCount(count + 5) then setCount(c => c + 1)', async () => {
  const { click } = setup();
  await click('value then updater');
  expect(screen.getByText('Count: 6')).toBeInTheDocument();
});

test('setCount(c => c + 1) then setCount(count + 5): the replacement wins', async () => {
  const { click } = setup();
  await click('updater then value');
  expect(screen.getByText('Count: 5')).toBeInTheDocument();
});

test('reading state right after setting it logs the old snapshot', async () => {
  const { logs, click } = setup();
  await click('log after set');
  expect(logs).toEqual(['count is 0']);
  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});

test('two updates after an await are still batched into one commit (React 18+ with createRoot)', async () => {
  const { commits, click } = setup();
  await click('after await');
  expect(await screen.findByText('Count: 1')).toBeInTheDocument();
  expect(screen.getByText('Flag: true')).toBeInTheDocument();
  expect(commits).toEqual(['update']);
});

test('flushSync opts out of batching: two commits for two updates', async () => {
  const { commits, click } = setup();
  await click('flushSync');
  expect(screen.getByText('Count: 1')).toBeInTheDocument();
  expect(screen.getByText('Flag: true')).toBeInTheDocument();
  expect(commits).toEqual(['update', 'update']);
});
