import { defineConfig } from '@playwright/test';

/** Browserless project for shard membership: a.spec.ts holds 3 tests, b, c and d hold 1 each. */
export default defineConfig({
  testDir: '.',
});
