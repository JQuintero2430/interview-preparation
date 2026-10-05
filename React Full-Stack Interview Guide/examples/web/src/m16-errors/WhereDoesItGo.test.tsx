import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { messageOf } from './Bomb';
import { renderOutsideAct } from './renderOutsideAct';
import { App, Widget, log, rootCallbacks } from './WhereDoesItGo';

// Exercise 4: predict, for each throw site, which boundary shows a fallback (if any),
// and which root callback fires. Testing Library's render accepts onCaughtError
// (but not onUncaughtError, see test 6).
beforeEach(() => {
  log.length = 0;
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

const options = { onCaughtError: rootCallbacks.onCaughtError };

test('1. render error: the NEAREST boundary catches it; onCaughtError runs before componentDidCatch', () => {
  render(<App mode="render" />, options);
  expect(log).toEqual([
    'Widget render',
    'Widget render',
    'onCaughtError: render boom via Inner',
    'Inner componentDidCatch: render boom',
  ]);
  expect(screen.getByRole('alert')).toHaveTextContent('Inner fallback: render boom');
  expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
});

test('2. effect error: also caught by the nearest boundary, after one successful render', () => {
  render(<App mode="effect" />, options);
  expect(log).toEqual([
    'Widget render',
    'onCaughtError: effect boom via Inner',
    'Inner componentDidCatch: effect boom',
  ]);
  expect(screen.getByRole('alert')).toHaveTextContent('Inner fallback: effect boom');
});

test('3. event handler error: no boundary, no root callback; it reaches window "error"', async () => {
  const user = userEvent.setup();
  const onWindowError = (event: ErrorEvent) => {
    event.preventDefault();
    log.push(`window error: ${messageOf(event.error)}`);
  };
  window.addEventListener('error', onWindowError);
  try {
    render(<App mode="event" />, options);
    await user.click(screen.getByRole('button', { name: 'Widget (event)' }));
  } finally {
    window.removeEventListener('error', onWindowError);
  }
  expect(log).toEqual(['Widget render', 'window error: click boom']);
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

test('4. setTimeout error: React never sees it; it escapes to whoever ran the timer', () => {
  // Real timers would hand the throw to Node as an uncaught exception. Fake timers rethrow
  // it from advanceTimersByTime, which is the "nobody caught it" we want to observe.
  vi.useFakeTimers();
  render(<App mode="timeout" />, options);
  expect(() => vi.advanceTimersByTime(100)).toThrow('timeout boom');
  expect(log).toEqual(['Widget render']);
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

test('5. the boundary itself throws: the error goes to the NEXT boundary up (Outer)', () => {
  render(<App mode="render" throwInInnerFallback />, options);
  expect(log).toEqual([
    'Widget render',
    'Widget render',
    'onCaughtError: Inner fallback boom via Outer',
    'Outer componentDidCatch: Inner fallback boom',
  ]);
  expect(screen.getByRole('alert')).toHaveTextContent('Outer fallback: Inner fallback boom');
  expect(screen.queryByRole('heading', { name: 'Dashboard' })).not.toBeInTheDocument();
});

test('6. no boundary at all: onUncaughtError fires and React removes the whole tree', () => {
  const { container, unmount } = renderOutsideAct(<Widget mode="render" />, rootCallbacks);
  try {
    expect(log).toEqual(['Widget render', 'Widget render', 'onUncaughtError: render boom']);
    expect(container).toBeEmptyDOMElement();
  } finally {
    unmount();
  }
});
