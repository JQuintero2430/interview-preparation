// Exercise 38.4: the workspace model, the fixture and the steps both variants share.
// Modeled on (not a copy of) nx 23.3.0: affected projects, then tasks, then a hash per task.
import { affected, type ProjectGraph } from '../concepts/affected';
import { hasher } from './hash';

export interface Project {
  root: string;
  type: 'app' | 'lib';
  deps: readonly string[];
}

export interface Workspace {
  projects: Readonly<Record<string, Project>>;
  /** Files outside every project whose change touches every project, such as the root package.json. */
  globalInputs: readonly string[];
}

/** The workspace's files as path -> content: a parameter, never read from disk or git. */
export type Files = Readonly<Record<string, string>>;

export const workspace: Workspace = {
  projects: {
    'app-shop': { root: 'apps/shop', type: 'app', deps: ['feature-orders', 'ui'] },
    'app-admin': { root: 'apps/admin', type: 'app', deps: ['ui'] },
    'feature-orders': { root: 'libs/feature-orders', type: 'lib', deps: ['ui', 'data-access-orders'] },
    ui: { root: 'libs/ui', type: 'lib', deps: ['util'] },
    'data-access-orders': { root: 'libs/data-access-orders', type: 'lib', deps: ['util'] },
    util: { root: 'libs/util', type: 'lib', deps: [] },
  },
  globalInputs: ['package.json', 'tsconfig.base.json'],
};

export const files: Files = {
  'package.json': '{ "name": "shop", "private": true }',
  'tsconfig.base.json': '{ "compilerOptions": { "strict": true } }',
  'README.md': '# Shop',
  'apps/shop/src/main.ts': "import { OrdersPage } from 'feature-orders';",
  'apps/admin/src/main.ts': "import { UiBadge } from 'ui';",
  'libs/feature-orders/src/orders-page.ts': "import { OrdersApi } from 'data-access-orders';",
  'libs/ui/src/badge.ts': "import { formatCount } from 'util';",
  'libs/data-access-orders/src/orders-api.ts': "import { formatCount } from 'util';",
  'libs/util/src/format.ts': 'export const formatCount = (n: number) => `${n}`;',
};

export function projectGraph(ws: Workspace): ProjectGraph {
  return Object.fromEntries(Object.entries(ws.projects).map(([name, project]) => [name, project.deps]));
}

/** A global input touches every project; any other file touches the project whose root holds it. */
export function touchedProjects(ws: Workspace, changed: readonly string[]): string[] {
  const names = Object.keys(ws.projects);
  if (changed.some((file) => ws.globalInputs.includes(file))) return names;
  return names.filter((name) => changed.some((file) => file.startsWith(`${ws.projects[name]?.root}/`)));
}

/** lint -> test -> build per project; a build also waits for its dependencies' planned builds; e2e for apps. */
export function taskGraph(ws: Workspace, projects: readonly string[]): ProjectGraph {
  const graph: Record<string, string[]> = {};
  for (const name of projects) {
    const project = ws.projects[name];
    if (!project) throw new Error(`Unknown project: ${name}`);
    graph[`${name}:lint`] = [];
    graph[`${name}:test`] = [`${name}:lint`];
    const depBuilds = project.deps.filter((dep) => projects.includes(dep)).map((dep) => `${dep}:build`);
    graph[`${name}:build`] = [`${name}:test`, ...depBuilds];
    if (project.type === 'app') graph[`${name}:e2e`] = [`${name}:build`];
  }
  return graph;
}

/** A variant's ordering: every task after the tasks it waits for. */
export type Order = (tasks: ProjectGraph) => string[];

export interface PipelineInput {
  workspace: Workspace;
  files: Files;
  changed: readonly string[];
  /** Hashes of tasks that already succeeded. */
  cache: ReadonlySet<string>;
  /** Tasks whose command exits non-zero in this run. */
  failing?: readonly string[];
}

export interface PipelineReport {
  planned: string[];
  ran: string[];
  cached: string[];
  failed?: string;
  notRun: string[];
  /** Hashes of the tasks that ran and passed: the entries to add to the cache. */
  stored: string[];
}

export function pipeline(input: PipelineInput, order: Order): PipelineReport {
  const { workspace: ws, changed, cache, failing = [] } = input;
  const projects = affected(projectGraph(ws), touchedProjects(ws, changed));
  const planned = order(taskGraph(ws, projects));
  const hashOf = hasher(ws, input.files);
  const report: PipelineReport = { planned, ran: [], cached: [], notRun: [], stored: [] };
  for (const [index, task] of planned.entries()) {
    const hash = hashOf(task);
    if (cache.has(hash)) {
      report.cached.push(task);
    } else if (failing.includes(task)) {
      report.failed = task;
      report.notRun = planned.slice(index + 1);
      break;
    } else {
      report.ran.push(task);
      report.stored.push(hash);
    }
  }
  return report;
}
