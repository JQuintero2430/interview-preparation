import { useCallback, useState } from 'react';

export type IntersectionOptions = { threshold?: number; rootMargin?: string; once?: boolean };

/**
 * Observes whichever element the returned callback ref is attached to.
 * A callback ref (not useRef + useEffect) so a conditionally rendered or swapped element is
 * observed too; the React 19 ref cleanup disconnects the observer.
 * Options are primitives on purpose: an options object literal would change the ref callback
 * on every render, and React would detach and re-attach it each time.
 * @param options - `threshold` (0..1), `rootMargin` (CSS margin string), and `once`: stop
 *   observing after the first intersection, so the result stays `true` (lazy loading).
 * @returns `ref` to attach, the latest `entry`, and `isIntersecting`.
 */
export function useIntersectionObserver<T extends Element>({
  threshold = 0,
  rootMargin = '0px',
  once = false,
}: IntersectionOptions = {}) {
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);

  const ref = useCallback(
    (node: T | null) => {
      if (!node) return;
      const observer = new IntersectionObserver(
        (entries) => {
          const latest = entries.at(-1);
          if (!latest) return;
          setEntry(latest);
          if (once && latest.isIntersecting) observer.disconnect();
        },
        { threshold, rootMargin },
      );
      observer.observe(node);
      return () => observer.disconnect();
    },
    [threshold, rootMargin, once],
  );

  return { ref, entry, isIntersecting: entry?.isIntersecting ?? false };
}
