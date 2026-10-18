import { expect, test } from '@playwright/test';

/** Each attempt records the worker process it ran in; the parent spec reads it from the JSON report. */
test.beforeEach(async ({}, testInfo) => {
  testInfo.annotations.push({ type: 'pid', description: String(process.pid) });
});

test('fails on its first attempt', async ({}, testInfo) => {
  expect(testInfo.retry).toBe(1);
});

test('runs after the failure', async () => {
  expect(true).toBe(true);
});
