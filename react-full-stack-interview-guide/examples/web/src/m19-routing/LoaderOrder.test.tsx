import { act, render, screen } from '@testing-library/react';
import { RouterProvider } from 'react-router/dom';
import { createLoaderOrderRouter, formWith, log } from './loaderOrder';

beforeEach(() => {
  log.length = 0;
});

/** Creates the router at `url`, renders it and waits until the first loaders have committed. */
async function start(url: string) {
  const router = createLoaderOrderRouter(url);
  render(<RouterProvider router={router} />);
  await screen.findByRole('heading', { name: /Tasks for/ });
  return router;
}

test('1. first load: middleware wraps every matched loader, and the loaders run in parallel', async () => {
  await start('/projects/1/tasks');
  expect(log).toEqual([
    'root middleware before GET',
    'root loader start',
    'project loader start',
    'tasks loader start',
    'root loader end',
    'project loader end',
    'tasks loader end',
    'root middleware after GET',
  ]);
});

test('2. a param change re-runs only the loaders whose own URL segment changed; middleware still runs', async () => {
  const router = await start('/projects/1/tasks');
  log.length = 0;

  await act(() => router.navigate('/projects/2/tasks'));

  expect(screen.getByRole('heading')).toHaveTextContent('Tasks for 2');
  expect(log).toEqual([
    'root middleware before GET',
    'project loader start',
    'tasks loader start',
    'project loader end',
    'tasks loader end',
    'root middleware after GET',
  ]);
});

test('3. a search-param change re-runs every loader, even the root', async () => {
  const router = await start('/projects/2/tasks');
  log.length = 0;

  await act(() => router.navigate('/projects/2/tasks?sort=desc'));

  expect(log).toEqual([
    'root middleware before GET',
    'root loader start',
    'project loader start',
    'tasks loader start',
    'root loader end',
    'project loader end',
    'tasks loader end',
    'root middleware after GET',
  ]);
});

test('4. a successful action: one middleware pass around the action, then a second around every loader', async () => {
  const router = await start('/projects/2/tasks');
  log.length = 0;

  await act(() =>
    router.navigate('/projects/2/tasks', { formMethod: 'post', formData: formWith({ title: 'Ship it' }) }),
  );

  expect(log).toEqual([
    'root middleware before POST',
    'tasks action',
    'root middleware after POST',
    'root middleware before GET',
    'root loader start',
    'project loader start',
    'tasks loader start',
    'root loader end',
    'project loader end',
    'tasks loader end',
    'root middleware after GET',
  ]);
});

test('5. an action that returns a 4xx skips revalidation, but the loader pass still runs the middleware', async () => {
  const router = await start('/projects/2/tasks');
  log.length = 0;

  await act(() => router.navigate('/projects/2/tasks', { formMethod: 'post', formData: formWith({ title: '' }) }));

  expect(router.state.actionData).toEqual({ tasks: { error: 'Title is required' } });
  expect(log).toEqual([
    'root middleware before POST',
    'tasks action',
    'root middleware after POST',
    'root middleware before GET',
    'root middleware after GET',
  ]);
});
