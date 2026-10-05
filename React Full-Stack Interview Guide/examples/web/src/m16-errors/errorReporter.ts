import type { RootOptions } from 'react-dom/client';

export type ErrorSource = 'caught' | 'uncaught' | 'recoverable' | 'window-error' | 'unhandled-rejection';

export type ErrorReport = {
  source: ErrorSource;
  message: string;
  /** `error.cause`, if any. React's recoverable errors wrap the original error here. */
  cause?: string;
  componentStack?: string;
};

/** Where reports go: a Sentry SDK call, `navigator.sendBeacon`, a batching queue… */
export type Transport = (report: ErrorReport) => void;

type ReactErrorInfo = { componentStack?: string | null | undefined };

function messageOf(thrown: unknown): string {
  return thrown instanceof Error ? thrown.message : String(thrown);
}

/**
 * One reporter for every way an error can escape in a React 19 app (Exercise 3).
 * @param send Receives one normalized report per distinct error.
 * @returns `rootOptions` for createRoot/hydrateRoot, `install()` for the window listeners
 *   (returns the uninstall function), and `report()` for manual calls.
 */
export function createErrorReporter(send: Transport) {
  // The same Error object can arrive by two paths (for example a root callback and a
  // window listener). Objects are deduplicated by identity; primitives cannot be.
  const reported = new WeakSet<object>();

  function report(source: ErrorSource, error: unknown, info?: ReactErrorInfo) {
    if (typeof error === 'object' && error !== null) {
      if (reported.has(error)) return;
      reported.add(error);
    }
    const entry: ErrorReport = { source, message: messageOf(error) };
    if (error instanceof Error && error.cause !== undefined) entry.cause = messageOf(error.cause);
    if (info?.componentStack) entry.componentStack = info.componentStack;
    try {
      send(entry);
    } catch {
      // A broken transport must never become a second error inside the error path.
    }
  }

  const rootOptions = {
    onCaughtError: (error, info) => report('caught', error, info),
    onUncaughtError: (error, info) => report('uncaught', error, info),
    onRecoverableError: (error, info) => report('recoverable', error, info),
  } satisfies RootOptions;

  function install(target: Window = window): () => void {
    const onError = (event: ErrorEvent) => report('window-error', event.error ?? event.message);
    const onRejection = (event: PromiseRejectionEvent) => report('unhandled-rejection', event.reason);
    target.addEventListener('error', onError);
    target.addEventListener('unhandledrejection', onRejection);
    return () => {
      target.removeEventListener('error', onError);
      target.removeEventListener('unhandledrejection', onRejection);
    };
  }

  return { report, rootOptions, install };
}
