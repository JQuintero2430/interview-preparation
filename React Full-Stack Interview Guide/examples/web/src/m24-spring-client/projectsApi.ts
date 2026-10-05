import type { ApiClient } from './http';
import type { CreatedProject, PageResponse, Project } from './contract';

export type ProjectsApi = ReturnType<typeof projectsApi>;

/** Typed calls for /api/projects. Page numbers are 0-based on the wire, exactly like Spring. */
export function projectsApi(client: ApiClient) {
  return {
    list: (page: number, size: number, signal?: AbortSignal) =>
      client.request<PageResponse<Project>>(`/api/projects?page=${page}&size=${size}`, { signal }),
    get: (id: number) => client.request<Project>(`/api/projects/${id}`),
    async create(name: string): Promise<CreatedProject> {
      const res = await client.fetch('/api/projects', { method: 'POST', body: JSON.stringify({ name }) });
      return { project: (await res.json()) as Project, location: res.headers.get('Location') };
    },
  };
}
