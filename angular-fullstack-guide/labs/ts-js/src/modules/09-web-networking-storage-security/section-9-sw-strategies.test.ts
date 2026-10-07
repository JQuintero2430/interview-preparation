// Section 9 (Node 24): the caching strategies as functions over an injected fetcher and store.
// Service worker registration, lifecycle and the Cache API need a browser; the module documents them from MDN and web.dev.
import { cacheFirst, networkFirst, staleWhileRevalidate, type Fetcher } from './sw-strategies.js';

const countingFetcher = (body: () => string): { fetcher: Fetcher; calls: () => number } => {
  let calls = 0;
  return { fetcher: async () => { calls++; return body(); }, calls: () => calls };
};
const offline: Fetcher = async () => { throw new TypeError('offline'); };

describe('Module 09 · section 9', () => {
  it('Section 9: cache first goes to the network once and then serves the stored copy, even after the server changed', async () => {
    let version = 'v1';
    const { fetcher, calls } = countingFetcher(() => version);
    const store = new Map<string, string>();
    expect(await cacheFirst('/app.js', fetcher, store)).toBe('v1');
    version = 'v2';
    expect(await cacheFirst('/app.js', fetcher, store)).toBe('v1');
    expect(calls()).toBe(1);
  });

  it('Section 9: network first returns fresh data and stores it, and falls back to the store only when the network fails', async () => {
    const store = new Map<string, string>();
    expect(await networkFirst('/api', async () => 'fresh', store)).toBe('fresh');
    expect(await networkFirst('/api', offline, store)).toBe('fresh');
    await expect(networkFirst('/other', offline, store)).rejects.toThrow('offline');
  });

  it('Section 9: stale while revalidate answers from the store at once and the next read sees the refreshed copy', async () => {
    const store = new Map([['/feed', 'old']]);
    const first = staleWhileRevalidate('/feed', async () => 'new', store);
    expect(await first.response).toBe('old');
    await first.refreshed;
    expect(await staleWhileRevalidate('/feed', async () => 'newer', store).response).toBe('new');
  });
});
