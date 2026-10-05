import { useEffect, useState } from 'react';

// Effect-based subscription to a browser API. Correct, but see module 12:
// useSyncExternalStore is the purpose-built hook for this (no tearing, SSR snapshot).
export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  return online;
}
