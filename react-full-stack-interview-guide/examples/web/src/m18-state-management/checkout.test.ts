import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { itemAdded } from './cartSlice';
import { placeOrder } from './checkout';
import { API, KEYBOARD } from './products';
import { makeStore } from './store';

let mode: 'ok' | 'fail' = 'ok';
let lastBody: unknown = null;

const server = setupServer(
  http.post(`${API}/orders`, async ({ request }) => {
    lastBody = await request.json();
    if (mode === 'fail') return new HttpResponse(null, { status: 500 });
    return HttpResponse.json({ orderId: 'o-1', total: 9998 });
  }),
);

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
beforeEach(() => {
  mode = 'ok';
  lastBody = null;
});
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function storeWithTwoKeyboards() {
  const store = makeStore();
  store.dispatch(itemAdded(KEYBOARD));
  store.dispatch(itemAdded(KEYBOARD));
  return store;
}

test('pending is dispatched synchronously, then fulfilled empties the cart', async () => {
  const store = storeWithTwoKeyboards();

  const promise = store.dispatch(placeOrder());
  expect(store.getState().checkout.status).toBe('pending');

  const action = await promise;
  expect(placeOrder.fulfilled.match(action)).toBe(true);
  expect(store.getState().checkout).toEqual({ status: 'succeeded', orderId: 'o-1', error: null });
  expect(store.getState().cart.lines).toEqual([]);
  expect(lastBody).toEqual({ lines: [{ id: 'kb', quantity: 2 }] });
});

test('a 500 becomes a rejected action carrying the rejectWithValue message; the cart is kept', async () => {
  mode = 'fail';
  const store = storeWithTwoKeyboards();

  const action = await store.dispatch(placeOrder());
  expect(placeOrder.rejected.match(action)).toBe(true);
  expect(store.getState().checkout).toEqual({ status: 'failed', orderId: null, error: 'Checkout failed (HTTP 500)' });
  expect(store.getState().cart.lines).toHaveLength(1);
});

test('unwrap() turns the result back into a promise that throws the reject value', async () => {
  mode = 'fail';
  const store = storeWithTwoKeyboards();
  await expect(store.dispatch(placeOrder()).unwrap()).rejects.toBe('Checkout failed (HTTP 500)');
});

test('condition: an empty cart never sends a request and dispatches nothing', async () => {
  const store = makeStore();
  const action = await store.dispatch(placeOrder());

  expect(action.meta).toMatchObject({ condition: true });
  expect(store.getState().checkout.status).toBe('idle');
  expect(lastBody).toBeNull();
});
