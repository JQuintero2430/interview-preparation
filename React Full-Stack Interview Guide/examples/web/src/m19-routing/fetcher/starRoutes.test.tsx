import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createGate, createProjectStore, seedProjects } from '../projectStore';
import { renderRouter } from '../renderRouter';
import { createStarRoutes } from './starRoutes';

test('a fetcher submission is optimistic, does not navigate, and revalidates the page loader', async () => {
  const user = userEvent.setup();
  const gate = createGate();
  const store = createProjectStore(seedProjects, { beforeWrite: () => gate.promise });
  const listSpy = vi.spyOn(store, 'list');
  const { router } = renderRouter(createStarRoutes(store), '/projects');

  const star = await screen.findByRole('button', { name: 'Star Apollo' });
  expect(star).toHaveAttribute('aria-pressed', 'false');

  await user.click(star);

  // The action is still waiting on the gate, yet the button already shows the new state.
  expect(screen.getByRole('button', { name: 'Star Apollo' })).toHaveAttribute('aria-pressed', 'true');
  expect(router.state.location.pathname).toBe('/projects');
  expect(router.state.navigation.state).toBe('idle');

  await act(async () => gate.open());

  await vi.waitFor(() => expect(listSpy).toHaveBeenCalledTimes(2)); // first load + revalidation
  expect(store.get('apollo')?.starred).toBe(true);
  expect(screen.getByRole('button', { name: 'Star Apollo' })).toHaveAttribute('aria-pressed', 'true');
});
