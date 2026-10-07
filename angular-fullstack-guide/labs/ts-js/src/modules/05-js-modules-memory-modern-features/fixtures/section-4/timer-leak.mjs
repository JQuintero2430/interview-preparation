// Run with: node --expose-gc timer-leak.mjs
// A WeakRef observes the report without keeping it alive. Each check waits one task first,
// because a WeakRef target read in the current job stays alive until that job ends.
const nextTask = () => new Promise((resolve) => setTimeout(resolve, 0));

function startPolling() {
  const report = { title: 'quarterly', rows: new Array(100_000).fill(0) };
  const probe = new WeakRef(report);
  const timer = setInterval(() => report.rows.length, 60_000);
  return { probe, timer };
}

const { probe, timer } = startPolling();

await nextTask();
globalThis.gc();
console.log('interval running, report alive:', probe.deref() !== undefined);

clearInterval(timer);
await nextTask();
globalThis.gc();
console.log('after clearInterval, report alive:', probe.deref() !== undefined);
