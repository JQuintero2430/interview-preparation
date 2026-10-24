// Exercise 46.1: the types and helpers both variants share (a: a class holding pages by cursor; b: a pure reducer over
// events plus an effect runner). Our model, not a library's code; the merge order is `feedOrder` of section 3's
// `feed-pager.ts`, imported read-only. The API is an interface: the test passes an in-memory fake, so no network,
// clock or randomness is involved.
import { feedOrder, type FeedPage, type Post } from '../concepts/feed-pager';

export type { Post };
export type Page = FeedPage;

export interface FeedApi {
  load(cursor: string | null): Promise<Page>;
}

/** What goes into history state: ids, not post bodies (those come from a cache), plus where loading continues. */
export interface Snapshot {
  readonly pages: readonly { readonly cursor: string | null; readonly ids: readonly string[] }[];
  readonly live: readonly string[];
  readonly anchorId: string | null;
  readonly next: string | null;
  readonly ended: boolean;
}

export type Status = 'idle' | 'loading' | 'failed' | 'ended';

export interface FeedSession {
  /** Loads the page after the last one; joins a load already in flight; never rejects (a failure sets `failed`). */
  loadNext(): Promise<void>;
  receiveLive(post: Post): void;
  /** Moves the buffered posts into the list and returns how many there were. */
  showNew(): number;
  setAnchor(id: string | null): void;
  view(): readonly Post[];
  pendingCount(): number;
  status(): Status;
  /** Cursors of pages dropped from the window, kept so a caller can load them again. */
  droppedCursors(): readonly (string | null)[];
  snapshot(): Snapshot;
  restore(snapshot: Snapshot, cache: ReadonlyMap<string, Post>): void;
}

export interface FeedSessionOptions {
  readonly maxPages: number;
}

export type CreateFeedSession = (api: FeedApi, options: FeedSessionOptions) => FeedSession;

/** A page as the session keeps it: the cursor that loaded it and its place in load order (`seq`). */
export interface LoadedPage {
  readonly cursor: string | null;
  readonly seq: number;
  readonly posts: readonly Post[];
}

/** Every post in the list, once, newest first. */
export function orderedView(pages: readonly LoadedPage[], live: readonly Post[]): readonly Post[] {
  const byId = new Map<string, Post>();
  for (const post of [...pages.flatMap((page) => page.posts), ...live]) byId.set(post.id, post);
  return [...byId.values()].sort(feedOrder);
}

export function isListed(pages: readonly LoadedPage[], live: readonly Post[], id: string): boolean {
  return orderedView(pages, live).some((post) => post.id === id);
}

/**
 * The page to drop: the one whose load order is farthest from the anchor's page. An anchor that is in no page yet
 * counts as being on the last page (the user is reading where loading happens). Ties drop the earlier page.
 */
export function farthestPage(pages: readonly LoadedPage[], anchorId: string | null): LoadedPage {
  const anchored = pages.find((page) => page.posts.some((post) => post.id === anchorId));
  const anchorSeq = anchored?.seq ?? Math.max(...pages.map((page) => page.seq));
  return pages.reduce((far, page) =>
    Math.abs(page.seq - anchorSeq) > Math.abs(far.seq - anchorSeq) ? page : far,
  );
}

export function snapshotOf(
  pages: readonly LoadedPage[],
  live: readonly Post[],
  anchorId: string | null,
  next: string | null,
  ended: boolean,
): Snapshot {
  return {
    pages: pages.map((page) => ({ cursor: page.cursor, ids: page.posts.map((post) => post.id) })),
    live: live.map((post) => post.id),
    anchorId,
    next,
    ended,
  };
}

function postsOf(ids: readonly string[], cache: ReadonlyMap<string, Post>): Post[] {
  return ids.flatMap((id) => {
    const post = cache.get(id);
    return post === undefined ? [] : [post];
  });
}

/** Rebuilds pages and shown live posts from ids; dropped cursors are not in a snapshot, so a restore forgets them. */
export function restoredFrom(
  snapshot: Snapshot,
  cache: ReadonlyMap<string, Post>,
): { pages: LoadedPage[]; live: Post[] } {
  return {
    pages: snapshot.pages.map((page, seq) => ({ cursor: page.cursor, seq, posts: postsOf(page.ids, cache) })),
    live: postsOf(snapshot.live, cache),
  };
}
