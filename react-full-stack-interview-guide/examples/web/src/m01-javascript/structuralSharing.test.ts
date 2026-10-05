import { setCity, toggleTodo, type AppState } from './structuralSharing';

const initial: AppState = {
  user: { name: 'Ada', address: { city: 'London' } },
  todos: [
    { id: 1, done: false },
    { id: 2, done: false },
  ],
};

test('setCity copies the spine and shares everything else', () => {
  const next = setCity(initial, 'Paris');
  expect(next).not.toBe(initial);
  expect(next.user).not.toBe(initial.user);
  expect(next.user.address).not.toBe(initial.user.address);
  expect(next.todos).toBe(initial.todos); // untouched branch: same reference
  expect(initial.user.address.city).toBe('London'); // the old state is intact
});

test('toggleTodo reuses untouched items', () => {
  const next = toggleTodo(initial, 2);
  expect(next.todos).not.toBe(initial.todos);
  expect(next.todos[0]).toBe(initial.todos[0]);
  expect(next.todos[1]).not.toBe(initial.todos[1]);
  expect(next.todos[1]?.done).toBe(true);
  expect(next.user).toBe(initial.user);
});

test('an update that changes nothing still returns a new root here (the cost of naive spreading)', () => {
  const next = toggleTodo(initial, 999);
  expect(next).not.toBe(initial);
  expect(next.todos).not.toBe(initial.todos); // map always allocates a new array
});

test('Object.freeze is shallow', () => {
  const frozen = Object.freeze({ inner: { n: 1 } });
  frozen.inner.n = 2; // allowed: only the top level is frozen
  expect(frozen.inner.n).toBe(2);
  expect(Object.isFrozen(frozen)).toBe(true);
  expect(Object.isFrozen(frozen.inner)).toBe(false);
});
