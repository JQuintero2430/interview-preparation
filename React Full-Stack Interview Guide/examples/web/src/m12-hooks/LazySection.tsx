import type { ReactNode } from 'react';
import { useIntersectionObserver } from './useIntersectionObserver';

/**
 * Renders a placeholder until the section scrolls near the viewport, then its children.
 * Once shown, it stays shown (lazy loading, not virtualization).
 * @param title - Accessible name of the section.
 * @param children - Content that is expensive to render or load.
 */
export function LazySection({ title, children }: { title: string; children: ReactNode }) {
  const { ref, isIntersecting } = useIntersectionObserver<HTMLElement>({
    rootMargin: '200px',
    once: true,
  });

  return (
    <section ref={ref} aria-label={title}>
      {isIntersecting ? children : <p>Loading {title}…</p>}
    </section>
  );
}
