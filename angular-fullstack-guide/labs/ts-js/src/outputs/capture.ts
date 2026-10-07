// Shared helper for "what does this print?" questions: runs a snippet with console.log
// redirected into an array, so a test can assert the exact printed lines.
// Lines are formatted with util.format, which is what console.log uses, so an asserted line is
// exactly what Node prints (`-0`, `10n`, `[ 1, 2 ]`, `{ a: 1 }`), not what String() gives
// (`0`, `10`, `1,2`, `[object Object]`). The lab has no @types/node, so the module is typed by hand.
const utilSpecifier = 'node:util';
const { format } = (await import(utilSpecifier)) as { format: (...args: unknown[]) => string };

export async function captureLogs(run: (log: (...args: unknown[]) => void) => unknown): Promise<string[]> {
  const lines: string[] = [];
  const log = (...args: unknown[]) => lines.push(format(...args));
  await run(log);
  return lines;
}

// Waits until every queued microtask and the next macrotask have run.
export function flushTasks(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}
