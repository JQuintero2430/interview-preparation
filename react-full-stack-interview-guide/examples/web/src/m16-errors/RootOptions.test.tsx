import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { render, screen } from '@testing-library/react';
import type { MockInstance } from 'vitest';
import { Bomb, messageOf } from './Bomb';
import { ErrorBoundary } from './ErrorBoundary';
import { renderOutsideAct } from './renderOutsideAct';

// 16.5: what each React 19 root error option receives, and what React does by default.
let consoleError: MockInstance<typeof console.error>;
beforeEach(() => {
  consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

// Throws on the first render of each id only. A plain function (not component code) keeps
// the side effect out of the component, where the React Compiler lint rules would flag it.
const failedIds = new Set<string>();
function failOnce(id: string) {
  if (failedIds.has(id)) return;
  failedIds.add(id);
  throw new Error(`flaky ${id}`);
}

function FlakyOnce({ id }: { id: string }) {
  failOnce(id);
  return <p>Recovered {id}</p>;
}

test('onCaughtError replaces the default console.error report and names the boundary instance', () => {
  const onCaughtError = vi.fn();
  render(
    <ErrorBoundary fallback={<p role="alert">Oops</p>}>
      <Bomb message="caught" />
    </ErrorBoundary>,
    { onCaughtError },
  );
  expect(screen.getByRole('alert')).toBeInTheDocument();
  expect(onCaughtError).toHaveBeenCalledTimes(1);
  const [error, info] = onCaughtError.mock.calls[0] ?? [];
  expect(messageOf(error)).toBe('caught');
  expect(info.componentStack).toContain('Bomb');
  expect(info.errorBoundary).toBeInstanceOf(ErrorBoundary);
  expect(consoleError).not.toHaveBeenCalled();
});

test('onRecoverableError: an error that disappears on React’s automatic retry is reported, not shown', () => {
  const onRecoverableError = vi.fn();
  render(<FlakyOnce id="a" />, { onRecoverableError });
  expect(screen.getByText('Recovered a')).toBeInTheDocument();
  expect(onRecoverableError).toHaveBeenCalledTimes(1);
  const [error] = onRecoverableError.mock.calls[0] ?? [];
  expect(error).toBeInstanceOf(Error);
  expect(messageOf(error)).toBe(
    'There was an error during concurrent rendering but React was able to recover by instead synchronously rendering the entire root.',
  );
  expect(messageOf((error as Error).cause)).toBe('flaky a');
});

test('inside act(), an uncaught render error is rethrown by act and onUncaughtError is skipped', () => {
  const container = document.createElement('div');
  document.body.append(container);
  const onUncaughtError = vi.fn();
  const root = createRoot(container, { onUncaughtError });

  expect(() => act(() => root.render(<Bomb message="uncaught in act" />))).toThrow('uncaught in act');
  expect(onUncaughtError).not.toHaveBeenCalled();
  expect(container).toBeEmptyDOMElement();

  act(() => root.unmount());
  container.remove();
});

test('outside act(): onUncaughtError gets the error and a component stack; the root is emptied', () => {
  const onUncaughtError = vi.fn();
  const { container, unmount } = renderOutsideAct(
    <section>
      <h1>App</h1>
      <Bomb message="uncaught" />
    </section>,
    { onUncaughtError },
  );
  try {
    expect(onUncaughtError).toHaveBeenCalledTimes(1);
    const [error, info] = onUncaughtError.mock.calls[0] ?? [];
    expect(messageOf(error)).toBe('uncaught');
    expect(info.componentStack).toContain('Bomb');
    expect(container).toBeEmptyDOMElement();
  } finally {
    unmount();
  }
});

test('default onUncaughtError (dev): the error goes to window "error", plus a console.warn hint', () => {
  const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  const seen: string[] = [];
  const onWindowError = (event: ErrorEvent) => {
    event.preventDefault();
    seen.push(messageOf(event.error));
  };
  window.addEventListener('error', onWindowError);
  const { unmount } = renderOutsideAct(<Bomb message="nobody caught me" />);
  try {
    expect(seen).toEqual(['nobody caught me']);
    expect(consoleWarn).toHaveBeenCalledWith(
      '%s\n\n%s\n',
      'An error occurred in the <Bomb> component.',
      'Consider adding an error boundary to your tree to customize error handling behavior.\nVisit https://react.dev/link/error-boundaries to learn more about error boundaries.',
    );
  } finally {
    unmount();
    window.removeEventListener('error', onWindowError);
  }
});
