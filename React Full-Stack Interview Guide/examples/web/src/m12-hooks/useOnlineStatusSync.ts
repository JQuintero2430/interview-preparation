import { useSyncExternalStore } from 'react';

// Module-level functions: stable identities, so React subscribes once per component.
function subscribe(onStoreChange: () => void): () => void {
  window.addEventListener('online', onStoreChange);
  window.addEventListener('offline', onStoreChange);
  return () => {
    window.removeEventListener('online', onStoreChange);
    window.removeEventListener('offline', onStoreChange);
  };
}

const getSnapshot = () => navigator.onLine;
const getServerSnapshot = () => true; // assume online while server rendering and hydrating

/**
 * Module 09's `useOnlineStatus`, rewritten with `useSyncExternalStore`: no state copy,
 * no effect, no tearing under concurrent rendering, and an explicit server value.
 * @returns Whether the browser reports a network connection.
 */
export function useOnlineStatusSync(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
