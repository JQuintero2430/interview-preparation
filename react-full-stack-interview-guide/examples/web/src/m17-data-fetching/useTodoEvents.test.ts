import { renderHook } from '@testing-library/react';
import type { Todo } from './api';
import { todosQuery } from './queries';
import { createTestQueryClient, createWrapper } from './testUtils';
import { useTodoEvents, type ConnectFn, type LiveMessage, type MessageSource } from './useTodoEvents';

const SSE_URL = 'https://api.example.test/events';
const listKey = todosQuery().queryKey;

// jsdom has no EventSource, so the test hands the hook a fake stream it can push messages into.
function createFakeSource() {
  const source: MessageSource = { onmessage: null, close: vi.fn() };
  const emit = (message: LiveMessage) =>
    source.onmessage?.(new MessageEvent('message', { data: JSON.stringify(message) }));
  return { source, emit };
}

function setup() {
  const client = createTestQueryClient();
  const initial: Todo[] = [
    { id: '1', title: 'Write tests', done: false },
    { id: '2', title: 'Ship', done: false },
  ];
  client.setQueryData(listKey, initial);
  const fake = createFakeSource();
  const connect = vi.fn<ConnectFn>(() => fake.source);
  const hook = renderHook(() => useTodoEvents(SSE_URL, connect), { wrapper: createWrapper(client) });
  return { client, fake, connect, hook };
}

test('connects once, and a full payload is written straight into the cache', () => {
  const { client, fake, connect } = setup();
  expect(connect).toHaveBeenCalledTimes(1);
  expect(connect).toHaveBeenCalledWith(SSE_URL);

  fake.emit({ type: 'todo-updated', todo: { id: '2', title: 'Ship', done: true } });

  expect(client.getQueryData(listKey)).toEqual([
    { id: '1', title: 'Write tests', done: false },
    { id: '2', title: 'Ship', done: true },
  ]);
});

test('a bare change notice invalidates instead of guessing, and unmount closes the stream', () => {
  const { client, fake, hook } = setup();

  fake.emit({ type: 'todos-changed' });
  expect(client.getQueryState(listKey)?.isInvalidated).toBe(true);

  hook.unmount();
  expect(fake.source.close).toHaveBeenCalledTimes(1);
});
