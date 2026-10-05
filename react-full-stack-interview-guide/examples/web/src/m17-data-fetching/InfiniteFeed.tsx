import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchFeed } from './api';

const FIRST_CURSOR = 0;

/**
 * Cursor pagination with `useInfiniteQuery`. All loaded pages live in ONE cache entry
 * (`data.pages`), and `getNextPageParam` reads the next cursor from the last page.
 * The trigger is a button; an IntersectionObserver sentinel would call the same `fetchNextPage`.
 */
export function InfiniteFeed() {
  const feed = useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: ({ pageParam, signal }) => fetchFeed(pageParam, signal),
    initialPageParam: FIRST_CURSOR,
    // `null` (or undefined) means "no next page", which turns hasNextPage false.
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  if (feed.status === 'pending') return <p role="status">Loading feed…</p>;
  if (feed.status === 'error') return <p role="alert">Could not load the feed: {feed.error.message}</p>;

  const posts = feed.data.pages.flatMap((page) => page.posts);

  return (
    <section>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
      {feed.isFetchNextPageError && <p role="alert">Could not load more posts. Try again.</p>}
      {feed.hasNextPage ? (
        <button onClick={() => void feed.fetchNextPage()} disabled={feed.isFetchingNextPage}>
          {feed.isFetchingNextPage ? 'Loading more…' : 'Load more'}
        </button>
      ) : (
        <p>No more posts</p>
      )}
    </section>
  );
}
