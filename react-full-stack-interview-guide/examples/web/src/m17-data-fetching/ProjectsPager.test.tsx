import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { delay, http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { API, type ProjectPage } from './api';
import { ProjectsPager } from './ProjectsPager';
import { renderWithClient } from './testUtils';

const PAGE_SIZE = 3;
const LAST_PAGE = 2;
const requestedPages: number[] = [];

const server = setupServer(
  http.get(`${API}/projects`, async ({ request }) => {
    const page = Number(new URL(request.url).searchParams.get('page'));
    requestedPages.push(page);
    await delay(100);
    const first = (page - 1) * PAGE_SIZE + 1;
    const body: ProjectPage = {
      page,
      hasMore: page < LAST_PAGE,
      items: [0, 1, 2].map((i) => ({ id: first + i, name: `Project ${first + i}` })),
    };
    return HttpResponse.json(body);
  }),
);

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
beforeEach(() => {
  requestedPages.length = 0;
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('first load shows a loading state, then page 1', async () => {
  renderWithClient(<ProjectsPager />);

  expect(screen.getByRole('status')).toHaveTextContent('Loading projects…');
  expect(await screen.findByText('Project 1')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();
});

test('Next keeps page 1 on screen while page 2 loads, then swaps it in', async () => {
  const user = userEvent.setup();
  renderWithClient(<ProjectsPager />);
  await screen.findByText('Project 1');

  await user.click(screen.getByRole('button', { name: 'Next' }));

  // Placeholder phase: the page number already says 2, the rows are still page 1.
  expect(screen.getByText('Page 2')).toBeInTheDocument();
  expect(screen.getByText('Project 1')).toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('Loading page 2…');
  expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();

  expect(await screen.findByText('Project 4')).toBeInTheDocument();
  expect(screen.queryByText('Project 1')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled(); // last page
});

test('Previous is served from the cache: page 1 is requested only once', async () => {
  const user = userEvent.setup();
  renderWithClient(<ProjectsPager />);
  await screen.findByText('Project 1');

  await user.click(screen.getByRole('button', { name: 'Next' }));
  await screen.findByText('Project 4');
  await user.click(screen.getByRole('button', { name: 'Previous' }));

  expect(await screen.findByText('Project 1')).toBeInTheDocument();
  expect(requestedPages).toEqual([1, 2]);
});
