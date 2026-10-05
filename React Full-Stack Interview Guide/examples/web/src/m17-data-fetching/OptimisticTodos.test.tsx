import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { delay, http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { API, type Todo } from './api';
import { OptimisticTodos } from './OptimisticTodos';
import { renderWithClient } from './testUtils';

const FAILING_TITLE = 'fail';
let serverTodos: Todo[] = [];

const server = setupServer(
  http.get(`${API}/todos`, () => HttpResponse.json(serverTodos)),
  http.post(`${API}/todos`, async ({ request }) => {
    const { title } = (await request.json()) as { title: string };
    await delay(150); // slow enough to observe the optimistic row before the server answers
    if (title === FAILING_TITLE) return new HttpResponse(null, { status: 500 });
    const todo: Todo = { id: String(serverTodos.length + 1), title, done: false };
    serverTodos = [...serverTodos, todo];
    return HttpResponse.json(todo, { status: 201 });
  }),
);

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
beforeEach(() => {
  serverTodos = [{ id: '1', title: 'Write tests', done: false }];
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('the new todo shows immediately, marked as saving, then becomes the saved one', async () => {
  const user = userEvent.setup();
  renderWithClient(<OptimisticTodos />);
  await screen.findByText('Write tests');

  await user.type(screen.getByLabelText('New todo'), 'Buy milk');
  await user.click(screen.getByRole('button', { name: 'Add' }));

  // Before the 150 ms POST has answered:
  expect(await screen.findByText('Buy milk')).toBeInTheDocument();
  expect(screen.getByText('(saving…)')).toBeInTheDocument();

  // After the POST and the invalidation refetch:
  await waitFor(() => expect(screen.queryByText('(saving…)')).not.toBeInTheDocument());
  expect(screen.getByText('Buy milk')).toBeInTheDocument();
  expect(screen.getAllByRole('listitem')).toHaveLength(2);
});

test('a failed POST rolls the list back and explains what failed', async () => {
  const user = userEvent.setup();
  renderWithClient(<OptimisticTodos />);
  await screen.findByText('Write tests');

  await user.type(screen.getByLabelText('New todo'), FAILING_TITLE);
  await user.click(screen.getByRole('button', { name: 'Add' }));

  expect(await screen.findByText(FAILING_TITLE)).toBeInTheDocument(); // optimistic
  expect(await screen.findByRole('alert')).toHaveTextContent('Could not add "fail"');
  expect(screen.queryByText(FAILING_TITLE)).not.toBeInTheDocument(); // rolled back
  expect(screen.getAllByRole('listitem')).toHaveLength(1);
});
