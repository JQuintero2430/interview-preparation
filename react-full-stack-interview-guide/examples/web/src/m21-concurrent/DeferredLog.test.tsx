import { act, render, screen } from '@testing-library/react';
import { DeferredEcho, DeferredEchoWithInitial, EchoInTransition, log } from './DeferredLog';

beforeEach(() => {
  log.length = 0;
});

// Predicted before running, then confirmed or corrected by running it on React 19.3.
test('useDeferredValue: an urgent render with the OLD deferred value, then a background render', () => {
  const { rerender } = render(<DeferredEcho text="a" />);
  // Mount: nothing to lag behind, so one render with both values equal.
  expect(log).toEqual(['render text=a deferred=a']);

  log.length = 0;
  rerender(<DeferredEcho text="ab" />);
  expect(log).toEqual([
    'render text=ab deferred=a', // urgent pass: new text, deferred still lags
    'render text=ab deferred=ab', // background pass: deferred catches up
  ]);
  expect(screen.getByText('ab')).toBeInTheDocument();
});

test('with an initialValue the first render shows the initial value, then catches up', () => {
  render(<DeferredEchoWithInitial text="a" />);
  expect(log).toEqual(['render text=a deferred=', 'render text=a deferred=a']);
  expect(screen.getByText('a')).toBeInTheDocument();
});

test('inside a transition the deferred value is NOT deferred: no render with new text and old deferred value', async () => {
  render(<EchoInTransition />);
  log.length = 0;

  await act(async () => screen.getByRole('button', { name: 'Append b' }).click());

  expect(log).toEqual([
    // useTransition's startTransition first commits isPending=true urgently; that render still has the
    // old text (corrected after running: the prediction had only the second entry).
    'render text=a deferred=a',
    'render text=ab deferred=ab', // the transition render: deferred is NOT behind text
  ]);
});
