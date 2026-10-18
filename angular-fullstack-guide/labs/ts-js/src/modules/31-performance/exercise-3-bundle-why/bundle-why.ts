import type { Metafile } from './metafile';

/** Label for every input that is not under `node_modules`: the team's own code. */
export const APP_LABEL = '(app)';

const NODE_MODULES = 'node_modules/';

/** Signature shared by both chain strategies. */
export type ChainFinder = (meta: Metafile, from: string, to: string) => string[] | null;

/**
 * Names the package an input path belongs to.
 * @param path - An input key of the metafile, such as `node_modules/@angular/core/fesm2022/core.mjs`.
 * @returns `@scope/name` or `name` from the last `node_modules/` segment, or `(app)` when there is none.
 */
export function packageOf(path: string): string {
  // The last segment wins so a package nested in another package's node_modules is credited to itself.
  const at = path.lastIndexOf(NODE_MODULES);
  if (at === -1) return APP_LABEL;
  const [first = '', second = ''] = path.slice(at + NODE_MODULES.length).split('/');
  return first.startsWith('@') ? `${first}/${second}` : first;
}

/**
 * Sums the bytes each package contributes to the given output files.
 * @param meta - The parsed metafile.
 * @param initialFiles - Output keys that load at start, such as `main-XXXX.js`; unknown keys are skipped.
 * @returns Bytes written to those outputs (`bytesInOutput`), keyed by package or `(app)`.
 */
export function initialBytesByPackage(meta: Metafile, initialFiles: readonly string[]): Record<string, number> {
  const totals = new Map<string, number>();
  for (const file of initialFiles) {
    for (const [input, { bytesInOutput }] of Object.entries(meta.outputs[file]?.inputs ?? {})) {
      const name = packageOf(input);
      totals.set(name, (totals.get(name) ?? 0) + bytesInOutput);
    }
  }
  return Object.fromEntries(totals);
}

// Dynamic imports are left out: they load after start, so they never explain what the initial chunk holds.
function staticTargets(meta: Metafile, path: string): string[] {
  return (meta.inputs[path]?.imports ?? [])
    .filter((edge) => edge.kind !== 'dynamic-import' && edge.external !== true && edge.path in meta.inputs)
    .map((edge) => edge.path);
}

/**
 * Finds the shortest static import chain by breadth-first search from the importer.
 * @param meta - The parsed metafile.
 * @param from - Input path to start at, usually the entry point.
 * @param to - Input path to explain.
 * @returns Input paths from `from` to `to`, or null when `to` cannot be reached through static imports.
 */
export function importChainBfs(meta: Metafile, from: string, to: string): string[] | null {
  if (!(from in meta.inputs) || !(to in meta.inputs)) return null;
  const previous = new Map<string, string | null>([[from, null]]);
  const queue = [from];
  for (const current of queue) {
    for (const next of staticTargets(meta, current)) {
      if (previous.has(next)) continue;
      previous.set(next, current);
      queue.push(next);
    }
  }
  if (!previous.has(to)) return null;
  const chain: string[] = [];
  for (let step: string | null | undefined = to; step != null; step = previous.get(step)) chain.push(step);
  return chain.reverse();
}

/**
 * Finds the shortest static import chain from a reverse-importer index walked from the target.
 * @param meta - The parsed metafile.
 * @param from - Input path to start at, usually the entry point.
 * @param to - Input path to explain.
 * @returns Input paths from `from` to `to`, or null when `to` cannot be reached through static imports.
 */
export function importChainReverse(meta: Metafile, from: string, to: string): string[] | null {
  if (!(from in meta.inputs) || !(to in meta.inputs)) return null;
  const importers = new Map<string, string[]>();
  for (const path of Object.keys(meta.inputs)) {
    for (const target of staticTargets(meta, path)) importers.set(target, [...(importers.get(target) ?? []), path]);
  }
  // Each importer remembers the module it was reached from, so the walk back to `to` is the chain.
  const toward = new Map<string, string | null>([[to, null]]);
  const queue = [to];
  for (const current of queue) {
    for (const importer of importers.get(current) ?? []) {
      if (toward.has(importer)) continue;
      toward.set(importer, current);
      queue.push(importer);
    }
  }
  if (!toward.has(from)) return null;
  const chain: string[] = [];
  for (let step: string | null | undefined = from; step != null; step = toward.get(step)) chain.push(step);
  return chain;
}

/**
 * Explains why a module is in the initial chunk: the shortest static chain from the entry point to it.
 * @param meta - The parsed metafile.
 * @param from - Input path to start at, usually the entry point.
 * @param to - Input path to explain.
 * @returns Input paths from `from` to `to`, or null when none exists.
 */
export const importChain: ChainFinder = importChainBfs;
