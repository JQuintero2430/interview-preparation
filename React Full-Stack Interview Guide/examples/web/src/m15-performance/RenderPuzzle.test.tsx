import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Parent, Slot, StaleReport, log } from './RenderPuzzle';

// Every expected array below was predicted before running, then confirmed by running it on React 19.3.
// Strict Mode is not on here, so each render is logged once.

beforeEach(() => {
  log.length = 0;
});

function setup() {
  const user = userEvent.setup();
  render(
    <Parent>
      <Slot />
    </Parent>,
  );
  return { user };
}

test('1) mount: every component renders once, in tree order', () => {
  setup();
  expect(log).toEqual([
    'Parent 0',
    'Plain',
    'MemoNoProps',
    'MemoWithStyle inline style',
    'MemoWithStyle hoisted style',
    'MemoWithHandler inline handler',
    'MemoWithHandler stable handler',
    'MemoWithChildren',
    'PureLegacy pure class',
    'Slot',
  ]);
});

test('2) a parent state change: who re-renders?', async () => {
  const { user } = setup();
  log.length = 0;

  await user.click(screen.getByRole('button', { name: 'increment' }));

  expect(log).toEqual([
    'Parent 1',
    'Plain',
    'MemoWithStyle inline style',
    'MemoWithHandler inline handler',
    'MemoWithChildren',
  ]);
});

test('3) a comparator that ignores a function prop keeps a stale closure', async () => {
  const user = userEvent.setup();
  render(<StaleReport />);

  await user.click(screen.getByRole('button', { name: 'add' }));
  await user.click(screen.getByRole('button', { name: 'add' }));
  expect(screen.getByText('count is 2')).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'report' }));
  expect(log).toEqual(['report sees 0']);
});
