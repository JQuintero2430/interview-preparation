import { expect, test } from '@playwright/test';

test('fails on its first attempt', async ({}, testInfo) => {
  expect(testInfo.retry).toBe(1);
});
