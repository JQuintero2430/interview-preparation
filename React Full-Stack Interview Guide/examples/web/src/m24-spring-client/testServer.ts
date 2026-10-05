import { http, HttpResponse } from 'msw';
import { API_ORIGIN, type PageResponse, type Project } from './contract';

/** problem+json, with the content type Spring sends. `HttpResponse.json` would label it application/json. */
export function problem(status: number, body: Record<string, unknown>) {
  return new HttpResponse(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/problem+json' },
  });
}

const SEED = 25;

/** Fresh in-memory store per call, so tests never share state. Mirrors InMemoryProjectRepository (ids 1..25). */
export function springApiHandlers() {
  const store: Project[] = Array.from({ length: SEED }, (_, i) => ({ id: i + 1, name: `Project ${String(i + 1).padStart(2, '0')}` }));
  let nextId = SEED + 1;

  return [
    http.get(`${API_ORIGIN}/api/projects`, ({ request }) => {
      const params = new URL(request.url).searchParams;
      const page = Number(params.get('page') ?? '0');
      const size = Number(params.get('size') ?? '10');
      if (!(page >= 0) || !(size >= 1 && size <= 50)) {
        return problem(400, { type: 'about:blank', title: 'Bad Request', status: 400, detail: 'Invalid request content.', instance: '/api/projects' });
      }
      const body: PageResponse<Project> = {
        content: store.slice(page * size, page * size + size),
        page: { size, number: page, totalElements: store.length, totalPages: Math.ceil(store.length / size) },
      };
      return HttpResponse.json(body);
    }),
    http.get(`${API_ORIGIN}/api/projects/:id`, ({ params }) => {
      const project = store.find((p) => p.id === Number(params['id']));
      if (!project) {
        return problem(404, {
          type: 'https://example.com/problems/project-not-found',
          title: 'Project not found',
          status: 404,
          detail: `Project ${String(params['id'])} does not exist`,
          instance: `/api/projects/${String(params['id'])}`,
        });
      }
      return HttpResponse.json(project);
    }),
    http.post(`${API_ORIGIN}/api/projects`, async ({ request }) => {
      const { name } = (await request.json()) as { name?: string };
      if (!name || name.trim() === '') {
        return problem(400, {
          type: 'about:blank',
          title: 'Bad Request',
          status: 400,
          detail: 'Invalid request content.',
          instance: '/api/projects',
          errors: [{ field: 'name', message: 'must not be blank' }],
        });
      }
      const project = { id: nextId++, name };
      store.push(project);
      return HttpResponse.json(project, { status: 201, headers: { Location: `${API_ORIGIN}/api/projects/${project.id}` } });
    }),
  ];
}
