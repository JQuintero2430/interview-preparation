// Exercise 38.4: a pipeline planner over a fixture workspace. The changed files, the file contents,
// the cache and the failing tasks are parameters: no git, no file system, no clock.
import { files, pipeline, taskGraph, workspace, type PipelineInput } from './graph';
import { hasher } from './hash';
import { order as orderA } from './a/plan';
import { order as orderB } from './b/plan';

const allProjects = Object.keys(workspace.projects);
const input = (overrides: Partial<PipelineInput>): PipelineInput => ({
  workspace,
  files,
  changed: [],
  cache: new Set<string>(),
  ...overrides,
});
const projectOf = (task: string): string => task.slice(0, task.lastIndexOf(':'));

describe.each([
  ['a (Kahn, in waves)', orderA],
  ['b (depth-first, memoized)', orderB],
])('Exercise 38.4 · variant %s', (_name, order) => {
  it('plans tasks only for projects affected by the changed files', () => {
    const { planned } = pipeline(input({ changed: ['libs/data-access-orders/src/orders-api.ts'] }), order);
    expect([...new Set(planned.map(projectOf))].sort()).toEqual(['app-shop', 'data-access-orders', 'feature-orders']);
    expect(planned).toHaveLength(10);
    expect(planned).toContain('app-shop:e2e');
    expect(planned).not.toContain('app-admin:e2e');
    // A file outside every project that is not a global input touches nothing.
    expect(pipeline(input({ changed: ['README.md'] }), order).planned).toEqual([]);
  });

  it('plans every project when a global input changes', () => {
    const { planned } = pipeline(input({ changed: ['package.json'] }), order);
    expect([...new Set(planned.map(projectOf))].sort()).toEqual([...allProjects].sort());
    expect(planned).toHaveLength(6 * 3 + 2);
  });

  it("orders a library's build before the builds that depend on it", () => {
    const { planned } = pipeline(input({ changed: ['libs/util/src/format.ts'] }), order);
    const at = (task: string): number => planned.indexOf(task);
    for (const [name, project] of Object.entries(workspace.projects)) {
      expect(at(`${name}:lint`)).toBeLessThan(at(`${name}:test`));
      expect(at(`${name}:test`)).toBeLessThan(at(`${name}:build`));
      for (const dep of project.deps) expect(at(`${dep}:build`)).toBeLessThan(at(`${name}:build`));
    }
    expect(at('util:build')).toBeLessThan(at('ui:build'));
    expect(at('ui:build')).toBeLessThan(at('app-shop:build'));
    expect(at('app-shop:build')).toBeLessThan(at('app-shop:e2e'));
  });

  it('skips a task whose input hash is already in the cache', () => {
    const changed = ['libs/util/src/format.ts'];
    const first = pipeline(input({ changed }), order);
    expect(first.ran).toEqual(first.planned);
    const second = pipeline(input({ changed, cache: new Set(first.stored) }), order);
    expect(second.cached).toEqual(first.planned);
    expect(second.ran).toEqual([]);
    // One cached entry skips exactly that task.
    const one = pipeline(input({ changed, cache: new Set([hasher(workspace, files)('util:build')]) }), order);
    expect(one.cached).toEqual(['util:build']);
    // New contents in util change every task's hash (dependencies' inputs are part of it): nothing is cached.
    const edited = { ...files, 'libs/util/src/format.ts': 'export const formatCount = (n: number) => n.toString();' };
    expect(pipeline(input({ files: edited, changed, cache: new Set(first.stored) }), order).cached).toEqual([]);
  });

  it('stops the plan at the first failing stage and reports it', () => {
    const report = pipeline(input({ changed: ['package.json'], failing: ['ui:test', 'util:build'] }), order);
    expect(report.failed).toBe('ui:test');
    expect(report.ran.filter((task) => task.endsWith(':lint'))).toHaveLength(6);
    expect(report.ran.some((task) => task.endsWith(':build') || task.endsWith(':e2e'))).toBe(false);
    expect(report.notRun).toContain('util:build');
    expect([...report.ran, ...report.cached, 'ui:test', ...report.notRun]).toEqual(report.planned);
    expect(report.stored).toHaveLength(report.ran.length);
  });
});

it('both variants produce the same order on the full plan', () => {
  const tasks = taskGraph(workspace, allProjects);
  const lints = [...allProjects].sort().map((name) => `${name}:lint`);
  const tests = [...allProjects].sort().map((name) => `${name}:test`);
  expect(orderA(tasks)).toEqual([
    ...lints,
    ...tests,
    'util:build',
    'data-access-orders:build',
    'ui:build',
    'app-admin:build',
    'feature-orders:build',
    'app-admin:e2e',
    'app-shop:build',
    'app-shop:e2e',
  ]);
  expect(orderB(tasks)).toEqual(orderA(tasks));
});

it('an input missing from the declared inputs leaves the hash unchanged, so the cache would replay a stale result', () => {
  const edited = { ...files, 'tsconfig.base.json': '{ "compilerOptions": { "strict": false } }' };
  const undeclared = { ...workspace, globalInputs: ['package.json'] };
  expect(hasher(undeclared, edited)('app-shop:build')).toBe(hasher(undeclared, files)('app-shop:build'));
  expect(hasher(workspace, edited)('app-shop:build')).not.toBe(hasher(workspace, files)('app-shop:build'));
});
