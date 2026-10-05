import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createProjectStore } from '../projectStore';
import { renderRouter } from '../renderRouter';
import { createProjectsRoutes, withFilter } from './ProjectsPage';

function setup(url: string) {
  return renderRouter(createProjectsRoutes(createProjectStore()), url);
}

async function listedNames() {
  const list = await screen.findByRole('list', { name: 'Projects' });
  return within(list)
    .getAllByRole('listitem')
    .map((li) => li.textContent);
}

test('withFilter sets or removes one key and keeps the others', () => {
  const params = new URLSearchParams('q=ap&page=2');
  expect(withFilter(params, 'status', 'active').toString()).toBe('q=ap&page=2&status=active');
  expect(withFilter(params, 'q', '').toString()).toBe('page=2');
  expect(params.toString()).toBe('q=ap&page=2');
});

test('a deep link restores the filters from the URL', async () => {
  setup('/projects?status=archived&q=co');
  expect(await listedNames()).toEqual(['Cobalt']);
  expect(screen.getByLabelText('Status')).toHaveValue('archived');
  expect(screen.getByLabelText('Search projects')).toHaveValue('co');
});

test('typing writes ?q= with replace, and the list follows the URL', async () => {
  const user = userEvent.setup();
  const { router } = setup('/projects');
  await screen.findByRole('list', { name: 'Projects' });

  await user.type(screen.getByLabelText('Search projects'), 'ap');

  await vi.waitFor(() => expect(router.state.location.search).toBe('?q=ap'));
  expect(await listedNames()).toEqual(['Apollo', 'Apiary']);
  expect(router.state.historyAction).toBe('REPLACE');
});

test('picking a status pushes an entry and keeps q; Back restores the previous filters in the fields', async () => {
  const user = userEvent.setup();
  const { router } = setup('/projects?q=ap');
  await screen.findByRole('list', { name: 'Projects' });

  await user.selectOptions(screen.getByLabelText('Status'), 'active');
  await vi.waitFor(() => expect(router.state.location.search).toBe('?q=ap&status=active'));
  expect(await listedNames()).toEqual(['Apollo']);
  expect(router.state.historyAction).toBe('PUSH');

  await act(() => router.navigate(-1));

  expect(router.state.location.search).toBe('?q=ap');
  expect(screen.getByLabelText('Status')).toHaveValue('');
  expect(await listedNames()).toEqual(['Apollo', 'Apiary']);
});

test('no match is a message, not an empty list; Clear filters resets the URL and the fields', async () => {
  const user = userEvent.setup();
  const { router } = setup('/projects?q=zzz');
  // Not findByRole('status'): the HydrateFallback "Loading…" is a status too, and is on screen first.
  expect(await screen.findByText('No projects match these filters.')).toHaveAttribute('role', 'status');

  await user.click(screen.getByRole('link', { name: 'Clear filters' }));

  expect(await listedNames()).toEqual(['Apollo', 'Apiary', 'Borealis', 'Cobalt']);
  expect(router.state.location.search).toBe('');
  expect(screen.getByLabelText('Search projects')).toHaveValue('');
});
