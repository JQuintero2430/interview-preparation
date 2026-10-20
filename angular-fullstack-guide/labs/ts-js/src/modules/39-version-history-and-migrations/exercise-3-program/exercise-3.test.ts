// Exercise 39.3: five criteria, each run over both schedulers (our code; the edges are read from angular.dev's
// migration and zoneless docs, 2026-10-19, and section 10's recommendation). No clock, network, git, npm or ng.
import { scheduler as kahn } from './a/schedule';
import { scheduler as depthFirst } from './b/schedule';
import { CycleError, program } from './program';
import type { Migration, Prerequisite, Scheduler } from './program';

const CHECKS = ['build', 'tests', 'render check', 'commit'];

const migration = (id: string, ...needs: string[]): Migration => ({
  id,
  track: 'components',
  scope: 'workspace',
  prerequisites: needs.map((need): Prerequisite => ({ id: need, source: 'docs' })),
});

interface Expected {
  readonly order: string[];
  readonly cycle: string[];
}

describe.each<[string, Scheduler, Expected]>([
  [
    'a (Kahn)',
    kahn,
    {
      order: ['control-flow', 'application-builder', 'standalone', 'route-lazy-loading', 'signal-apis', 'onpush-review', 'no-ngzone-waits', 'zoneless', 'inject', 'vitest-runner', 'animations-to-css'],
      cycle: ['a', 'b', 'c'],
    },
  ],
  [
    'b (depth-first)',
    depthFirst,
    {
      order: ['signal-apis', 'onpush-review', 'no-ngzone-waits', 'zoneless', 'standalone', 'route-lazy-loading', 'control-flow', 'application-builder', 'inject', 'vitest-runner', 'animations-to-css'],
      cycle: ['a', 'b'],
    },
  ],
])('Exercise 39.3 · migration scheduler %s', (_variant, scheduler, expected) => {
  it('schedules every migration after its prerequisites', () => {
    const ids = scheduler.order(program).map((m) => m.id);
    expect(ids).toEqual(expected.order);
    for (const m of program.migrations) {
      for (const p of m.prerequisites) expect(ids.indexOf(p.id)).toBeLessThan(ids.indexOf(m.id));
    }
    // The program carries section 10's four edges: three read from the docs, one our recommendation.
    const edges = program.migrations.flatMap((m) => m.prerequisites.map((p) => `${p.id} -> ${m.id} (${p.source})`)).sort();
    expect(edges).toEqual([
      'no-ngzone-waits -> zoneless (docs)',
      'onpush-review -> zoneless (docs)',
      'signal-apis -> onpush-review (recommendation)',
      'standalone -> route-lazy-loading (docs)',
    ]);
  });

  it('reports a cycle in the prerequisites', () => {
    const cyclic = { ...program, migrations: [migration('a', 'b'), migration('b', 'a'), migration('c', 'a')] };
    expect(() => scheduler.order(cyclic)).toThrow(CycleError);
    expect(() => scheduler.order(cyclic)).toThrow(`the prerequisites contain a cycle: ${expected.cycle.join(', ')}`);
    expect(() => scheduler.schedule(program)).not.toThrow();
  });

  it('splits a migration into batches that stay within the component cap', () => {
    const groupsOf = (cap: number, id: string): string[][] =>
      scheduler
        .schedule({ ...program, cap })
        .filter((pr) => pr.migration === id)
        .map((pr) => [...pr.folders]);
    expect(groupsOf(50, 'standalone')).toEqual([['orders'], ['billing'], ['shared', 'admin'], ['reports']]);
    expect(scheduler.schedule(program).filter((pr) => pr.migration === 'standalone').map((pr) => pr.components)).toEqual([40, 25, 42, 20]);
    expect(groupsOf(60, 'standalone')).toEqual([['orders'], ['billing', 'shared'], ['admin', 'reports']]);
    expect(scheduler.schedule({ ...program, cap: 60 }).every((pr) => pr.components <= 60)).toBe(true);
    expect(() => scheduler.schedule({ ...program, cap: 30 })).toThrow('folder orders has 40 components, above the cap of 30');
  });

  it('adds a checkpoint after every batch', () => {
    const requests = scheduler.schedule(program);
    expect(requests).toHaveLength(32);
    for (const pr of requests) expect(pr.checkpoint).toEqual(CHECKS);
  });

  it('keeps independent tracks in separate pull requests', () => {
    const requests = scheduler.schedule(program);
    const trackOf = new Map(program.migrations.map((m) => [m.id, m.track]));
    expect(requests.every((pr) => pr.track === trackOf.get(pr.migration))).toBe(true);
    for (const track of ['builder', 'tests', 'animations']) {
      const own = requests.filter((pr) => pr.track === track);
      expect(own).toHaveLength(1);
      expect(own[0]?.folders).toEqual([]);
    }
    // The pull requests follow the migration order, each migration's batches together.
    const migrations = requests.map((pr) => pr.migration).filter((id, i, all) => id !== all[i - 1]);
    expect(migrations).toEqual(expected.order);
  });
});
