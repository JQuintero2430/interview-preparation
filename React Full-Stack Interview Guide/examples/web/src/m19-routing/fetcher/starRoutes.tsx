import { useFetcher, useLoaderData, type ActionFunctionArgs, type RouteObject } from 'react-router';
import type { Project, ProjectStore } from '../projectStore';
import { Booting } from '../renderRouter';

function StarButton({ project }: { project: Project }) {
  const fetcher = useFetcher();
  // Optimistic UI: while the submission is in flight, show what we asked for, not what we have.
  const starred = fetcher.formData ? fetcher.formData.get('starred') === 'true' : project.starred;

  return (
    <fetcher.Form method="post" action={`/projects/${project.id}/star`}>
      <input type="hidden" name="starred" value={String(!starred)} />
      <button type="submit" aria-pressed={starred} aria-label={`Star ${project.name}`}>
        {starred ? '★' : '☆'}
      </button>
    </fetcher.Form>
  );
}

function StarList() {
  const { projects } = useLoaderData<{ projects: Project[] }>();
  return (
    <main>
      <h1>Projects</h1>
      <ul aria-label="Projects">
        {projects.map((p) => (
          <li key={p.id}>
            {p.name} <StarButton project={p} />
          </li>
        ))}
      </ul>
    </main>
  );
}

/**
 * 19.5: `useFetcher` calls an action (or loader) WITHOUT navigating. The star action lives on its
 * own route with no component, a "resource route" in framework terms.
 */
export function createStarRoutes(store: ProjectStore): RouteObject[] {
  async function starAction({ request, params }: ActionFunctionArgs) {
    const form = await request.formData();
    await store.setStarred(params.projectId ?? '', form.get('starred') === 'true');
    return { ok: true };
  }

  return [
    { path: '/projects', loader: () => ({ projects: store.list() }), Component: StarList, HydrateFallback: Booting },
    { path: '/projects/:projectId/star', action: starAction },
  ];
}
