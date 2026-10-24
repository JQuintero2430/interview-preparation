// Exercise 46.1, variant a (the solution): a class holding the pages by cursor, a buffer for live posts and one
// promise for the load in flight. Every rule is a small method; the shared helpers hold the merge, the drop choice
// and the snapshot shape.
import {
  farthestPage,
  isListed,
  orderedView,
  restoredFrom,
  snapshotOf,
  type CreateFeedSession,
  type FeedApi,
  type FeedSession,
  type LoadedPage,
  type Page,
  type Post,
  type Snapshot,
  type Status,
} from '../feed-session';

class PagedFeed implements FeedSession {
  private pages: LoadedPage[] = [];
  private live: Post[] = [];
  private readonly buffer = new Map<string, Post>();
  private dropped: (string | null)[] = [];
  private next: string | null = null;
  private current: Status = 'idle';
  private anchorId: string | null = null;
  private seq = 0;
  private inflight: Promise<void> | undefined;

  constructor(
    private readonly api: FeedApi,
    private readonly maxPages: number,
  ) {}

  loadNext(): Promise<void> {
    if (this.current === 'ended') return Promise.resolve();
    this.inflight ??= this.fetchNext();
    return this.inflight;
  }

  receiveLive(post: Post): void {
    if (!isListed(this.pages, this.live, post.id)) this.buffer.set(post.id, post);
  }

  showNew(): number {
    const arrived = [...this.buffer.values()];
    this.live.push(...arrived);
    this.buffer.clear();
    return arrived.length;
  }

  setAnchor(id: string | null): void {
    this.anchorId = id;
  }

  view(): readonly Post[] {
    return orderedView(this.pages, this.live);
  }

  pendingCount(): number {
    return this.buffer.size;
  }

  status(): Status {
    return this.current;
  }

  droppedCursors(): readonly (string | null)[] {
    return this.dropped;
  }

  snapshot(): Snapshot {
    return snapshotOf(this.pages, this.live, this.anchorId, this.next, this.current === 'ended');
  }

  restore(snapshot: Snapshot, cache: ReadonlyMap<string, Post>): void {
    const restored = restoredFrom(snapshot, cache);
    this.pages = restored.pages;
    this.live = restored.live;
    this.buffer.clear();
    this.dropped = [];
    this.next = snapshot.next;
    this.current = snapshot.ended ? 'ended' : 'idle';
    this.anchorId = snapshot.anchorId;
    this.seq = restored.pages.length;
  }

  private async fetchNext(): Promise<void> {
    const cursor = this.next;
    this.current = 'loading';
    try {
      this.add(cursor, await this.api.load(cursor));
    } catch {
      this.current = 'failed';
    } finally {
      this.inflight = undefined;
    }
  }

  private add(cursor: string | null, page: Page): void {
    this.pages.push({ cursor, seq: this.seq++, posts: page.items });
    for (const post of page.items) this.buffer.delete(post.id);
    this.next = page.nextCursor;
    this.current = page.nextCursor === null ? 'ended' : 'idle';
    this.trim();
  }

  private trim(): void {
    while (this.pages.length > this.maxPages) {
      const far = farthestPage(this.pages, this.anchorId);
      this.pages = this.pages.filter((page) => page !== far);
      this.dropped.push(far.cursor);
    }
  }
}

export const createFeedSession: CreateFeedSession = (api, { maxPages }) => new PagedFeed(api, maxPages);
