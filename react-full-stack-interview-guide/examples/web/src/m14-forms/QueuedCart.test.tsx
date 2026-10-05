import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { fakeServer } from './api';
import { QueuedCart, log } from './QueuedCart';

beforeEach(() => {
  fakeServer.reset();
  fakeServer.hold(); // every response waits for resolveNext()
  log.length = 0;
});

const quantity = () => screen.getByLabelText('Quantity');
const addButton = () => screen.getByRole('button', { name: 'Add to cart' });

test('two quick submits: the second Action is queued and receives the first one\'s result', async () => {
  const user = userEvent.setup();
  render(<QueuedCart />);
  expect(log).toEqual(['screen: count=0 pending=false input=1']);

  // Step 1: type 5, then click "Add to cart" twice before the server answers.
  await user.clear(quantity());
  await user.type(quantity(), '5');
  await user.click(addButton());
  await user.click(addButton());
  expect(log).toEqual([
    'screen: count=0 pending=false input=1',
    'action start: previous=0 quantity=5',
    'screen: count=0 pending=true input=5',
  ]);
  expect(fakeServer.pending()).toEqual(['add 5']); // only ONE request in flight

  // Step 2: the first response arrives.
  await act(async () => fakeServer.resolveNext());
  expect(log.slice(3)).toEqual([
    'action end: returns 5',
    'action start: previous=5 quantity=5',
  ]);
  expect(fakeServer.pending()).toEqual(['add 5']);

  // Step 3: the second response arrives.
  await act(async () => fakeServer.resolveNext());
  expect(log.slice(5)).toEqual(['action end: returns 10', 'screen: count=10 pending=false input=1']);
  expect(screen.getByText('In cart: 10')).toBeInTheDocument();
});

test('typing while an Action is pending is wiped by the automatic reset', async () => {
  const user = userEvent.setup();
  render(<QueuedCart />);

  await user.clear(quantity());
  await user.type(quantity(), '5');
  await user.click(addButton());

  // The user changes their mind while the request is in flight.
  await user.clear(quantity());
  await user.type(quantity(), '7');

  await act(async () => fakeServer.resolveNext());
  expect(log).toEqual([
    'screen: count=0 pending=false input=1',
    'action start: previous=0 quantity=5',
    'screen: count=0 pending=true input=5',
    'action end: returns 5',
    'screen: count=5 pending=false input=1',
  ]);
  expect(quantity()).toHaveValue('1');
});
