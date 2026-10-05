import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import type { MockInstance } from 'vitest';
import { makePuzzleStore, ReduxPuzzle } from './ReduxRenderPuzzle';
import { log } from './renderLog';
import { resetPuzzleStore, ZustandPuzzle } from './ZustandRenderPuzzle';

// PREDICTIONS written before running. The coordinator runs this file and corrects any line that differs.

let warn: MockInstance<typeof console.warn>;

beforeEach(() => {
  log.length = 0;
  resetPuzzleStore();
  // react-redux's dev-mode stabilityCheck warns about the NewObject selector; capture it instead of printing.
  warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => vi.restoreAllMocks());

function setupRedux() {
  const user = userEvent.setup();
  render(
    <Provider store={makePuzzleStore()}>
      <ReduxPuzzle />
    </Provider>,
  );
  const click = (name: 'inc a' | 'inc b') => user.click(screen.getByRole('button', { name }));
  return { click };
}

function setupZustand() {
  const user = userEvent.setup();
  render(<ZustandPuzzle />);
  const click = (name: 'inc a' | 'inc b') => user.click(screen.getByRole('button', { name }));
  return { click };
}

describe('react-redux useSelector', () => {
  test('1) mount: every reader renders once, in tree order; one dev warning, for NewObject', () => {
    setupRedux();
    expect(log).toEqual(['Primitive 0', 'NewObject 0', 'Memoized 0', 'Shallow 0', 'WholeSlice 0']);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0]?.[0])).toContain('returned a different result when called with the same parameters');
  });

  test('2) "inc b": only the readers whose selected value changed by ===', async () => {
    const { click } = setupRedux();
    log.length = 0;
    await click('inc b');
    expect(log).toEqual(['NewObject 0', 'WholeSlice 0']);
  });

  test('3) "inc a": every reader re-renders', async () => {
    const { click } = setupRedux();
    log.length = 0;
    await click('inc a');
    expect(log).toEqual(['Primitive 1', 'NewObject 1', 'Memoized 1', 'Shallow 1', 'WholeSlice 1']);
  });
});

describe('Zustand 5', () => {
  test('1) mount', () => {
    setupZustand();
    expect(log).toEqual(['ZWhole a=0 b=0', 'ZSlice 0', 'ZShallow 0', 'ZActions']);
  });

  test('2) "inc b": only the whole-store reader', async () => {
    const { click } = setupZustand();
    log.length = 0;
    await click('inc b');
    expect(log).toEqual(['ZWhole a=0 b=1']);
  });

  test('3) "inc a": every reader of a, never the actions-only component', async () => {
    const { click } = setupZustand();
    log.length = 0;
    await click('inc a');
    expect(log).toEqual(['ZWhole a=1 b=0', 'ZSlice 1', 'ZShallow 1']);
  });
});
