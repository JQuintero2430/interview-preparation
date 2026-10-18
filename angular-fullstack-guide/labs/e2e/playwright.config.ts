import { defineConfig, devices } from '@playwright/test';

const PORT = 4300;

export default defineConfig({
  testDir: './tests',
  forbidOnly: !!process.env['CI'],
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // The e2e run tests the production build (the artifact CI ships), not `ng serve`.
  webServer: [
    {
      command: 'npm --prefix ../angular run build -- --stats-json && node server/app-server.mjs',
      url: `http://localhost:${PORT}/m30/todos`,
      reuseExistingServer: !process.env['CI'],
      timeout: 180_000,
    },
    // Module 32: the production build of the `ssr-lab` project, served by its own Node server.
    {
      command: 'npm --prefix ../angular run build -- ssr-lab && node ../angular/dist/ssr-lab/server/server.mjs',
      url: 'http://localhost:4400/',
      env: { PORT: '4400' },
      reuseExistingServer: !process.env['CI'],
      timeout: 180_000,
    },
    // Module 33: the `security-lab` nonce build and its `autocsp` build, served with a fresh nonce per HTML response.
    {
      command:
        'npm --prefix ../angular run build -- security-lab && npm --prefix ../angular run build -- security-lab -c production,autocsp && node server/security-server.mjs',
      url: 'http://localhost:4500/m33/',
      env: { PORT: '4500' },
      reuseExistingServer: !process.env['CI'],
      timeout: 180_000,
    },
    // Module 34: the `i18n-lab` per-locale builds and its runtime build, served with an Accept-Language redirect on `/`.
    {
      command:
        'npm --prefix ../angular run build -- i18n-lab && npm --prefix ../angular run build -- i18n-lab -c production,runtime && node server/i18n-server.mjs',
      url: 'http://localhost:4600/en-US/',
      env: { PORT: '4600' },
      reuseExistingServer: !process.env['CI'],
      timeout: 180_000,
    },
    // Module 35: the `animations-lab` native build and its `legacy` build (@angular/animations), under `/legacy/`.
    {
      command:
        'npm --prefix ../angular run build -- animations-lab && npm --prefix ../angular run build -- animations-lab -c production,legacy && node server/animations-server.mjs',
      url: 'http://localhost:4700/',
      env: { PORT: '4700' },
      reuseExistingServer: !process.env['CI'],
      timeout: 180_000,
    },
    // Module 36: the production build of the `material-lab` project (Material theme, CDK, Aria), served by its own Node server.
    {
      command: 'npm --prefix ../angular run build -- material-lab && node server/material-server.mjs',
      url: 'http://localhost:4800/',
      env: { PORT: '4800' },
      reuseExistingServer: !process.env['CI'],
      timeout: 180_000,
    },
    // Module 37: the `elements-lab` v1, v2 and custom-element builds (service worker, Angular Elements), served by their own Node server.
    {
      command:
        'npm --prefix ../angular run build -- elements-lab && npm --prefix ../angular run build -- elements-lab --configuration v2 && npm --prefix ../angular run build -- elements-lab --configuration elements && node server/elements-server.mjs',
      url: 'http://localhost:4900/',
      env: { PORT: '4900' },
      reuseExistingServer: !process.env['CI'],
      timeout: 240_000,
    },
  ],
});
