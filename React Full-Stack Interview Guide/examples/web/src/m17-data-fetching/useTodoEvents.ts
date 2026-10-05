import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import type { Todo } from './api';
import { todoKeys, todosQuery } from './queries';

/** What the server pushes. `todo-updated` carries the new row; `todos-changed` is only a hint. */
export type LiveMessage = { type: 'todo-updated'; todo: Todo } | { type: 'todos-changed' };

/** The part of `EventSource` (or a WebSocket adapter) this hook uses, so tests can fake it. */
export type MessageSource = {
  onmessage: ((event: MessageEvent<string>) => void) | null;
  close: () => void;
};

export type ConnectFn = (url: string) => MessageSource;

// Module-level so the default is the same reference every render (it is an effect dependency).
const connectEventSource: ConnectFn = (url) => new EventSource(url);

/**
 * Keeps the todo cache in sync with server-sent events while the component is mounted.
 * A full payload is written straight into the cache; a bare "something changed" invalidates.
 * @param url - The SSE endpoint.
 * @param connect - Opens the stream; defaults to the browser's `EventSource`.
 */
export function useTodoEvents(url: string, connect: ConnectFn = connectEventSource): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    const source = connect(url);
    source.onmessage = (event) => {
      const message = JSON.parse(event.data) as LiveMessage;
      if (message.type === 'todo-updated') {
        queryClient.setQueryData(todosQuery().queryKey, (old) =>
          old?.map((todo) => (todo.id === message.todo.id ? message.todo : todo)),
        );
        return;
      }
      void queryClient.invalidateQueries({ queryKey: todoKeys.all });
    };
    return () => source.close();
  }, [url, connect, queryClient]);
}
