import {
  data,
  Form,
  isRouteErrorResponse,
  Link,
  Outlet,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
  useRouteError,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type RouteObject,
} from 'react-router';
import type { Project, ProjectStore } from '../projectStore';
import { Booting } from '../renderRouter';
import { validateProjectName } from './projectValidation';

type ProjectData = { project: Project };
export type RenameActionData = { error: string; name: string };

function Layout() {
  return (
    <>
      <nav aria-label="Main">
        <Link to="/projects/apollo">Apollo</Link>
      </nav>
      <main>
        <Outlet />
      </main>
    </>
  );
}

function ProjectPage() {
  const { project } = useLoaderData<ProjectData>();
  const actionData = useActionData<RenameActionData>();
  const navigation = useNavigation();
  const saving = navigation.state === 'submitting' && navigation.formMethod === 'POST';
  const error = actionData?.error;

  return (
    <>
      <h1>{project.name}</h1>
      {/* key: after a successful save the loader returns the new name; remounting resets the field */}
      <Form method="post" key={project.name} noValidate>
        <label htmlFor="project-name">Project name</label>
        <input
          id="project-name"
          name="name"
          defaultValue={actionData?.name ?? project.name}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'project-name-error' : undefined}
        />
        {error && (
          <p id="project-name-error" role="alert" aria-live="polite">
            {error}
          </p>
        )}
        <button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </Form>
    </>
  );
}

/** Route-level error UI. Expected errors (a thrown 404 response) and bugs get different messages. */
function ProjectErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <section aria-label="Error">
        <h1>Project not found</h1>
        <p>{String(error.data)}</p>
      </section>
    );
  }
  return (
    <section aria-label="Error">
      <h1>Something went wrong</h1>
      <p>{error instanceof Error ? error.message : 'Unknown error'}</p>
    </section>
  );
}

/**
 * Exercise 3: `/projects/:projectId` with a loader (read), an action (rename), validation errors
 * returned as action data with a 400, and a route error boundary for unknown ids.
 */
export function createProjectRoutes(store: ProjectStore): RouteObject[] {
  function loader({ params }: LoaderFunctionArgs): ProjectData {
    const project = store.get(params.projectId ?? '');
    if (!project) throw data(`No project with id "${params.projectId}"`, { status: 404 });
    return { project };
  }

  async function action({ request, params }: ActionFunctionArgs) {
    const id = params.projectId ?? '';
    const name = String((await request.formData()).get('name') ?? '').trim();
    const error = validateProjectName(name, (candidate) => store.nameTaken(candidate, id));
    // 400: the router keeps the user on the page, exposes this via useActionData, and does not revalidate.
    if (error) return data<RenameActionData>({ error, name }, { status: 400 });
    await store.rename(id, name);
    // Post/Redirect/Get: a refresh after saving re-runs a GET, not the POST.
    return redirect(`/projects/${id}`);
  }

  return [
    {
      path: '/',
      Component: Layout,
      HydrateFallback: Booting,
      children: [{ path: 'projects/:projectId', loader, action, Component: ProjectPage, ErrorBoundary: ProjectErrorBoundary }],
    },
  ];
}
