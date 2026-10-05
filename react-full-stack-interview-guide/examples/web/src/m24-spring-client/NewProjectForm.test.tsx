import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import { API_ORIGIN } from './contract';
import { createApiClient } from './http';
import { NewProjectForm } from './NewProjectForm';
import { projectsApi } from './projectsApi';
import { createSession } from './session';
import { springApiHandlers } from './testServer';

const server = setupServer(...springApiHandlers());

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
beforeEach(() => server.use(...springApiHandlers()));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const api = projectsApi(createApiClient({ baseUrl: API_ORIGIN, auth: createSession(API_ORIGIN) }));

function renderForm() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false }, queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <NewProjectForm api={api} />
    </QueryClientProvider>,
  );
}

test('a 400 problem puts the server message on the name field, then a valid retry clears it', async () => {
  const user = userEvent.setup();
  renderForm();
  const input = screen.getByLabelText('Name');

  await user.type(input, '   ');
  await user.click(screen.getByRole('button', { name: 'Create' }));

  expect(await screen.findByRole('alert')).toHaveTextContent('must not be blank');
  expect(input).toHaveAttribute('aria-invalid', 'true');
  expect(input).toHaveAccessibleDescription('must not be blank');

  await user.clear(input);
  await user.type(input, 'Alpha');
  await user.click(screen.getByRole('button', { name: 'Create' }));

  expect(await screen.findByRole('status')).toHaveTextContent(`Created Alpha at ${API_ORIGIN}/api/projects/26`);
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(input).toHaveValue('');
});
