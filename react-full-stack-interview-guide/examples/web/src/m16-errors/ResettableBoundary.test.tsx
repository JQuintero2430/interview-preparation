import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { messageOf } from './Bomb';
import { ResettableBoundary } from './ResettableBoundary';

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

type Api = { down: boolean };

function Profile({ userId, api }: { userId: string; api: Api }) {
  if (api.down) throw new Error(`Cannot load ${userId}`);
  return <h2>Profile {userId}</h2>;
}

function Panel(props: { userId: string; api: Api; onError?: () => void; onReset?: () => void }) {
  return (
    <ResettableBoundary
      resetKeys={[props.userId]}
      onError={props.onError}
      onReset={props.onReset}
      fallbackRender={({ error, reset }) => (
        <div role="alert">
          <p>{messageOf(error)}</p>
          <button type="button" onClick={reset}>
            Try again
          </button>
        </div>
      )}
    >
      <Profile userId={props.userId} api={props.api} />
    </ResettableBoundary>
  );
}

test('shows the fallback with the error message and reports the error once', () => {
  const onError = vi.fn();
  render(<Panel userId="a" api={{ down: true }} onError={onError} />);
  expect(screen.getByRole('alert')).toHaveTextContent('Cannot load a');
  expect(onError).toHaveBeenCalledTimes(1);
});

test('"Try again" re-renders the children once the cause is fixed', async () => {
  const user = userEvent.setup();
  const api = { down: true };
  const onReset = vi.fn();
  render(<Panel userId="a" api={api} onReset={onReset} />);

  api.down = false; // the service recovered
  await user.click(screen.getByRole('button', { name: 'Try again' }));

  expect(screen.getByRole('heading', { name: 'Profile a' })).toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(onReset).toHaveBeenCalledTimes(1);
});

test('"Try again" while the cause persists just shows the fallback again', async () => {
  const user = userEvent.setup();
  const onError = vi.fn();
  render(<Panel userId="a" api={{ down: true }} onError={onError} />);

  await user.click(screen.getByRole('button', { name: 'Try again' }));

  expect(screen.getByRole('alert')).toHaveTextContent('Cannot load a');
  expect(onError).toHaveBeenCalledTimes(2);
});

test('changing a reset key (another user) resets the boundary without a click', () => {
  const api = { down: true };
  const onReset = vi.fn();
  const { rerender } = render(<Panel userId="a" api={api} onReset={onReset} />);

  api.down = false;
  rerender(<Panel userId="b" api={api} onReset={onReset} />);

  expect(screen.getByRole('heading', { name: 'Profile b' })).toBeInTheDocument();
  expect(onReset).toHaveBeenCalledTimes(1);
});

test('unchanged keys keep the fallback across re-renders, even if the cause went away', () => {
  const api = { down: true };
  const { rerender } = render(<Panel userId="a" api={api} />);

  api.down = false;
  rerender(<Panel userId="a" api={api} />);

  expect(screen.getByRole('alert')).toBeInTheDocument();
  expect(screen.queryByRole('heading')).not.toBeInTheDocument();
});
