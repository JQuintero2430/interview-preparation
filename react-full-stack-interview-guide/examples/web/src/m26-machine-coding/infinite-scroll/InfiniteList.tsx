import { useEffect, useEffectEvent, useRef, useState } from 'react';

export type Page = { items: string[]; hasMore: boolean };
type Props = { fetchPage: (page: number) => Promise<Page> };

type State = { items: string[]; page: number; hasMore: boolean; loading: boolean; error: boolean };
const INITIAL: State = { items: [], page: 0, hasMore: true, loading: false, error: false };

export function InfiniteList({ fetchPage }: Props) {
  const [state, setState] = useState<State>(INITIAL);
  const sentinel = useRef<HTMLDivElement>(null);
  const inFlight = useRef(false); // guards double triggers; a ref, because it must update synchronously

  async function loadMore() {
    if (inFlight.current || !state.hasMore) return;
    inFlight.current = true;
    setState((s) => ({ ...s, loading: true, error: false }));
    try {
      const { items, hasMore } = await fetchPage(state.page + 1);
      setState((s) => ({ items: [...s.items, ...items], page: s.page + 1, hasMore, loading: false, error: false }));
    } catch {
      setState((s) => ({ ...s, loading: false, error: true }));
    } finally {
      inFlight.current = false;
    }
  }

  // The observer callback always runs the latest loadMore without making the effect depend on it.
  const onIntersect = useEffectEvent(() => {
    void loadMore();
  });

  // Re-observe after every page: an observer only reports CHANGES, so if the new content is still
  // too short to push the sentinel off screen, a fresh observer fires once and loads the next page.
  // Skipped after an error, so a failing endpoint is not hammered in a loop.
  useEffect(() => {
    const element = sentinel.current;
    if (!element || state.error || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) onIntersect();
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [state.page, state.hasMore, state.error]);

  return (
    <div>
      <ul>
        {state.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      {state.loading && <p role="status">Loading…</p>}
      {state.error && <p role="alert">Could not load more</p>}
      {!state.hasMore && <p>No more items</p>}
      {state.hasMore && (
        <>
          <div ref={sentinel} aria-hidden="true" />
          {/* Fallback for keyboard users, failed loads and browsers without IntersectionObserver. */}
          <button type="button" disabled={state.loading} onClick={() => void loadMore()}>
            Load more
          </button>
        </>
      )}
    </div>
  );
}
