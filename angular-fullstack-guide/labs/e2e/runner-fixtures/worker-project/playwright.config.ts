import { defineConfig } from '@playwright/test';

/** Browserless project for §9's nested run: one worker, one retry, so attempt order and worker changes are deterministic. */
export default defineConfig({
  testDir: '.',
  workers: 1,
  retries: 1,
});
