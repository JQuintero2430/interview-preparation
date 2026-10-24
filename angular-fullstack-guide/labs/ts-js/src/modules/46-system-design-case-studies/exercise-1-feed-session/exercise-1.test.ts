// Exercise 46.1: six criteria, each run over both variants (a: a class holding pages by cursor; b: a pure reducer plus
// an effect runner). The API is our in-memory fake, not a server's code: it serves fixed pages by cursor, and one
// cursor can be told to fail once. No network, no clock, no timers, no randomness: a load that is "in flight" is one
// whose promise has not settled yet, because a fake's promise settles only after the caller's current synchronous code.
import { createFeedSession as createA } from './a/feed-session';
import { createFeedSession as createB } from './b/feed-session';
import type { CreateFeedSession, FeedApi, Page, Post } from './feed-session';

const post = (id: string, publishedAt: number): Post => ({ id, publishedAt });
const ids = (posts: readonly Post[]): string[] => posts.map((p) => p.id);

// p7 appears on both of the first two pages, as it would if a post were published between the two requests.
const PAGES = new Map<string | null, Page>([
  [null, { items: [post('p9', 90), post('p8', 80), post('p7', 70)], nextCursor: 'c2' }],
  ['c2', { items: [post('p7', 70), post('p6', 60), post('p5', 50)], nextCursor: 'c3' }],
  ['c3', { items: [post('p4', 40), post('p3', 30)], nextCursor: 'c4' }],
  ['c4', { items: [post('p2', 20), post('p1', 10)], nextCursor: null }],
]);

class FakeFeed implements FeedApi {
  readonly calls: (string | null)[] = [];
  private readonly failing = new Set<string | null>();

  /** The next request for this cursor is rejected; the one after it is served. */
  failOnce(cursor: string | null): void {
    this.failing.add(cursor);
  }

  load(cursor: string | null): Promise<Page> {
    this.calls.push(cursor);
    if (this.failing.delete(cursor)) return Promise.reject(new Error(`page ${String(cursor)} failed`));
    const page = PAGES.get(cursor);
    return page === undefined ? Promise.reject(new Error(`no page ${String(cursor)}`)) : Promise.resolve(page);
  }
}

describe.each(['a', 'b'])('Exercise 46.1, variant %s', (variant) => {
  const create: CreateFeedSession = variant === 'a' ? createA : createB;

  it('loads the next page with the last cursor and starts no second load while one is in flight', async () => {
    const api = new FakeFeed();
    const session = create(api, { maxPages: 9 });
    await Promise.all([session.loadNext(), session.loadNext()]);
    expect(api.calls).toEqual([null]);
    await session.loadNext();
    expect(api.calls).toEqual([null, 'c2']);
    expect(ids(session.view())).toEqual(['p9', 'p8', 'p7', 'p6', 'p5']);
  });

  it('keeps the list and retries the same cursor after a failed page load', async () => {
    const api = new FakeFeed();
    const session = create(api, { maxPages: 9 });
    await session.loadNext();
    api.failOnce('c2');
    await session.loadNext();
    expect(session.status()).toBe('failed');
    expect(ids(session.view())).toEqual(['p9', 'p8', 'p7']);
    await session.loadNext();
    expect(api.calls).toEqual([null, 'c2', 'c2']);
    expect(session.status()).toBe('idle');
    expect(ids(session.view())).toEqual(['p9', 'p8', 'p7', 'p6', 'p5']);
  });

  it('holds live arrivals in a buffer, counts only posts not already listed, and prepends them in feed order when shown', async () => {
    const session = create(new FakeFeed(), { maxPages: 9 });
    await session.loadNext();
    session.receiveLive(post('p10', 100));
    session.receiveLive(post('p8b', 85));
    session.receiveLive(post('p10', 100));
    session.receiveLive(post('p7', 70));
    expect(session.pendingCount()).toBe(2);
    expect(ids(session.view())).toEqual(['p9', 'p8', 'p7']);
    expect(session.showNew()).toBe(2);
    expect(session.pendingCount()).toBe(0);
    expect(ids(session.view())).toEqual(['p10', 'p9', 'p8b', 'p8', 'p7']);
  });

  it('keeps at most the configured number of pages, dropping the page farthest from the anchor and keeping its cursor to reload it', async () => {
    // Reading at the top: the page loaded last is the farthest from the anchor and is the one dropped.
    const top = create(new FakeFeed(), { maxPages: 2 });
    await top.loadNext();
    top.setAnchor('p9');
    await top.loadNext();
    await top.loadNext();
    expect(top.snapshot().pages.map((page) => page.cursor)).toEqual([null, 'c2']);
    expect(top.droppedCursors()).toEqual(['c3']);
    expect(ids(top.view())).toEqual(['p9', 'p8', 'p7', 'p6', 'p5']);

    // Reading at the bottom: the anchor is on the newest page, so the first page is the farthest.
    const bottom = create(new FakeFeed(), { maxPages: 2 });
    await bottom.loadNext();
    await bottom.loadNext();
    bottom.setAnchor('p4');
    await bottom.loadNext();
    expect(bottom.droppedCursors()).toEqual([null]);
    expect(ids(bottom.view())).toEqual(['p7', 'p6', 'p5', 'p4', 'p3']);
  });

  it('restores a snapshot to the same posts and anchor without a request', async () => {
    const first = create(new FakeFeed(), { maxPages: 9 });
    await first.loadNext();
    await first.loadNext();
    first.setAnchor('p6');
    first.receiveLive(post('p10', 100));
    first.showNew();
    const cache = new Map(first.view().map((p): [string, Post] => [p.id, p]));

    const api = new FakeFeed();
    const second = create(api, { maxPages: 9 });
    second.restore(first.snapshot(), cache);
    expect(api.calls).toEqual([]);
    expect(ids(second.view())).toEqual(ids(first.view()));
    expect(second.snapshot()).toEqual(first.snapshot());
    expect(second.snapshot().anchorId).toBe('p6');
    await second.loadNext();
    expect(api.calls).toEqual(['c3']);
  });

  it('stops loading after a page whose next cursor is null', async () => {
    const api = new FakeFeed();
    const session = create(api, { maxPages: 9 });
    for (let i = 0; i < 4; i += 1) await session.loadNext();
    expect(session.status()).toBe('ended');
    await session.loadNext();
    expect(api.calls).toEqual([null, 'c2', 'c3', 'c4']);
    expect(ids(session.view())).toEqual(['p9', 'p8', 'p7', 'p6', 'p5', 'p4', 'p3', 'p2', 'p1']);
  });
});
