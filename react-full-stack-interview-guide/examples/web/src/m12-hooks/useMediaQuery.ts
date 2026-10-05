import { useCallback, useSyncExternalStore } from 'react';

/**
 * Whether a CSS media query currently matches, updated live when it changes.
 * The browser's MediaQueryList is the external store; `matches` (a boolean) is the snapshot.
 * @param query - A media query such as `(prefers-color-scheme: dark)`.
 * @param serverValue - What to render on the server and during hydration, where no window exists.
 * @returns `true` while the query matches.
 */
export function useMediaQuery(query: string, serverValue = false): boolean {
  // Memoized on `query`: a new subscribe function would make React unsubscribe and resubscribe.
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onStoreChange);
      return () => list.removeEventListener('change', onStoreChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}
