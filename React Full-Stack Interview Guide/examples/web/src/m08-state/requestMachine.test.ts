import { requestReducer, type RequestEvent, type RequestState } from './requestMachine';

type S = RequestState<string[]>;
type E = RequestEvent<string[]>;
const run = (events: E[], start: S = { status: 'idle' }) => events.reduce(requestReducer<string[]>, start);

test('the happy path: idle → loading → success, then refresh and reset', () => {
  expect(run([{ type: 'fetch' }])).toEqual({ status: 'loading' });
  expect(run([{ type: 'fetch' }, { type: 'resolve', data: ['a'] }])).toEqual({
    status: 'success',
    data: ['a'],
  });
  expect(run([{ type: 'fetch' }, { type: 'resolve', data: ['a'] }, { type: 'fetch' }])).toEqual({
    status: 'loading',
  });
  expect(run([{ type: 'fetch' }, { type: 'reject', error: 'boom' }, { type: 'reset' }])).toEqual({
    status: 'idle',
  });
});

test('a failure can be retried', () => {
  expect(run([{ type: 'fetch' }, { type: 'reject', error: 'boom' }, { type: 'fetch' }])).toEqual({
    status: 'loading',
  });
});

test('events that are not valid transitions return the same state object', () => {
  const idle: S = { status: 'idle' };
  expect(requestReducer(idle, { type: 'resolve', data: ['late'] })).toBe(idle);

  const success: S = { status: 'success', data: ['a'] };
  expect(requestReducer(success, { type: 'reject', error: 'late' })).toBe(success);

  const loading = run([{ type: 'fetch' }]);
  expect(requestReducer(loading, { type: 'fetch' })).toBe(loading);
});
