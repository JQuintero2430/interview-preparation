// Section 9: the three common service worker caching strategies as plain functions over an injected `fetcher` and `store`,
// so they run in Node. A real worker calls `fetch` and the Cache API inside `event.respondWith(...)` instead (documented, not run).
export type Fetcher = (url: string) => Promise<string>;
export type Store = Map<string, string>;

/** Cache first: answer from the store, go to the network only on a miss and keep the result. */
export const cacheFirst = async (url: string, fetcher: Fetcher, store: Store): Promise<string> => {
  const hit = store.get(url);
  if (hit !== undefined) return hit;
  const fresh = await fetcher(url);
  store.set(url, fresh);
  return fresh;
};

/** Network first: prefer the network and refresh the store; fall back to the store only when the network fails. */
export const networkFirst = async (url: string, fetcher: Fetcher, store: Store): Promise<string> => {
  try {
    const fresh = await fetcher(url);
    store.set(url, fresh);
    return fresh;
  } catch (error) {
    const stale = store.get(url);
    if (stale === undefined) throw error;
    return stale;
  }
};

/** Stale while revalidate: answer from the store at once and refresh it in the background (`refreshed` settles when it is done). */
export const staleWhileRevalidate = (url: string, fetcher: Fetcher, store: Store): { response: Promise<string>; refreshed: Promise<void> } => {
  const refreshed = fetcher(url).then((fresh) => {
    store.set(url, fresh);
  });
  const stale = store.get(url);
  return { response: stale !== undefined ? Promise.resolve(stale) : refreshed.then(() => store.get(url) ?? ''), refreshed };
};
