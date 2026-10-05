import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Bomb } from './Bomb';
import { ErrorBoundary } from './ErrorBoundary';
import { createErrorReporter, type ErrorReport } from './errorReporter';
import { renderOutsideAct } from './renderOutsideAct';

let sent: ErrorReport[];
let reporter: ReturnType<typeof createErrorReporter>;
let uninstall: () => void;

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  sent = [];
  reporter = createErrorReporter((report) => sent.push(report));
  uninstall = reporter.install();
});
afterEach(() => {
  uninstall();
  vi.restoreAllMocks();
});

// jsdom has no PromiseRejectionEvent constructor; an Event with a `reason` is what listeners read.
function rejectionEvent(reason: unknown) {
  return Object.assign(new Event('unhandledrejection'), { reason });
}

test('caught render errors arrive through onCaughtError, with the component stack', () => {
  render(
    <ErrorBoundary fallback={<p>Oops</p>}>
      <Bomb message="caught boom" />
    </ErrorBoundary>,
    { onCaughtError: reporter.rootOptions.onCaughtError },
  );
  expect(sent).toEqual([{ source: 'caught', message: 'caught boom', componentStack: expect.stringContaining('Bomb') }]);
});

test('uncaught render errors arrive through onUncaughtError', () => {
  const { unmount } = renderOutsideAct(<Bomb message="uncaught boom" />, reporter.rootOptions);
  try {
    expect(sent).toEqual([
      { source: 'uncaught', message: 'uncaught boom', componentStack: expect.stringContaining('Bomb') },
    ]);
  } finally {
    unmount();
  }
});

test('event handler errors arrive through the window "error" listener', async () => {
  const user = userEvent.setup();
  render(
    <button
      type="button"
      onClick={() => {
        throw new Error('click boom');
      }}
    >
      Pay
    </button>,
  );
  await user.click(screen.getByRole('button', { name: 'Pay' }));
  expect(sent).toEqual([{ source: 'window-error', message: 'click boom' }]);
});

test('unhandled promise rejections arrive through "unhandledrejection", whatever the reason type', () => {
  window.dispatchEvent(rejectionEvent(new Error('lost promise')));
  window.dispatchEvent(rejectionEvent('plain string reason'));
  expect(sent).toEqual([
    { source: 'unhandled-rejection', message: 'lost promise' },
    { source: 'unhandled-rejection', message: 'plain string reason' },
  ]);
});

test('recoverable errors keep the original error as `cause`', () => {
  const original = new Error('flaky');
  reporter.rootOptions.onRecoverableError(new Error('React recovered', { cause: original }), {});
  expect(sent).toEqual([{ source: 'recoverable', message: 'React recovered', cause: 'flaky' }]);
});

test('the same Error object is reported once, even if it arrives by two paths', () => {
  const error = new Error('twice');
  reporter.rootOptions.onCaughtError(error, { componentStack: '' });
  window.dispatchEvent(new ErrorEvent('error', { error, message: error.message }));
  expect(sent).toEqual([{ source: 'caught', message: 'twice' }]);
});

test('uninstall removes the window listeners', () => {
  uninstall();
  window.dispatchEvent(rejectionEvent(new Error('after uninstall')));
  expect(sent).toEqual([]);
  uninstall = () => {}; // already removed; keep afterEach harmless
});

test('a transport that throws never breaks the app', () => {
  const broken = createErrorReporter(() => {
    throw new Error('network down');
  });
  expect(() => broken.report('caught', new Error('original'))).not.toThrow();
});
