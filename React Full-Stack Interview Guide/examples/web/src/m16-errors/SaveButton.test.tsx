import { act, type ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary as LibraryBoundary, getErrorMessage } from 'react-error-boundary';
import { ErrorBoundary } from './ErrorBoundary';
import { SavePlain, SaveWithLibrary, SaveWithTransition } from './SaveButton';

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

const failingSave = () => Promise.reject(new Error('503 Service Unavailable'));
const okSave = () => Promise.resolve();

function renderInLibraryBoundary(ui: ReactNode) {
  return render(
    <LibraryBoundary
      fallbackRender={({ error }) => <p role="alert">Could not save: {getErrorMessage(error)}</p>}
    >
      {ui}
    </LibraryBoundary>,
  );
}

test('useErrorBoundary().showBoundary sends a rejected promise to the boundary', async () => {
  const user = userEvent.setup();
  renderInLibraryBoundary(<SaveWithLibrary save={failingSave} />);

  await user.click(screen.getByRole('button', { name: 'Save' }));

  expect(await screen.findByRole('alert')).toHaveTextContent('Could not save: 503 Service Unavailable');
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});

test('showBoundary is not called on success', async () => {
  const user = userEvent.setup();
  renderInLibraryBoundary(<SaveWithLibrary save={okSave} />);

  await user.click(screen.getByRole('button', { name: 'Save' }));

  expect(await screen.findByRole('button', { name: 'Saved' })).toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

test('plain React: setState(() => { throw error }) reaches a hand-written boundary', async () => {
  const user = userEvent.setup();
  render(
    <ErrorBoundary fallback={<p role="alert">Could not save</p>}>
      <SavePlain save={failingSave} />
    </ErrorBoundary>,
  );

  await user.click(screen.getByRole('button', { name: 'Save' }));

  expect(await screen.findByRole('alert')).toHaveTextContent('Could not save');
});

test('React 19: a rejection inside startTransition reaches the boundary after the pending state', async () => {
  const user = userEvent.setup();
  let rejectSave: (error: Error) => void = () => {};
  const pendingSave = () =>
    new Promise<void>((_, reject) => {
      rejectSave = reject;
    });
  renderInLibraryBoundary(<SaveWithTransition save={pendingSave} />);

  await user.click(screen.getByRole('button', { name: 'Save' }));
  expect(await screen.findByRole('button', { name: 'Saving…' })).toBeDisabled();

  await act(async () => rejectSave(new Error('timeout')));

  expect(await screen.findByRole('alert')).toHaveTextContent('Could not save: timeout');
});
