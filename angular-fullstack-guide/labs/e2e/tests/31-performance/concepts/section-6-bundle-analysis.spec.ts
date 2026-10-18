import { expect, test } from '@playwright/test';
import { distFile } from '../support/perf.js';

/** The esbuild metafile written by `ng build --stats-json`, and the source files the tests look for. */
const STATS_FILE = 'browser-stats.json';
const ROUTES_SOURCE = 'modules/31-performance/demo/routes.ts';
const FIXTURE_DIR = 'demo/tree-shaking/';
const ANGULAR_CORE = 'node_modules/@angular/core/';

/** Output names: the one initial file the build names `main-<hash>.js`, and any built script. */
const MAIN_FILE = /(^|\/)main-[A-Za-z0-9_-]+\.js$/;
const SCRIPT_FILE = /\.js$/;
const BROWSER_PREFIX = /^browser\//;

/** One marker string per fixture module under `demo/tree-shaking/`. */
const MARKER_USED = 'M31_MARKER_USED';
const MARKER_UNUSED_PURE = 'M31_MARKER_UNUSED_PURE';
const MARKER_SIDE_EFFECT = 'M31_MARKER_SIDE_EFFECT';
const MARKER_STATIC_BLOCK = 'M31_MARKER_STATIC_BLOCK';

/** The fields of a metafile output this spec reads: `inputs[*].bytesInOutput` and `imports`. */
interface OutputImport {
  path: string;
  kind: string;
}
interface OutputEntry {
  inputs: Map<string, number>;
  imports: OutputImport[];
}
interface ImportEdge {
  from: string;
  to: string;
  kind: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function required<T>(value: T | undefined, message: string): T {
  if (value === undefined) throw new Error(message);
  return value;
}

function toImport(value: unknown): OutputImport[] {
  if (!isRecord(value)) return [];
  const { path, kind } = value;
  return typeof path === 'string' && typeof kind === 'string' ? [{ path, kind }] : [];
}

function toInput([path, value]: [string, unknown]): [string, number] {
  const bytes = isRecord(value) ? value['bytesInOutput'] : undefined;
  if (typeof bytes !== 'number') throw new Error(`${STATS_FILE}: ${path} has no numeric bytesInOutput`);
  return [path, bytes];
}

function toOutput(value: unknown): OutputEntry {
  if (!isRecord(value)) throw new Error(`${STATS_FILE}: an output is not an object`);
  const inputs: unknown = value['inputs'];
  const rawImports: unknown = value['imports'];
  if (!isRecord(inputs)) throw new Error(`${STATS_FILE}: an output has no inputs map`);
  const imports: readonly unknown[] = Array.isArray(rawImports) ? rawImports : [];
  return { inputs: new Map(Object.entries(inputs).map(toInput)), imports: imports.flatMap(toImport) };
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

function mainOutput(outputs: Map<string, OutputEntry>): string {
  return required([...outputs.keys()].find((path) => MAIN_FILE.test(path)), `no main-*.js in ${STATS_FILE}`);
}

/** Shortest chain of imports (any kind) from `start` to `target`, or undefined when there is none. */
function importerChain(outputs: Map<string, OutputEntry>, start: string, target: string): ImportEdge[] | undefined {
  const via = new Map<string, ImportEdge>();
  const queue = [start];
  for (let index = 0; index < queue.length && !via.has(target); index += 1) {
    const from = required(queue[index], 'queue index out of range');
    for (const { path: to, kind } of outputs.get(from)?.imports ?? []) {
      if (to === start || via.has(to)) continue;
      via.set(to, { from, to, kind });
      queue.push(to);
    }
  }
  const chain: ImportEdge[] = [];
  for (let edge = via.get(target); edge !== undefined; edge = via.get(edge.from)) chain.unshift(edge);
  return chain.length > 0 ? chain : undefined;
}

/** Every output reached from `start` through static `import` statements only: the files that load with it. */
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

/** The built script outputs whose text contains `marker`, read from the build's `browser/` folder. */
async function scriptsContaining(outputs: Map<string, OutputEntry>, marker: string): Promise<string[]> {
  const found: string[] = [];
  for (const path of outputs.keys()) {
    if (!SCRIPT_FILE.test(path)) continue;
    const text = await distFile(`browser/${path.replace(BROWSER_PREFIX, '')}`);
    if (text.includes(marker)) found.push(path);
  }
  return found;
}

test('Section 6: the stats file lists the initial outputs and their inputs', async () => {
  const outputs = await readOutputs();
  const main = mainOutput(outputs);
  const initial = [...staticallyReachable(outputs, main)];
  const initialInputs = initial.flatMap((path) => [...required(outputs.get(path), `no output ${path}`).inputs]);

  expect(initialInputs.length).toBeGreaterThan(0);
  expect(initialInputs.some(([input]) => input.includes(ANGULAR_CORE))).toBe(true);
  expect(initialInputs.every(([, bytes]) => bytes >= 0)).toBe(true);
  // The fixture is reached only through the lazy route, so none of its modules is an initial input.
  expect(initialInputs.some(([input]) => input.includes(FIXTURE_DIR))).toBe(false);
});

test('Section 6: the importer chain leads from main to the module-31 routes file', async () => {
  const outputs = await readOutputs();
  const main = mainOutput(outputs);
  const routesChunk = required(
    [...outputs].find(([, entry]) => [...entry.inputs.keys()].some((input) => input.includes(ROUTES_SOURCE)))?.[0],
    `no output contains ${ROUTES_SOURCE}`,
  );

  const chain = required(importerChain(outputs, main, routesChunk), 'main does not reach the routes chunk');
  expect(chain[0]?.from).toBe(main);
  expect(chain[chain.length - 1]?.to).toBe(routesChunk);
  expect(chain[0]?.kind).toBe('dynamic-import');
});

test('Section 6: an unused pure export is absent from the production chunk', async () => {
  const outputs = await readOutputs();

  expect(await scriptsContaining(outputs, MARKER_USED)).not.toHaveLength(0);
  expect(await scriptsContaining(outputs, MARKER_UNUSED_PURE)).toHaveLength(0);
});

test('Section 6: a module with a top-level side effect stays in the chunk although nothing uses its export', async () => {
  const outputs = await readOutputs();
  const main = mainOutput(outputs);
  const initial = staticallyReachable(outputs, main);

  const sideEffect = await scriptsContaining(outputs, MARKER_SIDE_EFFECT);
  expect(sideEffect).not.toHaveLength(0);
  expect(sideEffect.some((path) => initial.has(path))).toBe(false);
  // A class whose static block writes to the global object is kept for the same reason.
  expect(await scriptsContaining(outputs, MARKER_STATIC_BLOCK)).not.toHaveLength(0);
});
