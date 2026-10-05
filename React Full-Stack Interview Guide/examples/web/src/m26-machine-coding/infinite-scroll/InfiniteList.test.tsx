import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InfiniteList, type Page } from './InfiniteList';

// jsdom has no IntersectionObserver: install a fake we can fire by hand.
type Fake = { callback: IntersectionObserverCallback; disconnected: boolean };
let observers: Fake[] = [];

class FakeIntersectionObserver {
  private readonly record: Fake;
  constructor(callback: IntersectionObserverCallback) {
    this.record = { callback, disconnected: false };
    observers.push(this.record);
  }
  observe() {}
  unobserve() {}
  takeRecords() {
    return [];
  }
  disconnect() {
    this.record.disconnected = true;
  }
}

// Scroll the sentinel into view: every LIVE observer reports an intersecting entry.
const scrollToSentinel = () =>
  act(async () => {
    for (const { callback, disconnected } of observers) {
      if (!disconnected) callback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    }
  });

const pageOf = (page: number): Page => ({
  items: [`Item ${page}a`, `Item ${page}b`],
  hasMore: page < 2,
});

beforeEach(() => {
  observers = [];
  vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
});
afterEach(() => vi.unstubAllGlobals());

test('loads nothing until the sentinel is seen, then one page per sighting', async () => {
  const fetchPage = vi.fn(async (page: number) => pageOf(page));
  render(<InfiniteList fetchPage={fetchPage} />);
  expect(fetchPage).not.toHaveBeenCalled();

  await scrollToSentinel();
  expect(fetchPage).toHaveBeenLastCalledWith(1);
  expect(screen.getByText('Item 1a')).toBeInTheDocument();

  await scrollToSentinel();
  expect(fetchPage).toHaveBeenLastCalledWith(2);
  expect(screen.getByText('Item 2b')).toBeInTheDocument();
});

test('stops at the last page: the sentinel and the button are gone', async () => {
  render(<InfiniteList fetchPage={async (page) => pageOf(page)} />);
  await scrollToSentinel();
  await scrollToSentinel();

  expect(screen.getByText('No more items')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Load more' })).not.toBeInTheDocument();
});

test('two triggers while a request is in flight fetch once', async () => {
  let release: (page: Page) => void = () => {};
  const fetchPage = vi.fn(() => new Promise<Page>((resolve) => (release = resolve)));
  render(<InfiniteList fetchPage={fetchPage} />);

  await scrollToSentinel();
  await scrollToSentinel();
  expect(fetchPage).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('status')).toHaveTextContent('Loading');

  await act(async () => release(pageOf(1)));
  expect(screen.getByText('Item 1a')).toBeInTheDocument();
});

test('a failed load shows an error and the button retries', async () => {
  const user = userEvent.setup();
  const fetchPage = vi.fn(async (page: number) => pageOf(page)).mockRejectedValueOnce(new Error('network'));
  render(<InfiniteList fetchPage={fetchPage} />);

  await scrollToSentinel();
  expect(screen.getByRole('alert')).toHaveTextContent('Could not load more');

  await user.click(screen.getByRole('button', { name: 'Load more' }));
  expect(screen.getByText('Item 1a')).toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

test('without IntersectionObserver the button still works', async () => {
  vi.unstubAllGlobals(); // jsdom's own environment: no IntersectionObserver at all
  const user = userEvent.setup();
  render(<InfiniteList fetchPage={async (page) => pageOf(page)} />);
  await user.click(screen.getByRole('button', { name: 'Load more' }));
  expect(screen.getByText('Item 1a')).toBeInTheDocument();
});
