import {
  useFetcher,
  useLoaderData,
  type ActionFunctionArgs,
  type RouteObject,
} from 'react-router';
import type { Project, ProjectStore } from '../projectStore';
import { Booting } from '../renderRouter';

type StarListData = { projects: Project[] };

/**
 * A fetcher submits to an action WITHOUT navigating: the URL and history stay put,
 * and each row tracks its own pending state.
 */
function StarButton({ project }: { project: Project }) {
  const fetcher = useFetcher();
  // Optimistic: while the submission is in flight, show what we asked for, not what the server said.
  const starred = fetcher.formData ? fetcher.formData.get('starred') === 'true' : project.starred;
  return (
    <fetcher.Form method="post" action={`/projects/${project.id}/star`}>
      <input type="hidden" name="starred" value={String(!starred)} />
      <button type="submit" aria-label={`Star ${project.name}`} aria-pressed={starred}>
        {starred ? '★' : '☆'}
      </button>
    </fetcher.Form>
  );
}

function StarListPage() {
  const { projects } = useLoaderData<StarListData>();
  return (
    <>
      <h1>Projects</h1>
      <ul aria-label="Projects">
        {projects.map((p) => (
          <li key={p.id}>
            {p.name} <StarButton project={p} />
          </li>
        ))}
      </ul>
      <p>Starred: {projects.filter((p) => p.starred).length}</p>
    </>
  );
}

export function createStarRoutes(store: ProjectStore): RouteObject[] {
  async function starAction({ request, params }: ActionFunctionArgs) {
    const form = await request.formData();
    await store.setStarred(params.projectId ?? '', form.get('starred') === 'true');
    return { ok: true };
  }

  return [
    { path: '/projects', loader: () => ({ projects: store.list() }), HydrateFallback: Booting, Component: StarListPage },
    // An action-only route: no Component, nothing to render, it exists to be submitted to.
    { path: '/projects/:projectId/star', action: starAction },
  ];
}
