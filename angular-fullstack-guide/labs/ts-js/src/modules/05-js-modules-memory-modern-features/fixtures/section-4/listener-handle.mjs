// Run with: node --expose-gc listener-handle.mjs
const nextTask = () => new Promise((resolve) => setTimeout(resolve, 0));
const appEvents = new EventTarget();

function openPanel() {
  const panel = { items: new Array(100_000).fill(0) };
  const onRefresh = () => panel.items.length;
  appEvents.addEventListener('refresh', onRefresh);
  return { probe: new WeakRef(panel), close: () => appEvents.removeEventListener('refresh', onRefresh) };
}

const { probe, close } = openPanel();
close(); // the listener is gone, but `close` still captures onRefresh, which captures panel
await nextTask();
globalThis.gc();
console.log('listener removed, close kept, panel alive:', probe.deref() !== undefined);
