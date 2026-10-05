import { todosReducer, type Todo } from './todosReducer';

const start: Todo[] = [
  { id: 1, text: 'Write tests', done: false },
  { id: 3, text: 'Ship', done: true },
];

test('added appends an undone to-do with the next id', () => {
  expect(todosReducer(start, { type: 'added', text: 'Review' })).toEqual([
    ...start,
    { id: 4, text: 'Review', done: false },
  ]);
  expect(todosReducer([], { type: 'added', text: 'First' })).toEqual([{ id: 1, text: 'First', done: false }]);
});

test('toggled flips one to-do and keeps the others by reference', () => {
  const next = todosReducer(start, { type: 'toggled', id: 1 });
  expect(next[0]).toEqual({ id: 1, text: 'Write tests', done: true });
  expect(next[1]).toBe(start[1]);
  expect(start[0]?.done).toBe(false); // the input was not mutated
});

test('deleted removes by id', () => {
  expect(todosReducer(start, { type: 'deleted', id: 3 })).toEqual([start[0]]);
});
