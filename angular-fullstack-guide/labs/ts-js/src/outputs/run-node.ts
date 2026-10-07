// Shared helper for module-system claims: runs a fixture file in a real `node` child process.
// Vitest transforms modules itself, so ESM/CommonJS behavior is only trustworthy when Node's own
// loader runs the file. The lab has no @types/node, so the child_process API is typed by hand.
const childProcessSpecifier = 'node:child_process';
const { spawnSync } = (await import(childProcessSpecifier)) as {
  spawnSync: (
    command: string,
    args: string[],
    options: { encoding: 'utf8' },
  ) => { stdout: string; stderr: string; status: number | null };
};
const nodeExecutable = (Reflect.get(globalThis, 'process') as { execPath: string }).execPath;

export interface NodeRun {
  /** Everything the script wrote to stdout. */
  stdout: string;
  /** Everything it wrote to stderr (uncaught errors, warnings). */
  stderr: string;
  /** Exit code; `null` if the process was killed by a signal. */
  status: number | null;
}

/**
 * Runs `node [...nodeArgs] <fixture>` and waits for it to exit.
 * @param fixture - file URL of the script, usually `new URL('./fixtures/…', import.meta.url)`.
 * @param nodeArgs - flags placed before the script, such as `--expose-gc`.
 */
export function runNode(fixture: URL, nodeArgs: string[] = []): NodeRun {
  const { stdout, stderr, status } = spawnSync(nodeExecutable, [...nodeArgs, decodeURIComponent(fixture.pathname)], {
    encoding: 'utf8',
  });
  return { stdout, stderr, status };
}

/** The non-empty stdout lines of a run, for exact assertions on printed output. */
export function stdoutLines(run: NodeRun): string[] {
  return run.stdout.split('\n').filter((line) => line !== '');
}
