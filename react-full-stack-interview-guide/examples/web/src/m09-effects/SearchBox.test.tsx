import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { delay, http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { SearchBox } from './SearchBox';
import { SEARCH_URL } from './useSearch';

// The response for "r" is SLOW and the one for "re" is FAST, so without cleanup
// the stale "r" response would arrive last and overwrite the correct results.
const server = setupServer(
  http.get(SEARCH_URL, async ({ request }) => {
    const q = new URL(request.url).searchParams.get('q') ?? '';
    if (q === 'boom') return new HttpResponse(null, { status: 500 });
    await delay(q === 'r' ? 150 : 10);
    return HttpResponse.json(q === 'zzz' ? [] : [`${q}-result`]);
  }),
);

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('shows the idle hint before typing', () => {
  render(<SearchBox />);
  expect(screen.getByText('Type to search')).toBeInTheDocument();
});

test('a slow stale response never overwrites the latest results', async () => {
  render(<SearchBox />);
  await userEvent.type(screen.getByLabelText('Search'), 're');

  expect(await screen.findByText('re-result')).toBeInTheDocument();
  await new Promise((r) => setTimeout(r, 200)); // give the stale "r" response time to (not) land
  expect(screen.queryByText('r-result')).not.toBeInTheDocument();
  expect(screen.getByText('re-result')).toBeInTheDocument();
});

test('renders the empty and error states', async () => {
  render(<SearchBox />);
  const input = screen.getByLabelText('Search');

  await userEvent.type(input, 'zzz');
  expect(await screen.findByText('No results')).toBeInTheDocument();

  await userEvent.clear(input);
  await userEvent.type(input, 'boom');
  expect(await screen.findByRole('alert')).toHaveTextContent('Search failed: HTTP 500');
});
