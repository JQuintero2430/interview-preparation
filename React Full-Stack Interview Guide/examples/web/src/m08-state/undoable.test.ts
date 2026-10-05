import { initHistory, undoable, type History, type HistoryAction } from './undoable';

type CounterAction = 'inc' | 'noop';
const counter = (n: number, action: CounterAction) => (action === 'inc' ? n + 1 : n);
const reducer = undoable(counter, 3);

const run = (actions: HistoryAction<CounterAction>[], start: History<number> = initHistory(0)) =>
  actions.reduce(reducer, start);

const inc: HistoryAction<CounterAction> = { type: 'apply', action: 'inc' };

test('apply records the previous present in the past', () => {
  expect(run([inc, inc])).toEqual({ past: [0, 1], present: 2, future: [] });
});

test('undo and redo move snapshots between past, present and future', () => {
  const undone = run([inc, inc, { type: 'undo' }, { type: 'undo' }]);
  expect(undone).toEqual({ past: [], present: 0, future: [1, 2] });
  expect(reducer(undone, { type: 'redo' })).toEqual({ past: [0], present: 1, future: [2] });
});

test('a new change after undo clears the redo stack', () => {
  expect(run([inc, inc, { type: 'undo' }, inc])).toEqual({ past: [0, 1], present: 2, future: [] });
});

test('nothing to undo, nothing to redo, or a no-op change returns the same history object', () => {
  const start = initHistory(0);
  expect(reducer(start, { type: 'undo' })).toBe(start);
  expect(reducer(start, { type: 'redo' })).toBe(start);
  expect(reducer(start, { type: 'apply', action: 'noop' })).toBe(start);
});

test('the past is capped at the limit, dropping the oldest snapshot', () => {
  expect(run([inc, inc, inc, inc])).toEqual({ past: [1, 2, 3], present: 4, future: [] });
});
