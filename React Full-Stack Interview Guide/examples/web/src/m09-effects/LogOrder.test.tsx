import { StrictMode } from 'react';
import { render } from '@testing-library/react';
import { Parent, log } from './LogOrder';

beforeEach(() => {
  log.length = 0;
});

test('mount: render top-down, then layout setups child-first, then passive setups child-first', () => {
  render(<Parent value={1} />);
  expect(log).toEqual([
    'Parent render 1',
    'Child render 1',
    'Child layout setup 1',
    'Parent layout setup 1',
    'Child effect setup 1',
    'Parent effect setup 1',
  ]);
});

test('update: each effect kind runs all cleanups (old values) before its setups', () => {
  const { rerender } = render(<Parent value={1} />);
  log.length = 0;
  rerender(<Parent value={2} />);
  expect(log).toEqual([
    'Parent render 2',
    'Child render 2',
    'Child layout cleanup 1',
    'Parent layout cleanup 1',
    'Child layout setup 2',
    'Parent layout setup 2',
    'Child effect cleanup 1',
    'Parent effect cleanup 1',
    'Child effect setup 2',
    'Parent effect setup 2',
  ]);
});

test('unmount: cleanups run parent-first (top-down), layout before passive', () => {
  const { unmount } = render(<Parent value={1} />);
  log.length = 0;
  unmount();
  expect(log).toEqual([
    'Parent layout cleanup 1',
    'Child layout cleanup 1',
    'Parent effect cleanup 1',
    'Child effect cleanup 1',
  ]);
});

test('Strict Mode (dev): double render, then mount, simulated unmount, remount', () => {
  render(
    <StrictMode>
      <Parent value={1} />
    </StrictMode>,
  );
  expect(log).toEqual([
    'Parent render 1',
    'Parent render 1',
    'Child render 1',
    'Child render 1',
    'Child layout setup 1',
    'Parent layout setup 1',
    'Child effect setup 1',
    'Parent effect setup 1',
    'Parent layout cleanup 1',
    'Child layout cleanup 1',
    'Parent effect cleanup 1',
    'Child effect cleanup 1',
    'Child layout setup 1',
    'Parent layout setup 1',
    'Child effect setup 1',
    'Parent effect setup 1',
  ]);
});
