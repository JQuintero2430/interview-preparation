import { act, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { LazySection } from './LazySection';
import { useIntersectionObserver } from './useIntersectionObserver';

// jsdom has no IntersectionObserver. The fake records every instance so the test can play
// the browser: decide when an observed element enters or leaves the viewport.
class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];
  readonly observed = new Set<Element>();
  disconnected = false;

  constructor(
    private readonly callback: IntersectionObserverCallback,
    readonly options: IntersectionObserverInit = {},
  ) {
    FakeIntersectionObserver.instances.push(this);
  }

  observe(target: Element) {
    this.observed.add(target);
  }

  disconnect() {
    this.disconnected = true;
    this.observed.clear();
  }

  trigger(isIntersecting: boolean) {
    const entries = [...this.observed].map(
      (target) => ({ target, isIntersecting }) as IntersectionObserverEntry,
    );
    act(() => this.callback(entries, this as unknown as IntersectionObserver));
  }
}

const latestObserver = () => {
  const observer = FakeIntersectionObserver.instances.at(-1);
  if (!observer) throw new Error('no IntersectionObserver was created');
  return observer;
};

beforeEach(() => {
  FakeIntersectionObserver.instances = [];
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
});
afterEach(() => vi.unstubAllGlobals());

function Probe({ once = false }: { once?: boolean }) {
  const { ref, isIntersecting } = useIntersectionObserver<HTMLDivElement>({ threshold: 0.5, once });
  return <div ref={ref}>{isIntersecting ? 'visible' : 'hidden'}</div>;
}

function Toggle() {
  const [shown, setShown] = useState(false);
  const { ref, isIntersecting } = useIntersectionObserver<HTMLParagraphElement>();
  return (
    <>
      <button onClick={() => setShown(true)}>show</button>
      {shown && <p ref={ref}>{isIntersecting ? 'in view' : 'out of view'}</p>}
    </>
  );
}

test('observes the attached element with the given options', () => {
  render(<Probe />);
  const observer = latestObserver();
  expect([...observer.observed]).toEqual([screen.getByText('hidden')]);
  expect(observer.options).toEqual({ threshold: 0.5, rootMargin: '0px' });
});

test('reports entering and leaving the viewport', () => {
  render(<Probe />);
  latestObserver().trigger(true);
  expect(screen.getByText('visible')).toBeInTheDocument();
  latestObserver().trigger(false);
  expect(screen.getByText('hidden')).toBeInTheDocument();
});

test('once: stops observing after the first intersection', () => {
  render(<Probe once />);
  const observer = latestObserver();
  observer.trigger(true);
  expect(observer.disconnected).toBe(true);
  expect(screen.getByText('visible')).toBeInTheDocument();
});

test('the ref cleanup disconnects on unmount', () => {
  const { unmount } = render(<Probe />);
  const observer = latestObserver();
  unmount();
  expect(observer.disconnected).toBe(true);
});

test('a conditionally rendered element is observed when it appears (callback ref)', () => {
  render(<Toggle />);
  expect(FakeIntersectionObserver.instances).toHaveLength(0);

  act(() => screen.getByRole('button', { name: 'show' }).click());
  latestObserver().trigger(true);
  expect(screen.getByText('in view')).toBeInTheDocument();
});

test('LazySection shows a placeholder, then its content once near the viewport', () => {
  render(
    <LazySection title="Comments">
      <p>42 comments</p>
    </LazySection>,
  );
  expect(screen.getByText('Loading Comments…')).toBeInTheDocument();

  latestObserver().trigger(true);
  expect(screen.getByRole('region', { name: 'Comments' })).toHaveTextContent('42 comments');
});
