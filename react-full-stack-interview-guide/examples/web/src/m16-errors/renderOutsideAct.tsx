import type { ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { createRoot, type RootOptions } from 'react-dom/client';

type ActGlobal = typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean };

/**
 * Renders synchronously OUTSIDE act().
 *
 * Inside act() (which Testing Library's render uses), React 19 collects uncaught render
 * errors and rethrows them from act() instead of calling `onUncaughtError`. To observe
 * `onUncaughtError` or the default uncaught-error behavior, a test must render outside act.
 * Turning IS_REACT_ACT_ENVIRONMENT off for the duration avoids the "not wrapped in act" warning.
 */
export function renderOutsideAct(ui: ReactNode, options?: RootOptions) {
  const env = globalThis as ActGlobal;
  const previous = env.IS_REACT_ACT_ENVIRONMENT;
  env.IS_REACT_ACT_ENVIRONMENT = false;

  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container, options);
  flushSync(() => root.render(ui));

  return {
    container,
    unmount() {
      root.unmount();
      container.remove();
      env.IS_REACT_ACT_ENVIRONMENT = previous;
    },
  };
}
