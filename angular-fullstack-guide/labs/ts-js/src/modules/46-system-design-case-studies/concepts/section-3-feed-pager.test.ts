// Section 3 claims, about our model (feed-pager.ts), not a library's: pages merge by id in feed order, live
// posts wait in a buffer, showing them prepends in feed order, a post already shown is not "new", and a
// null cursor ends the feed. Posts are plain values with a number as their time; no network, clock or randomness.
import { describe, expect, it } from 'vitest';
import { createFeedPager, type FeedPage, type Post } from './feed-pager';

const post = (id: string, publishedAt: number): Post => ({ id, publishedAt });
const ids = (posts: readonly Post[]): string[] => posts.map((p) => p.id);

const page1: FeedPage = { items: [post('e', 50), post('d', 40), post('c', 30)], nextCursor: 'c2' };
const page2: FeedPage = { items: [post('c', 30), post('d2', 40), post('b', 20), post('a', 10)], nextCursor: 'c3' };

describe('Section 3: feed pager', () => {
  it('Section 3: pages merge in feed order and a post seen twice appears once', () => {
    const pager = createFeedPager();
    pager.addPage(page1);
    pager.addPage(page2);
    expect(ids(pager.view())).toEqual(['e', 'd2', 'd', 'c', 'b', 'a']);
  });

  it('Section 3: live arrivals wait in a buffer and do not shift the list', () => {
    const pager = createFeedPager();
    pager.addPage(page1);
    pager.receiveLive(post('f', 60));
    expect(ids(pager.view())).toEqual(['e', 'd', 'c']);
    expect(pager.pendingCount()).toBe(1);
  });

  it('Section 3: showing new posts prepends the buffer in feed order and empties it', () => {
    const pager = createFeedPager();
    pager.addPage(page1);
    pager.receiveLive(post('f', 60));
    pager.receiveLive(post('g', 70));
    expect(pager.showNew()).toBe(2);
    expect(ids(pager.view())).toEqual(['g', 'f', 'e', 'd', 'c']);
    expect(pager.pendingCount()).toBe(0);
  });

  it('Section 3: a live arrival already in the list is not counted as new', () => {
    const pager = createFeedPager();
    pager.addPage(page1);
    pager.receiveLive(post('d', 40));
    pager.receiveLive(post('f', 60));
    pager.receiveLive(post('f', 60));
    expect(pager.pendingCount()).toBe(1);
  });

  it('Section 3: a null next cursor ends the feed and further loads are refused', () => {
    const pager = createFeedPager();
    expect(pager.addPage({ items: [post('b', 20)], nextCursor: null })).toBe(true);
    expect(pager.ended()).toBe(true);
    expect(pager.addPage({ items: [post('a', 10)], nextCursor: 'c9' })).toBe(false);
    expect(ids(pager.view())).toEqual(['b']);
  });
});
