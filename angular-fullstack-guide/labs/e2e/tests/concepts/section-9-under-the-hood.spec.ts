import { spawnSync } from 'node:child_process';
import { expect, test, type TestInfo } from '@playwright/test';
import type { JSONReport, JSONReportSuite } from '@playwright/test/reporter';

/** Runs `playwright test` on a browserless fixture project; results go only under this test's output directory. */
function runNested(project: string, args: readonly string[], testInfo: TestInfo): { status: number | null; report: JSONReport } {
  const run = spawnSync(
    'npx',
    ['playwright', 'test', '-c', `runner-fixtures/${project}/playwright.config.ts`, '--reporter=json', `--output=${testInfo.outputPath('nested')}`, ...args],
    { encoding: 'utf8' },
  );
  const report: JSONReport = JSON.parse(run.stdout);
  return { status: run.status, report };
}

/** Lists `file:title` for every test in the report, in report order. */
function listTests(suites: readonly JSONReportSuite[]): string[] {
  return suites.flatMap((suite) => [
    ...suite.specs.map((spec) => `${spec.file}:${spec.title}`),
    ...listTests(suite.suites ?? []),
  ]);
}

/** The test titles each of the three shards would run. */
function shardMembership(extraArgs: readonly string[], testInfo: TestInfo): string[][] {
  return [1, 2, 3].map((current) => {
    const { status, report } = runNested('shard-project', ['--list', `--shard=${current}/3`, ...extraArgs], testInfo);
    expect(status).toBe(0);
    return listTests(report.suites);
  });
}

test('Section 9: a failed test\'s worker is replaced before the next test', async ({}, testInfo) => {
  const { status, report } = runNested('worker-project', [], testInfo);
  const tests = report.suites.flatMap((suite) => suite.specs).map((spec) => ({ title: spec.title, test: spec.tests[0] }));
  const attempts = tests
    .flatMap(({ title, test: pwTest }) =>
      (pwTest?.results ?? []).map((result) => ({
        title,
        retry: result.retry,
        status: result.status,
        workerIndex: result.workerIndex,
        parallelIndex: result.parallelIndex,
        pid: result.annotations.find((annotation) => annotation.type === 'pid')?.description,
        start: Date.parse(result.startTime),
      })),
    )
    .sort((a, b) => a.start - b.start);

  expect(status).toBe(0);
  expect(attempts.map(({ title, retry, status: attemptStatus }) => `${title} #${retry} ${attemptStatus}`)).toEqual([
    'fails on its first attempt #0 failed',
    'fails on its first attempt #1 passed',
    'runs after the failure #0 passed',
  ]);
  const [failed, retried, next] = attempts;
  expect(failed?.pid).not.toBe(retried?.pid);
  expect(retried?.pid).toBe(next?.pid);
  expect([failed?.workerIndex, retried?.workerIndex, next?.workerIndex]).toEqual([0, 1, 1]);
  expect([failed?.parallelIndex, retried?.parallelIndex]).toEqual([0, 0]);
  expect(tests.map(({ title, test: pwTest }) => `${title}: ${pwTest?.status}`)).toEqual([
    'fails on its first attempt: flaky',
    'runs after the failure: expected',
  ]);
});

test('Section 9: without fullyParallel a whole file goes to one shard', async ({}, testInfo) => {
  expect(shardMembership([], testInfo)).toEqual([
    ['a.spec.ts:a1', 'a.spec.ts:a2', 'a.spec.ts:a3'],
    ['b.spec.ts:b1'],
    ['c.spec.ts:c1', 'd.spec.ts:d1'],
  ]);
});

test('Section 9: with fullyParallel tests are split one by one', async ({}, testInfo) => {
  expect(shardMembership(['--fully-parallel'], testInfo)).toEqual([
    ['a.spec.ts:a1', 'a.spec.ts:a2'],
    ['a.spec.ts:a3', 'b.spec.ts:b1'],
    ['c.spec.ts:c1', 'd.spec.ts:d1'],
  ]);
});
