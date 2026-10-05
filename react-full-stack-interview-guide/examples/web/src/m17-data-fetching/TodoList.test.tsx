import { screen } from '@testing-library/react';
import { delay, http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { API, type Todo } from './api';
import { renderWithClient } from './testUtils';
import { TodoList } from './TodoList';

let response: Todo[] | 'fail' = [];

const server = setupServer(
  http.get(`${API}/todos`, async () => {
    await delay(20);
    if (response === 'fail') return new HttpResponse(null, { status: 500 });
    return HttpResponse.json(response);
  }),
);

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('loading, then the list', async () => {
  response = [{ id: '1', title: 'Write tests', done: false }];
  renderWithClient(<TodoList />);

  expect(screen.getByRole('status')).toHaveTextContent('Loading todos…');
  expect(await screen.findByText('Write tests')).toBeInTheDocument();
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});

test('an empty array is the empty state, not an empty <ul>', async () => {
  response = [];
  renderWithClient(<TodoList />);

  expect(await screen.findByText('Nothing to do yet.')).toBeInTheDocument();
  expect(screen.queryByRole('list')).not.toBeInTheDocument();
});

test('a 500 becomes the error state', async () => {
  response = 'fail';
  renderWithClient(<TodoList />);

  expect(await screen.findByRole('alert')).toHaveTextContent('Could not load todos: HTTP 500');
});
