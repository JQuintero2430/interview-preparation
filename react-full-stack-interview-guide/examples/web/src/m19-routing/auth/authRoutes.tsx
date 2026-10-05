import {
  data,
  Form,
  Link,
  Outlet,
  redirect,
  useActionData,
  useLoaderData,
  useSearchParams,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type RouteObject,
} from 'react-router';
import { Booting } from '../renderRouter';
import { requireUser, safeRedirect, userContext, type Session } from './session';

export type Settings = { theme: 'light' | 'dark' };

type LoginActionData = { error: string };

/** Loader of the protected layout: the middleware already put the user in context. */
export function appLoader({ context }: LoaderFunctionArgs) {
  return { user: context.get(userContext) };
}

function Shell() {
  return (
    <>
      <nav aria-label="Main">
        <Link to="/">Home</Link> <Link to="/app">App</Link> <Link to="/app/settings">Settings</Link>
      </nav>
      <main>
        <Outlet />
      </main>
    </>
  );
}

function LoginPage() {
  const [searchParams] = useSearchParams();
  const actionData = useActionData<LoginActionData>();
  return (
    <>
      <h1>Sign in</h1>
      <Form method="post">
        <input type="hidden" name="redirectTo" value={searchParams.get('redirectTo') ?? ''} />
        <label htmlFor="login-name">Name</label>
        <input
          id="login-name"
          name="name"
          aria-invalid={actionData ? true : undefined}
          aria-describedby={actionData ? 'login-error' : undefined}
        />
        {actionData && (
          <p id="login-error" role="alert" aria-live="polite">
            {actionData.error}
          </p>
        )}
        <button type="submit">Sign in</button>
      </Form>
    </>
  );
}

function AppLayout() {
  const { user } = useLoaderData<typeof appLoader>();
  return (
    <section aria-label="App">
      <p>Signed in as {user.name}</p>
      <Form method="post" action="/logout">
        <button type="submit">Sign out</button>
      </Form>
      <Outlet />
    </section>
  );
}

function Dashboard() {
  return <h1>Dashboard</h1>;
}

function SettingsPage() {
  const settings = useLoaderData<Settings>();
  return <h1>Settings ({settings.theme})</h1>;
}

/**
 * Exercise 1. The guard lives on the `/app` layout route as middleware, so it protects every
 * child (present and future) and runs before any of their loaders.
 */
export function createAuthRoutes({ session, loadSettings }: { session: Session; loadSettings: () => Settings }) {
  async function loginAction({ request }: ActionFunctionArgs) {
    const form = await request.formData();
    const name = String(form.get('name') ?? '').trim();
    if (!name) return data<LoginActionData>({ error: 'Enter your name' }, { status: 400 });
    session.user = { name };
    return redirect(safeRedirect(form.get('redirectTo') || null));
  }

  function logoutAction() {
    session.user = null;
    return redirect('/login');
  }

  const routes: RouteObject[] = [
    {
      path: '/',
      Component: Shell,
      HydrateFallback: Booting,
      children: [
        { index: true, element: <h1>Home</h1> },
        { path: 'login', action: loginAction, Component: LoginPage },
        { path: 'logout', action: logoutAction },
        {
          path: 'app',
          middleware: [requireUser(session)],
          loader: appLoader,
          Component: AppLayout,
          children: [
            { index: true, Component: Dashboard },
            { path: 'settings', loader: () => loadSettings(), Component: SettingsPage },
          ],
        },
      ],
    },
  ];
  return routes;
}
