import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Board, CountReader, SelfProvider, Slot, log } from './PropagationPuzzle';

// Every expected array below was predicted before running, then confirmed by running it on React 19.3.

beforeEach(() => {
  log.length = 0;
});

function setup() {
  const user = userEvent.setup();
  render(
    <Board>
      <Slot />
    </Board>,
  );
  const click = (name: 'count' | 'other') => user.click(screen.getByRole('button', { name }));
  return { click };
}

test('1) mount: everything renders once, in tree order', () => {
  setup();
  expect(log).toEqual([
    'Board count=0 other=0',
    'Plain',
    'MemoStatic',
    'MemoCount 0',
    'MemoSettings dark',
    'Slot',
  ]);
});

test('2) click "count": the primitive context changed', async () => {
  const { click } = setup();
  log.length = 0;
  await click('count');
  expect(log).toEqual(['Board count=1 other=0', 'Plain', 'MemoCount 1', 'MemoSettings dark']);
  expect(screen.getByText('Count: 1')).toBeInTheDocument();
});

test('3) click "other": count is unchanged, but the settings object is new', async () => {
  const { click } = setup();
  log.length = 0;
  await click('other');
  expect(log).toEqual(['Board count=0 other=1', 'Plain', 'MemoSettings dark']);
});

test('4) a consumer with no provider above it reads the createContext default', () => {
  render(<CountReader />);
  expect(log).toEqual(['CountReader -1']);
  expect(screen.getByText('Reader sees -1')).toBeInTheDocument();
});

test('5) a component does not see the provider it renders itself', () => {
  render(<SelfProvider />);
  expect(log).toEqual(['SelfProvider -1', 'CountReader 42']);
});
