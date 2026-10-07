// Run with: node --expose-gc cycle.mjs
const nextTask = () => new Promise((resolve) => setTimeout(resolve, 0));

function makeCycle() {
  const parent = { name: 'parent' };
  const child = { name: 'child', parent };
  parent.child = child;
  return new WeakRef(parent);
}

const probe = makeCycle();
await nextTask();
globalThis.gc();
console.log('unreachable cycle collected:', probe.deref() === undefined);
