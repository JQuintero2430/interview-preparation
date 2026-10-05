import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createGate, createProjectStore, seedProjects } from '../projectStore';
import { renderRouter } from '../renderRouter';
import { createProjectRoutes } from './projectRoutes';
import { validateProjectName } from './projectValidation';

function setup(url = '/projects/apollo', gate?: { promise: Promise<void> }) {
  const store = createProjectStore(seedProjects, gate ? { beforeWrite: () => gate.promise } : {});
  const getSpy = vi.spyOn(store, 'get');
  return { ...renderRouter(createProjectRoutes(store), url), store, getSpy };
}

async function rename(value: string) {
  const user = userEvent.setup();
  const field = await screen.findByLabelText('Project name');
  await user.clear(field);
  if (value) await user.type(field, value);
  await user.click(screen.getByRole('button', { name: 'Save' }));
}

test('validateProjectName: the first failing rule wins', () => {
  const never = () => false;
  expect(validateProjectName('', never)).toBe('Name is required');
  expect(validateProjectName('x'.repeat(41), never)).toBe('Name must be 40 characters or fewer');
  expect(validateProjectName('Cobalt', () => true)).toBe('Another project already has this name');
  expect(validateProjectName('Zephyr', never)).toBeNull();
});

test('the loader provides the data before the component renders', async () => {
  setup();
  expect(await screen.findByRole('heading', { name: 'Apollo', level: 1 })).toBeInTheDocument();
  expect(screen.getByLabelText('Project name')).toHaveValue('Apollo');
});

test('a validation error comes back as action data with a 400, and the loader is NOT re-run', async () => {
  const { getSpy } = setup();
  await rename('Cobalt');

  expect(await screen.findByRole('alert')).toHaveTextContent('Another project already has this name');
  expect(screen.getByLabelText('Project name')).toHaveAttribute('aria-invalid', 'true');
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Apollo');
  expect(getSpy).toHaveBeenCalledTimes(1); // the initial load only
});

test('while the action runs, useNavigation drives the pending UI; success redirects and revalidates', async () => {
  const gate = createGate();
  const { getSpy, router } = setup('/projects/apollo', gate);
  await rename('Apollo 2');

  const button = await screen.findByRole('button', { name: 'Saving…' });
  expect(button).toBeDisabled();
  expect(router.state.navigation.state).toBe('submitting');

  await act(async () => gate.open());

  expect(await screen.findByRole('heading', { name: 'Apollo 2', level: 1 })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Save' })).toBeEnabled();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  expect(getSpy).toHaveBeenCalledTimes(2); // initial load + revalidation after the redirect
});

test('an unknown id throws a 404 response; the route ErrorBoundary renders inside the layout', async () => {
  setup('/projects/nope');
  expect(await screen.findByRole('heading', { name: 'Project not found' })).toBeInTheDocument();
  expect(screen.getByText('No project with id "nope"')).toBeInTheDocument();
  expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
});
