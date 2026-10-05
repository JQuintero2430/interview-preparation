import { useEffect, useRef } from 'react';
import {
  Link,
  useLoaderData,
  useNavigation,
  useSearchParams,
  type LoaderFunctionArgs,
  type RouteObject,
} from 'react-router';
import { parseStatus, type Project, type ProjectStatus, type ProjectStore } from '../projectStore';
import { Booting } from '../renderRouter';

type ProjectsData = { projects: Project[]; q: string; status: ProjectStatus | '' };

type FilterKey = 'q' | 'status';

/** The URL is the single source of truth: the loader reads the filters from it. */
export function createProjectsLoader(store: ProjectStore) {
  return ({ url }: LoaderFunctionArgs): ProjectsData => {
    const q = url.searchParams.get('q') ?? '';
    const status = parseStatus(url.searchParams.get('status'));
    return { projects: store.list({ q, status }), q, status };
  };
}

/**
 * Returns a copy of `params` with one filter set, or removed when empty, so the URL never
 * carries `?q=` noise. Every other param (paging, sort…) is preserved.
 */
export function withFilter(params: URLSearchParams, key: FilterKey, value: string): URLSearchParams {
  const next = new URLSearchParams(params);
  if (value) next.set(key, value);
  else next.delete(key);
  return next;
}

/**
 * Keeps an uncontrolled field in step with the URL (Back/Forward, "Clear filters").
 * A controlled `value={q}` would lag: in a data router the URL, and so `q`, only change after
 * the loader finishes, and React would reset the field to the old value on every keystroke.
 */
function useSyncFieldWithUrl<T extends HTMLInputElement | HTMLSelectElement>(value: string) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (ref.current) ref.current.value = value;
  }, [value]);
  return ref;
}

export function ProjectsPage() {
  const { projects, q, status } = useLoaderData<ProjectsData>();
  const [, setSearchParams] = useSearchParams();
  const navigation = useNavigation();
  const searchRef = useSyncFieldWithUrl<HTMLInputElement>(q);
  const statusRef = useSyncFieldWithUrl<HTMLSelectElement>(status);

  // Typing replaces the history entry (no Back-button spam); picking a status pushes one.
  const update = (key: FilterKey, value: string) =>
    setSearchParams((prev) => withFilter(prev, key, value), { replace: key === 'q' });

  return (
    <>
      <h1>Projects</h1>
      <search>
        <label htmlFor="project-search">Search projects</label>
        <input
          id="project-search"
          type="search"
          ref={searchRef}
          defaultValue={q}
          onChange={(e) => update('q', e.target.value)}
        />
        <label htmlFor="project-status">Status</label>
        <select
          id="project-status"
          ref={statusRef}
          defaultValue={status}
          onChange={(e) => update('status', e.target.value)}
        >
          <option value="">All</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
        <Link to="/projects">Clear filters</Link>
      </search>
      {projects.length === 0 ? (
        <p role="status">No projects match these filters.</p>
      ) : (
        <ul aria-label="Projects" aria-busy={navigation.state === 'loading'}>
          {projects.map((p) => (
            <li key={p.id}>{p.name}</li>
          ))}
        </ul>
      )}
    </>
  );
}

export function createProjectsRoutes(store: ProjectStore): RouteObject[] {
  return [
    {
      path: '/projects',
      loader: createProjectsLoader(store),
      HydrateFallback: Booting,
      Component: ProjectsPage,
    },
  ];
}
