import { setupServer } from 'msw/node';
import { API_ORIGIN } from './contract';
import { createApiClient } from './http';
import { ApiError } from './problem';
import { projectsApi } from './projectsApi';
import { createSession } from './session';
import { springApiHandlers } from './testServer';

const server = setupServer(...springApiHandlers());

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
beforeEach(() => server.use(...springApiHandlers()));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const api = projectsApi(createApiClient({ baseUrl: API_ORIGIN, auth: createSession(API_ORIGIN) }));

test('list returns the Spring page shape with 0-based page numbers', async () => {
  const page = await api.list(1, 10);

  expect(page.content).toHaveLength(10);
  expect(page.content[0]).toEqual({ id: 11, name: 'Project 11' });
  expect(page.page).toEqual({ size: 10, number: 1, totalElements: 25, totalPages: 3 });
});

test('size above 50 is a 400 problem, not a thrown TypeError', async () => {
  const error: unknown = await api.list(0, 100).catch((e: unknown) => e);

  expect(error).toBeInstanceOf(ApiError);
  expect(error).toMatchObject({ status: 400, problem: { title: 'Bad Request', instance: '/api/projects' } });
});

test('create returns the project and the Location header', async () => {
  const created = await api.create('Alpha');

  expect(created.project).toEqual({ id: 26, name: 'Alpha' });
  expect(created.location).toBe(`${API_ORIGIN}/api/projects/26`);
  await expect(api.get(26)).resolves.toEqual({ id: 26, name: 'Alpha' });
});

test('a blank name is a 400 whose errors map to the name field', async () => {
  const error: unknown = await api.create('   ').catch((e: unknown) => e);

  expect(error).toMatchObject({ status: 400, problem: { errors: [{ field: 'name', message: 'must not be blank' }] } });
});
