import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/** Renders whatever it is given. Server and client disagreeing on `value` is a hydration mismatch. */
export function Stamp({ value }: { value: string }) {
  return <p>{value}</p>;
}

/** Same, but the one element opts out of the text-mismatch check. It does NOT repair the text. */
export function SuppressedStamp({ value }: { value: string }) {
  return <p suppressHydrationWarning>{value}</p>;
}

/**
 * The right way to show a client-only value: the server (and the hydration pass) use
 * `getServerSnapshot`; once hydrated, React re-renders with `getSnapshot`. No mismatch, no error.
 */
export function ClientOnlyStamp({ client }: { client: string }) {
  const value = useSyncExternalStore(
    subscribe,
    () => client,
    () => 'server',
  );
  return <p>{value}</p>;
}
