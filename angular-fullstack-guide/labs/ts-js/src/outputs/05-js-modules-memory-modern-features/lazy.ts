/**
 * Wraps a dynamic import so that every caller shares one load, and a failed load can be retried.
 * @param load - usually `() => import('./heavy-feature')`.
 * @returns a function that resolves to the loaded module.
 */
export function lazy<T>(load: () => Promise<T>): () => Promise<T> {
  let pending: Promise<T> | undefined;
  return () => {
    pending ??= load().catch((error: unknown) => {
      // A chunk can fail once (offline, or a deploy removed the old file); do not cache that failure.
      pending = undefined;
      throw error;
    });
    return pending;
  };
}
