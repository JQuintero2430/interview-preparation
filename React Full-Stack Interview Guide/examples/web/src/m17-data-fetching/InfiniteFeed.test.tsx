import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { delay, http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { API, type FeedPage } from './api';
import { InfiniteFeed } from './InfiniteFeed';
import { renderWithClient } from './testUtils';

const PAGE_SIZE = 3;
const TOTAL_POSTS = 9;
const requestedCursors: number[] = [];

const server = setupServer(
  http.get(`${API}/feed`, async ({ request }) => {
    const cursor = Number(new URL(request.url).searchParams.get('cursor'));
    requestedCursors.push(cursor);
    await delay(80);
    const next = cursor + PAGE_SIZE;
    const body: FeedPage = {
      posts: [1, 2, 3].map((i) => ({ id: cursor + i, title: `Post ${cursor + i}` })),
      nextCursor: next < TOTAL_POSTS ? next : null,
    };
    return HttpResponse.json(body);
  }),
);

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
beforeEach(() => {
  requestedCursors.length = 0;
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('loads the first page only', async () => {
  renderWithClient(<InfiniteFeed />);

  expect(screen.getByRole('status')).toHaveTextContent('Loading feed…');
  expect(await screen.findByText('Post 3')).toBeInTheDocument();
  expect(screen.queryByText('Post 4')).not.toBeInTheDocument();
  expect(requestedCursors).toEqual([0]);
});

test('"Load more" appends pages until the cursor runs out', async () => {
  const user = userEvent.setup();
  renderWithClient(<InfiniteFeed />);
  await screen.findByText('Post 3');

  await user.click(screen.getByRole('button', { name: 'Load more' }));
  expect(await screen.findByRole('button', { name: 'Loading more…' })).toBeDisabled();
  expect(await screen.findByText('Post 6')).toBeInTheDocument();
  expect(screen.getByText('Post 1')).toBeInTheDocument(); // appended, not replaced

  await user.click(screen.getByRole('button', { name: 'Load more' }));
  expect(await screen.findByText('Post 9')).toBeInTheDocument();
  expect(screen.getByText('No more posts')).toBeInTheDocument();
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
  expect(screen.getAllByRole('listitem')).toHaveLength(9);
  expect(requestedCursors).toEqual([0, 3, 6]);
});
