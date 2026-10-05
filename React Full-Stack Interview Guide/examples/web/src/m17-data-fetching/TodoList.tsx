import { useQuery } from '@tanstack/react-query';
import type { Todo } from './api';
import { todosQuery } from './queries';
import { toRemoteData, type RemoteData } from './remoteData';

export function TodoList() {
  const query = useQuery(todosQuery());
  return <TodoListView state={toRemoteData(query)} />;
}

function TodoListView({ state }: { state: RemoteData<Todo> }) {
  switch (state.kind) {
    case 'loading':
      return <p role="status">Loading todos…</p>;
    case 'error':
      return <p role="alert">Could not load todos: {state.message}</p>;
    case 'empty':
      return <p>Nothing to do yet.</p>;
    case 'success':
      return (
        <ul>
          {state.data.map((todo) => (
            <li key={todo.id}>{todo.title}</li>
          ))}
        </ul>
      );
  }
}
