import { planInOrder, planShards, type Planner, type TestFile } from './shard-plan';
import { classify, quarantine, type Attempt, type History } from './flaky';

// A seeded generator keeps the property run the same every time (no Math.random).
function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomFiles(seed: number): TestFile[] {
  const next = mulberry32(seed);
  const count = 1 + Math.floor(next() * 30);
  return Array.from({ length: count }, (_, i) => ({ file: `f${i}.spec.ts`, ms: 1 + Math.floor(next() * 600) }));
}

const SAMPLE: TestFile[] = [
  { file: 'checkout.spec.ts', ms: 90 },
  { file: 'login.spec.ts', ms: 20 },
  { file: 'search.spec.ts', ms: 45 },
  { file: 'todos.spec.ts', ms: 60 },
  { file: 'profile.spec.ts', ms: 20 },
];

const variants: [string, Planner][] = [
  ['longest-processing-time-first', planShards],
  ['list scheduling in input order', planInOrder],
];

const loads = (plan: string[][], files: readonly TestFile[]): number[] => {
  const ms = new Map(files.map((f) => [f.file, f.ms]));
  return plan.map((shard) => shard.reduce((sum, file) => sum + (ms.get(file) ?? 0), 0));
};

describe.each(variants)('E30.3 shard plan (%s)', (_name, plan) => {
  it('puts every file in exactly one shard', () => {
    for (let seed = 1; seed <= 200; seed++) {
      const files = randomFiles(seed);
      const shards = 1 + (seed % 6);
      const planned = plan(files, shards);
      expect(planned).toHaveLength(shards);
      expect(planned.flat().sort()).toEqual(files.map((f) => f.file).sort());
    }
  });

  it('gives the same plan for the same input', () => {
    const copy = SAMPLE.map((f) => ({ ...f }));
    expect(plan(SAMPLE, 3)).toEqual(plan(copy, 3));
    expect(SAMPLE).toEqual(copy);
  });

  it('keeps every shard within the average load plus the longest file', () => {
    for (let seed = 1; seed <= 200; seed++) {
      const files = randomFiles(seed);
      const shards = 1 + (seed % 6);
      const total = files.reduce((sum, f) => sum + f.ms, 0);
      const longest = Math.max(...files.map((f) => f.ms));
      for (const load of loads(plan(files, shards), files)) {
        // load <= total / shards + longest, multiplied through to stay in integers
        expect(load * shards).toBeLessThanOrEqual(total + longest * shards);
      }
    }
  });
});

describe('E30.3 shard plan trade-off', () => {
  it('sorting gives a shorter longest shard on [1, 1, 1, 1, 4] over two shards', () => {
    const files = [1, 1, 1, 1, 4].map((ms, i) => ({ file: `f${i}.spec.ts`, ms }));
    expect(Math.max(...loads(planInOrder(files, 2), files))).toBe(6);
    expect(Math.max(...loads(planShards(files, 2), files))).toBe(4);
  });
});

describe('E30.3 flaky tests', () => {
  const run = (...attempts: Attempt[]): Attempt[] => attempts;

  it('classifies a test that failed and then passed as flaky', () => {
    expect(classify(['failed', 'passed'])).toBe('flaky');
    expect(classify(['failed', 'failed', 'passed'])).toBe('flaky');
    expect(classify(['passed'])).toBe('passed');
    expect(classify(['failed', 'failed'])).toBe('failed');
    expect(classify(['skipped'])).toBe('skipped');
  });

  it('quarantines a test that was flaky in at least 2 of its last 5 runs', () => {
    const history: History = {
      'a flaky one': [run('failed', 'passed'), run('passed'), run('passed'), run('failed', 'passed'), run('passed')],
      'an old flake': [run('failed', 'passed'), run('failed', 'passed'), run('passed'), run('passed'), run('passed'), run('passed'), run('passed')],
      'one flake only': [run('passed'), run('passed'), run('failed', 'passed'), run('passed'), run('passed')],
      'always green': [run('passed'), run('passed')],
    };
    expect(quarantine(history, { window: 5, threshold: 2 })).toEqual(['a flaky one']);
  });

  it('never quarantines a test that fails on every attempt', () => {
    const history: History = {
      'broken with retries': Array.from({ length: 5 }, () => run('failed', 'failed', 'failed')),
      'broken without retries': Array.from({ length: 5 }, () => run('failed')),
    };
    expect(quarantine(history, { window: 5, threshold: 1 })).toEqual([]);
  });
});
