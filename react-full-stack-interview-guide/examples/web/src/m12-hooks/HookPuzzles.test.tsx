import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import type { MockInstance } from 'vitest';
import { Counter, ExtraHook, SwappedHook } from './HookPuzzles';

// React logs caught render errors and hook-order warnings with console.error; capture them.
let consoleError: MockInstance<typeof console.error>;
beforeEach(() => {
  consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

const warnedAboutHookOrder = () =>
  consoleError.mock.calls.some(([format]) => String(format).includes('change in the order of Hooks'));

function Boundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallbackRender={({ error }) => (
        <p role="alert">{error instanceof Error ? error.message : String(error)}</p>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

test('1. two components using the same custom hook do not share state', async () => {
  const user = userEvent.setup();
  render(
    <>
      <Counter label="A" />
      <Counter label="B" />
    </>,
  );
  await user.click(screen.getByRole('button', { name: 'A: 0' }));
  await user.click(screen.getByRole('button', { name: 'A: 1' }));
  await user.click(screen.getByRole('button', { name: 'B: 0' }));

  expect(screen.getByRole('button', { name: /^A:/ })).toHaveTextContent('A: 2');
  expect(screen.getByRole('button', { name: /^B:/ })).toHaveTextContent('B: 1');
});

test('2. a hook that starts running conditionally: more hooks than last time', () => {
  const { rerender } = render(
    <Boundary>
      <ExtraHook withExtra={false} />
    </Boundary>,
  );
  expect(screen.getByText('count: 0')).toBeInTheDocument();

  rerender(
    <Boundary>
      <ExtraHook withExtra />
    </Boundary>,
  );
  expect(screen.getByRole('alert')).toHaveTextContent(
    'Rendered more hooks than during the previous render.',
  );
  expect(warnedAboutHookOrder()).toBe(true);
});

test('3. a hook that stops running conditionally: fewer hooks than expected', () => {
  const { rerender } = render(
    <Boundary>
      <ExtraHook withExtra />
    </Boundary>,
  );
  rerender(
    <Boundary>
      <ExtraHook withExtra={false} />
    </Boundary>,
  );
  expect(screen.getByRole('alert')).toHaveTextContent(
    'Rendered fewer hooks than expected. This may be caused by an accidental early return statement.',
  );
  expect(warnedAboutHookOrder()).toBe(false);
});

test('4. same hook count, different call sites: no error, the wrong state', () => {
  const { rerender } = render(
    <Boundary>
      <SwappedHook first />
    </Boundary>,
  );
  expect(screen.getByText('label: first')).toBeInTheDocument();

  rerender(
    <Boundary>
      <SwappedHook first={false} />
    </Boundary>,
  );
  expect(screen.getByText('label: first')).toBeInTheDocument(); // not 'second'
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(warnedAboutHookOrder()).toBe(false);
});
