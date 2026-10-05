import { Suspense, use, useState, useTransition } from 'react';

function Text({ promise }: { promise: Promise<string> }) {
  return <p>{use(promise)}</p>;
}

/**
 * Nested boundaries. The header is OUTSIDE the inner boundaries, so until it resolves the
 * outer fallback covers everything. After that, the sidebar and feed reveal independently,
 * in the order their data arrives.
 */
export function RevealPage({
  header,
  sidebar,
  feed,
}: {
  header: Promise<string>;
  sidebar: Promise<string>;
  feed: Promise<string>;
}) {
  return (
    <Suspense fallback={<p>Loading page…</p>}>
      <Text promise={header} />
      <Suspense fallback={<p>Loading sidebar…</p>}>
        <Text promise={sidebar} />
      </Suspense>
      <Suspense fallback={<p>Loading feed…</p>}>
        <Text promise={feed} />
      </Suspense>
    </Suspense>
  );
}

/**
 * Switching tabs by swapping the promise a Suspense child reads.
 * `smooth` wraps the switch in a transition: React then keeps the already-revealed content
 * on screen instead of replacing it with the fallback.
 */
export function SuspenseTabs({
  load,
  smooth,
}: {
  load: (tab: string) => Promise<string>;
  smooth: boolean;
}) {
  const [promise, setPromise] = useState(() => load('a'));
  const [isPending, startTransition] = useTransition();

  function select(tab: string) {
    const next = load(tab);
    if (smooth) {
      startTransition(() => setPromise(next));
    } else {
      setPromise(next);
    }
  }

  return (
    <div>
      <button type="button" onClick={() => select('a')}>
        Tab A
      </button>
      <button type="button" onClick={() => select('b')}>
        Tab B
      </button>
      {isPending && <p role="status">Switching…</p>}
      <Suspense fallback={<p>Loading…</p>}>
        <Text promise={promise} />
      </Suspense>
    </div>
  );
}
