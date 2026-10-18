import { defineConfig } from '@playwright/test';

/** Browserless project for Q30.15: one test that fails on its first attempt, with one retry allowed. */
export default defineConfig({
  testDir: '.',
  workers: 1,
  retries: 1,
});
