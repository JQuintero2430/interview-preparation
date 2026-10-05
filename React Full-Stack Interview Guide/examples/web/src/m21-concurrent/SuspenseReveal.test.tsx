import { act, render, screen } from '@testing-library/react';
import { RevealPage, SuspenseTabs } from './SuspenseReveal';

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

// A component that suspends on use(promise) at first render needs an AWAITED act (see 17.10).
test('nested boundaries reveal from the outside in, then each inner one when its data arrives', async () => {
  const header = deferred<string>();
  const sidebar = deferred<string>();
  const feed = deferred<string>();

  await act(async () => {
    render(<RevealPage header={header.promise} sidebar={sidebar.promise} feed={feed.promise} />);
  });
  // Only the OUTER fallback: the header is not ready, so nothing inside is shown.
  expect(screen.getByText('Loading page…')).toBeInTheDocument();
  expect(screen.queryByText('Loading sidebar…')).not.toBeInTheDocument();

  await act(async () => header.resolve('Header ready'));
  // The outer boundary resolves; the inner ones show THEIR fallbacks.
  expect(screen.queryByText('Loading page…')).not.toBeInTheDocument();
  expect(screen.getByText('Header ready')).toBeInTheDocument();
  expect(screen.getByText('Loading sidebar…')).toBeInTheDocument();
  expect(screen.getByText('Loading feed…')).toBeInTheDocument();

  await act(async () => feed.resolve('Feed ready')); // out of source order: the feed first
  expect(screen.getByText('Feed ready')).toBeInTheDocument();
  expect(screen.getByText('Loading sidebar…')).toBeInTheDocument();

  await act(async () => sidebar.resolve('Sidebar ready'));
  expect(screen.getByText('Sidebar ready')).toBeInTheDocument();
  expect(screen.queryByText(/Loading/)).not.toBeInTheDocument();
});

async function renderTabs(smooth: boolean) {
  const pending = new Map<string, ReturnType<typeof deferred<string>>>();
  const load = (tab: string) => {
    const d = deferred<string>();
    pending.set(tab, d);
    return d.promise;
  };
  await act(async () => {
    render(<SuspenseTabs load={load} smooth={smooth} />);
  });
  await act(async () => pending.get('a')?.resolve('Content A'));
  return {
    click: (name: string) => act(async () => screen.getByRole('button', { name }).click()),
    resolve: (tab: string, text: string) => act(async () => pending.get(tab)?.resolve(text)),
  };
}

test('without a transition, switching re-suspends: the fallback replaces content that was already revealed', async () => {
  const tabs = await renderTabs(false);
  expect(screen.getByText('Content A')).toBeVisible();

  await tabs.click('Tab B');
  expect(screen.getByText('Loading…')).toBeInTheDocument();
  // React HIDES the existing content (it is not unmounted, so its state survives).
  expect(screen.getByText('Content A')).not.toBeVisible();

  await tabs.resolve('b', 'Content B');
  expect(screen.getByText('Content B')).toBeVisible();
  expect(screen.queryByText('Loading…')).not.toBeInTheDocument();
});

test('inside a transition, the old content stays and isPending is true; no fallback', async () => {
  const tabs = await renderTabs(true);

  await tabs.click('Tab B');
  expect(screen.queryByText('Loading…')).not.toBeInTheDocument();
  expect(screen.getByText('Content A')).toBeVisible();
  expect(screen.getByRole('status')).toHaveTextContent('Switching…');

  await tabs.resolve('b', 'Content B');
  expect(screen.getByText('Content B')).toBeVisible();
  expect(screen.queryByText('Content A')).not.toBeInTheDocument();
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});
