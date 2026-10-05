import { QueryErrorResetBoundary, useSuspenseQuery } from '@tanstack/react-query';
import { Suspense } from 'react';
import { ErrorBoundary, getErrorMessage } from 'react-error-boundary';
import { todosQuery } from './queries';

/** Never sees "loading" or "error": `data` is always defined, the boundaries handle the rest. */
function TodoTitles() {
  const { data } = useSuspenseQuery(todosQuery());
  return (
    <ul>
      {data.map((todo) => (
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  );
}

/**
 * Suspense-based fetching: <Suspense> renders the loading state, an error boundary renders the
 * error state, and QueryErrorResetBoundary clears the failed query so "Try again" refetches.
 */
export function SuspenseTodos() {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <div role="alert">
              <p>Could not load todos: {getErrorMessage(error)}</p>
              <button onClick={() => resetErrorBoundary()}>Try again</button>
            </div>
          )}
        >
          <Suspense fallback={<p role="status">Loading todos…</p>}>
            <TodoTitles />
          </Suspense>
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
}
