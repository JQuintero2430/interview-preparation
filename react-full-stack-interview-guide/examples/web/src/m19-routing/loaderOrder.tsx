import { createMemoryRouter, data, useParams, type ActionFunctionArgs, type MiddlewareFunction } from 'react-router';
import { Booting } from './renderRouter';

// Every middleware, loader and action call writes here, in the order it happened.
export const log: string[] = [];

// A macrotask: every loader that starts in the same tick logs "start" before any logs "end".
const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

function loggedLoader(name: string) {
  return async () => {
    log.push(`${name} loader start`);
    await tick();
    log.push(`${name} loader end`);
    return name;
  };
}

const rootMiddleware: MiddlewareFunction = async ({ request }, next) => {
  log.push(`root middleware before ${request.method}`);
  await next();
  log.push(`root middleware after ${request.method}`);
};

async function tasksAction({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  log.push('tasks action');
  if (form.get('title') === '') {
    // A 4xx from an action: the router skips the automatic revalidation.
    return data({ error: 'Title is required' }, { status: 422 });
  }
  return { ok: true };
}

function TasksPage() {
  const { projectId } = useParams();
  return <h1>Tasks for {projectId}</h1>;
}

/**
 * root (middleware + loader) → projects/:projectId (loader) → tasks (loader + action).
 * The router starts loading as soon as it is created.
 */
export function createLoaderOrderRouter(initialEntry: string) {
  return createMemoryRouter(
    [
      {
        id: 'root',
        path: '/',
        middleware: [rootMiddleware],
        loader: loggedLoader('root'),
        HydrateFallback: Booting,
        children: [
          {
            id: 'project',
            path: 'projects/:projectId',
            loader: loggedLoader('project'),
            children: [
              {
                id: 'tasks',
                path: 'tasks',
                loader: loggedLoader('tasks'),
                action: tasksAction,
                Component: TasksPage,
              },
            ],
          },
        ],
      },
    ],
    { initialEntries: [initialEntry] },
  );
}

/** A urlencoded POST body, like the one `<Form method="post">` builds. */
export function formWith(fields: Record<string, string>) {
  const form = new FormData();
  for (const [name, value] of Object.entries(fields)) form.append(name, value);
  return form;
}
