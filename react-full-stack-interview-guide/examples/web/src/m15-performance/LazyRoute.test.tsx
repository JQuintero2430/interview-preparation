import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LazyApp } from './LazyRoute';

// Make the chunk "download" take 100 ms, as a real network request would, so the fallback
// is observable. The factory only runs the first time the module is imported.
vi.mock('./ReportsPage', async (importOriginal) => {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return importOriginal<typeof import('./ReportsPage')>();
});

// The two tests share the module-level `lazy` component on purpose and run in order:
// the first one loads the chunk, the second one shows that `lazy` caches it.

test('first visit: the fallback shows while the chunk loads, then the page', async () => {
  const user = userEvent.setup();
  render(<LazyApp />);
  expect(screen.getByRole('heading', { name: 'Home' })).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Reports' }));

  expect(screen.getByRole('status')).toHaveTextContent('Loading reports…');
  expect(await screen.findByRole('heading', { name: 'Reports' })).toBeInTheDocument();
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});

test('second visit: lazy cached the resolved module, so no fallback', async () => {
  const user = userEvent.setup();
  render(<LazyApp />);

  await user.click(screen.getByRole('button', { name: 'Reports' }));

  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Reports' })).toBeInTheDocument();
});
