import { expect, test } from '@playwright/test';
import { distFile } from '../support/perf.js';

/** Lazy chunk file names (mixed-case hash), and the one initial JS file the build names `main-<hash>.js`. */
const CHUNK_FILE = /\/chunk-[A-Za-z0-9_-]+\.js$/;
const MAIN_FILE = /(^|\/)main-[A-Za-z0-9_-]+\.js$/;

/** The esbuild metafile written by `ng build --stats-json`, and the source file the second test looks for. */
const STATS_FILE = 'browser-stats.json';
const ROUTES_SOURCE = 'modules/31-performance/demo/routes.ts';

/** Text on the loading lab page. */
const PAGE_HEADING = 'Loading lab';
const PLACEHOLDER_TEXT = 'The report loads when you ask for it.';
const TRIGGER_LABEL = 'Show the quarterly report';
const PANEL_HEADING = 'Quarterly report';

/** The two fields of a metafile output entry this spec reads. */
interface OutputImport {
  path: string;
  kind: string;
}
interface OutputEntry {
  inputs: string[];
  imports: OutputImport[];
}

/** True when a request URL names a lazy chunk. */
function isChunk(url: string): boolean {
  return CHUNK_FILE.test(new URL(url).pathname);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toImport(value: unknown): OutputImport[] {
  if (!isRecord(value)) return [];
  const { path, kind } = value;
  return typeof path === 'string' && typeof kind === 'string' ? [{ path, kind }] : [];
}

function toOutput(value: unknown): OutputEntry {
  if (!isRecord(value)) throw new Error(`${STATS_FILE}: an output is not an object`);
  const inputs: unknown = value['inputs'];
  const rawImports: unknown = value['imports'];
  if (!isRecord(inputs)) throw new Error(`${STATS_FILE}: an output has no inputs map`);
  const imports: readonly unknown[] = Array.isArray(rawImports) ? rawImports : [];
  return { inputs: Object.keys(inputs), imports: imports.flatMap(toImport) };
}

/** Reads `browser-stats.json` through `distFile` and returns its `outputs`, keyed by output path. */
async function readOutputs(): Promise<Map<string, OutputEntry>> {
  const text = await distFile(STATS_FILE).catch(() => {
    throw new Error(`${STATS_FILE} not found: the webServer build must run with --stats-json`);
  });
  const parsed: unknown = JSON.parse(text);
  const outputs: unknown = isRecord(parsed) ? parsed['outputs'] : undefined;
  if (!isRecord(outputs)) throw new Error(`${STATS_FILE} has no outputs map`);
  return new Map(Object.entries(outputs).map(([path, entry]): [string, OutputEntry] => [path, toOutput(entry)]));
}

/** Every output reached from `start` through static `import` statements only: what loads with it. */
function staticallyReachable(outputs: Map<string, OutputEntry>, start: string): Set<string> {
  const seen = new Set<string>([start]);
  const queue = [start];
  for (let next = queue.pop(); next !== undefined; next = queue.pop()) {
    for (const { path, kind } of outputs.get(next)?.imports ?? []) {
      if (kind !== 'import-statement' || seen.has(path)) continue;
      seen.add(path);
      queue.push(path);
    }
  }
  return seen;
}

function required<T>(value: T | undefined, message: string): T {
  if (value === undefined) throw new Error(message);
  return value;
}

test("Section 5: the deferred block's chunk is requested only after the trigger", async ({ page }) => {
  const requested = new Set<string>();
  page.on('request', (request) => {
    if (isChunk(request.url())) requested.add(request.url());
  });

  await page.goto('/m31/loading');
  await expect(page.getByRole('heading', { name: PAGE_HEADING, exact: true })).toBeVisible();
  await expect(page.getByText(PLACEHOLDER_TEXT)).toBeVisible();
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('heading', { name: PANEL_HEADING })).toHaveCount(0);

  const before = new Set(requested);
  const deferredChunk = page.waitForRequest((request) => isChunk(request.url()) && !before.has(request.url()));
  await page.getByRole('button', { name: TRIGGER_LABEL }).click();
  const request = await deferredChunk;

  expect(before.has(request.url())).toBe(false);
  await expect(page.getByRole('heading', { name: PANEL_HEADING })).toBeVisible();
  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByText(PLACEHOLDER_TEXT)).toHaveCount(0);
});

test('Section 5: the module-31 lazy route is not part of the initial files', async () => {
  const outputs = await readOutputs();
  const main = required([...outputs.keys()].find((path) => MAIN_FILE.test(path)), `no main-*.js in ${STATS_FILE}`);
  const routesChunk = required(
    [...outputs].find(([, entry]) => entry.inputs.some((input) => input.includes(ROUTES_SOURCE)))?.[0],
    `no output contains ${ROUTES_SOURCE}`,
  );

  expect(routesChunk).not.toBe(main);
  expect(routesChunk).toMatch(/(^|\/)chunk-[A-Za-z0-9_-]+\.js$/);

  const kindsFromMain = required(outputs.get(main), 'main entry missing').imports
    .filter((entry) => entry.path === routesChunk)
    .map((entry) => entry.kind);
  expect(kindsFromMain).toContain('dynamic-import');
  expect(kindsFromMain).not.toContain('import-statement');
  expect(staticallyReachable(outputs, main).has(routesChunk)).toBe(false);
});
