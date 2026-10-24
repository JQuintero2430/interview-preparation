// Section 3 model: the list state of an infinite-scroll feed. Our model, after 41 §6's tiebreaker rule (a stable
// order needs a unique tiebreaker), not a library's code. Pages and live posts are merged by id; live posts
// wait in a buffer until `showNew`. The network, the scroll position and the clock are not involved:
// the caller passes pages and posts in, and a post's publication time is a number it carries.

export interface Post {
  readonly id: string;
  /** Publication time as a number the server sent; the model never reads a clock. */
  readonly publishedAt: number;
}

export interface FeedPage {
  readonly items: readonly Post[];
  /** `null` means the server has no older posts. */
  readonly nextCursor: string | null;
}

export interface FeedPager {
  /** Merges a page and returns true; returns false, changing nothing, once the feed has ended. */
  addPage(page: FeedPage): boolean;
  /** Buffers a live post unless its id is already shown or already buffered. */
  receiveLive(post: Post): void;
  /** Moves the buffer into the list and returns how many posts it held. */
  showNew(): number;
  /** The shown posts, newest first. */
  view(): readonly Post[];
  pendingCount(): number;
  ended(): boolean;
}

/** Newest first; equal times fall back to the id, so the order is total and the same on every merge. */
export function feedOrder(a: Post, b: Post): number {
  return b.publishedAt - a.publishedAt || Number(b.id > a.id) - Number(b.id < a.id);
}

export function createFeedPager(): FeedPager {
  const shown = new Map<string, Post>();
  const waiting = new Map<string, Post>();
  let reachedEnd = false;

  const show = (posts: readonly Post[]): void => {
    for (const post of posts) {
      shown.set(post.id, post);
      waiting.delete(post.id);
    }
  };

  return {
    addPage(page) {
      if (reachedEnd) return false;
      show(page.items);
      reachedEnd = page.nextCursor === null;
      return true;
    },
    receiveLive(post) {
      if (!shown.has(post.id)) waiting.set(post.id, post);
    },
    showNew() {
      const arrived = [...waiting.values()];
      show(arrived);
      return arrived.length;
    },
    view: () => [...shown.values()].sort(feedOrder),
    pendingCount: () => waiting.size,
    ended: () => reachedEnd,
  };
}
