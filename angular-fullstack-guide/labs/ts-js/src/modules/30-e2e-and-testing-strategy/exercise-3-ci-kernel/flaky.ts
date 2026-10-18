// Reduced from the JSON reporter: one attempt is a result's `status` (`timedOut` counts as `failed`).
export type Attempt = 'passed' | 'failed' | 'skipped';
export type Outcome = 'passed' | 'failed' | 'flaky' | 'skipped';

// One test's runs, oldest first; each run lists its attempts (the first try, then its retries).
export type History = Readonly<Record<string, readonly (readonly Attempt[])[]>>;

export interface Policy {
  readonly window: number;
  readonly threshold: number;
}

// The runner's rule for a test expected to pass: no failed attempt is a pass, no passed attempt is a failure, a mix is flaky.
export function classify(attempts: readonly Attempt[]): Outcome {
  const passed = attempts.filter((a) => a === 'passed').length;
  const failed = attempts.filter((a) => a === 'failed').length;
  if (passed === 0 && failed === 0) return 'skipped';
  if (failed === 0) return 'passed';
  return passed === 0 ? 'failed' : 'flaky';
}

// Names, sorted, of the tests that were flaky in at least `threshold` of their last `window` runs.
export function quarantine(history: History, { window, threshold }: Policy): string[] {
  return Object.entries(history)
    .filter(([, runs]) => runs.slice(Math.max(0, runs.length - window)).filter((run) => classify(run) === 'flaky').length >= threshold)
    .map(([test]) => test)
    .sort();
}
