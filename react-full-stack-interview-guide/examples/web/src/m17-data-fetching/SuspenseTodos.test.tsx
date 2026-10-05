import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { delay, http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { API } from './api';
import { SuspenseTodos } from './SuspenseTodos';
import { renderWithClient } from './testUtils';

let failuresLeft = 0;

const server = setupServer(
  http.get(`${API}/todos`, async () => {
    await delay(20);
    if (failuresLeft > 0) {
      failuresLeft -= 1;
      return new HttpResponse(null, { status: 503 });
    }
    return HttpResponse.json([{ id: '1', title: 'Read the Suspense docs', done: false }]);
  }),
);

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
beforeEach(() => {
  failuresLeft = 0;
});
afterEach(() => {
  server.resetHandlers();
  vi.restoreAllMocks();
});
afterAll(() => server.close());

test('the Suspense fallback shows, then the data', async () => {
  renderWithClient(<SuspenseTodos />);

  expect(screen.getByRole('status')).toHaveTextContent('Loading todos…');
  expect(await screen.findByText('Read the Suspense docs')).toBeInTheDocument();
});

test('an error reaches the boundary, and "Try again" refetches', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {}); // React logs errors caught by boundaries
  failuresLeft = 1;
  const user = userEvent.setup();
  renderWithClient(<SuspenseTodos />);

  expect(await screen.findByRole('alert')).toHaveTextContent('Could not load todos: HTTP 503');

  await user.click(screen.getByRole('button', { name: 'Try again' }));
  expect(await screen.findByText('Read the Suspense docs')).toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});
