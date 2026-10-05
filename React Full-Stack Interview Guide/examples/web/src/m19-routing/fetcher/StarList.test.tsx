import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createGate, createProjectStore, seedProjects } from '../projectStore';
import { renderRouter } from '../renderRouter';
import { createStarRoutes } from './StarList';

test('a fetcher submission is optimistic, does not navigate, and revalidates the page loader', async () => {
  const user = userEvent.setup();
  const gate = createGate();
  const store = createProjectStore(seedProjects, { beforeWrite: () => gate.promise });
  const { router } = renderRouter(createStarRoutes(store), '/projects');
  const star = await screen.findByRole('button', { name: 'Star Apollo' });
  expect(star).toHaveAttribute('aria-pressed', 'false');
  expect(screen.getByText('Starred: 1')).toBeInTheDocument();

  await user.click(star);

  // Optimistic: pressed already, while the "server" is still holding the write.
  expect(screen.getByRole('button', { name: 'Star Apollo' })).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByText('Starred: 1')).toBeInTheDocument();
  expect(router.state.location.pathname).toBe('/projects');
  expect(router.state.navigation.state).toBe('idle');

  await act(async () => gate.open());

  // The action finished, every page loader re-ran, and the server's count now agrees.
  expect(await screen.findByText('Starred: 2')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Star Apollo' })).toHaveAttribute('aria-pressed', 'true');
  expect(router.state.location.pathname).toBe('/projects');
});
