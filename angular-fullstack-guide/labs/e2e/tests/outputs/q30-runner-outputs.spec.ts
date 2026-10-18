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

// Q30.15: one test fails on attempt 0 and passes on its retry (`retries: 1`).
test('Q30.15 a test that passes on its retry is reported flaky: exit code 0, and 1 with --fail-on-flaky-tests', async ({}, testInfo) => {
  const plain = runNested('retry-project', [], testInfo);
  const strict = runNested('retry-project', ['--fail-on-flaky-tests'], testInfo);
  const [spec] = plain.report.suites.flatMap((suite) => suite.specs);
  const [pwTest] = spec?.tests ?? [];

  expect(pwTest?.status).toBe('flaky');
  expect(pwTest?.results.map((result) => result.status)).toEqual(['failed', 'passed']);
  expect(plain.report.stats.flaky).toBe(1);
  expect(plain.report.stats.unexpected).toBe(0);
  expect(plain.status).toBe(0);
  expect(strict.status).toBe(1);
});

// Q30.18: `--shard=2/3` over a.spec.ts (3 tests) and b, c, d (1 test each).
async function shardTwo(extraArgs: readonly string[], testInfo: TestInfo): Promise<string[]> {
  const { status, report } = runNested('shard-project', ['--list', '--shard=2/3', ...extraArgs], testInfo);
  expect(status).toBe(0);
  return listTests(report.suites);
}

test('Q30.18 without fullyParallel shard 2 runs only b1; with fullyParallel it runs a3 and b1', async ({}, testInfo) => {
  expect(await shardTwo([], testInfo)).toEqual(['b.spec.ts:b1']);
  expect(await shardTwo(['--fully-parallel'], testInfo)).toEqual(['a.spec.ts:a3', 'b.spec.ts:b1']);
});
