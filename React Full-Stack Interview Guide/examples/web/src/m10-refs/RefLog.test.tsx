import { StrictMode } from 'react';
import { render } from '@testing-library/react';
import { RefLog, log } from './RefLog';

beforeEach(() => {
  log.length = 0;
});

test('mount: refs attach in tree order, before layout effects, before passive effects', () => {
  render(<RefLog version={1} />);
  expect(log).toEqual([
    'stable attach stable',
    'inline attach 1',
    'legacy attach',
    'layout effect 1',
    'effect 1',
  ]);
});

test('re-render: only the inline ref (new identity) is cleaned up and re-attached', () => {
  const { rerender } = render(<RefLog version={1} />);
  log.length = 0;
  rerender(<RefLog version={2} />);
  expect(log).toEqual(['inline cleanup 1', 'inline attach 2', 'layout effect 2', 'effect 2']);
});

test('unmount: cleanups run for refs that returned one; the legacy ref gets null', () => {
  const { unmount } = render(<RefLog version={1} />);
  log.length = 0;
  unmount();
  expect(log).toEqual(['stable cleanup stable', 'inline cleanup 1', 'legacy null']);
});

test('Strict Mode (dev, React 19): refs are attached, detached and attached again on mount', () => {
  render(
    <StrictMode>
      <RefLog version={1} />
    </StrictMode>,
  );
  expect(log).toEqual([
    'stable attach stable',
    'inline attach 1',
    'legacy attach',
    'layout effect 1',
    'effect 1',
    'stable cleanup stable',
    'inline cleanup 1',
    'legacy null',
    'stable attach stable',
    'inline attach 1',
    'legacy attach',
    'layout effect 1',
    'effect 1',
  ]);
});
