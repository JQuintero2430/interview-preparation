import { render, screen, waitFor } from '@testing-library/react';
import { delay, http, HttpResponse } from 'msw';
import { UserProfile } from './UserProfile';
import { createWrapper } from './test-utils/render';
import { ada, server, USER_URL } from './test-utils/server';

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const ADA = { name: 'Ada Lovelace' } as const;
const renderAda = () => render(<UserProfile userId="1" />, { wrapper: createWrapper() });

test('1. right after render: getBy throws, queryBy returns null, the loading status is there', () => {
  renderAda();

  expect(() => screen.getByRole('heading', ADA)).toThrow();
  expect(screen.queryByRole('heading', ADA)).toBeNull();
  expect(screen.getByRole('status')).toHaveTextContent('Loading user…');
});

test('2. findBy resolves once the data arrives; the loading status is gone by then', async () => {
  renderAda();

  expect(await screen.findByRole('heading', ADA)).toBeInTheDocument();
  expect(screen.queryByRole('status')).toBeNull();
});

test('3. findBy rejects if the element shows up after its timeout', async () => {
  server.use(
    http.get(USER_URL, async () => {
      await delay(300);
      return HttpResponse.json(ada);
    }),
  );
  renderAda();

  await expect(screen.findByRole('heading', ADA, { timeout: 100 })).rejects.toThrow();
  // The default timeout is 1000 ms, so a second findBy still catches it.
  expect(await screen.findByRole('heading', ADA)).toBeInTheDocument();
});

test('4. waitFor only retries when the callback THROWS: returning false resolves at once', async () => {
  renderAda();

  const result = await waitFor(() => screen.queryByRole('heading', ADA) !== null);
  expect(result).toBe(false);

  await screen.findByRole('heading', ADA); // let the request settle before the test ends
});

test('5. multiple matches: getBy and queryBy both throw; getAllBy returns the list', async () => {
  render(
    <>
      <UserProfile userId="1" />
      <UserProfile userId="2" />
    </>,
    { wrapper: createWrapper() },
  );
  await screen.findByRole('heading', ADA);
  await screen.findByRole('heading', { name: 'Alan Turing' });

  expect(() => screen.getByRole('heading')).toThrow(/multiple elements/);
  expect(() => screen.queryByRole('heading')).toThrow(/multiple elements/);
  expect(screen.getAllByRole('heading')).toHaveLength(2);
  expect(screen.queryAllByRole('heading', { name: 'Grace Hopper' })).toEqual([]);
});
