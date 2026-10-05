import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setupServer } from 'msw/node';
import { API_ORIGIN } from './contract';
import { createApiClient } from './http';
import { ProjectsPage } from './ProjectsPage';
import { projectsApi } from './projectsApi';
import { createSession } from './session';
import { problem, springApiHandlers } from './testServer';
import { http } from 'msw';

const server = setupServer(...springApiHandlers());

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
beforeEach(() => server.use(...springApiHandlers()));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const api = projectsApi(createApiClient({ baseUrl: API_ORIGIN, auth: createSession(API_ORIGIN) }));

function renderPage(size: number) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  return render(
    <QueryClientProvider client={client}>
      <ProjectsPage api={api} size={size} />
    </QueryClientProvider>,
  );
}

test('shows the first page and the totals from the Spring page object', async () => {
  renderPage(5);

  expect(screen.getByRole('status')).toHaveTextContent('Loading projects…');
  expect(await screen.findByText('Project 01')).toBeInTheDocument();
  expect(within(screen.getByRole('list')).getAllByRole('listitem')).toHaveLength(5);
  expect(screen.getByText('Page 1 of 5 (25 projects)')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
});

test('Next goes to the last page, which is shorter, and disables itself', async () => {
  const user = userEvent.setup();
  renderPage(20);
  await screen.findByText('Project 01');

  await user.click(screen.getByRole('button', { name: 'Next' }));

  expect(await screen.findByText('Project 25')).toBeInTheDocument();
  expect(within(screen.getByRole('list')).getAllByRole('listitem')).toHaveLength(5);
  expect(screen.getByText('Page 2 of 2 (25 projects)')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
});

test('a problem+json failure shows its status and title', async () => {
  server.use(http.get(`${API_ORIGIN}/api/projects`, () => problem(500, { title: 'Internal Server Error', status: 500 })));
  renderPage(5);

  expect(await screen.findByRole('alert')).toHaveTextContent('500 Internal Server Error');
});
