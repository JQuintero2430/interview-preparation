import { screen } from '@testing-library/react';
import { delay, http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { API, KEYBOARD, MOUSE, type Product } from './products';
import { ProductList } from './ProductList';
import { renderWithStore } from './testUtils';

let products: Product[] | 'fail' = [];
let getCount = 0;

const server = setupServer(
  http.get(`${API}/products`, async () => {
    getCount += 1;
    await delay(20);
    if (products === 'fail') return new HttpResponse(null, { status: 500 });
    return HttpResponse.json(products);
  }),
  http.patch(`${API}/products/:id`, async ({ params, request }) => {
    const { price } = (await request.json()) as { price: number };
    if (products === 'fail') return new HttpResponse(null, { status: 500 });
    products = products.map((p) => (p.id === params.id ? { ...p, price } : p));
    return HttpResponse.json(products.find((p) => p.id === params.id));
  }),
);

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
beforeEach(() => {
  products = [KEYBOARD, MOUSE];
  getCount = 0;
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test('loading, then the list', async () => {
  renderWithStore(<ProductList />);
  expect(screen.getByRole('status')).toHaveTextContent('Loading products…');
  expect(await screen.findByText('Keyboard — $49.99')).toBeInTheDocument();
  expect(screen.getByText('Mouse — $19.99')).toBeInTheDocument();
});

test('a 500 shows the error state', async () => {
  products = 'fail';
  renderWithStore(<ProductList />);
  expect(await screen.findByRole('alert')).toHaveTextContent('Could not load products.');
});

test('server state and client state meet in one store', async () => {
  const { store, user } = renderWithStore(<ProductList />);
  await user.click(await screen.findByRole('button', { name: 'Add Mouse to cart' }));
  expect(store.getState().cart.lines).toEqual([{ ...MOUSE, quantity: 1 }]);
});

test('a mutation invalidates the "Product" tag and the list refetches by itself', async () => {
  const { user } = renderWithStore(<ProductList />);
  await user.click(await screen.findByRole('button', { name: 'Discount Keyboard' }));

  expect(await screen.findByText('Keyboard — $44.99')).toBeInTheDocument();
  expect(getCount).toBe(2); // the initial load + one refetch after invalidation
});

test('two components using the same query share one request and one cache entry', async () => {
  renderWithStore(
    <>
      <ProductList />
      <ProductList />
    </>,
  );
  expect(await screen.findAllByText('Keyboard — $49.99')).toHaveLength(2);
  expect(getCount).toBe(1);
});
