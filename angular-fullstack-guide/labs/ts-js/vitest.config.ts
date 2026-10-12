import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['src/**/*.test.ts'],
    // ponytail: cold TypeScript compiler-API tests (module 06) exceed the 5 s default under load; raise per test if one ever needs more.
    testTimeout: 30_000,
  },
});
