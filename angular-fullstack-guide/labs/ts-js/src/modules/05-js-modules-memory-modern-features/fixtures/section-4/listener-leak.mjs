// Run with: node --expose-gc listener-leak.mjs
const nextTask = () => new Promise((resolve) => setTimeout(resolve, 0));
const appEvents = new EventTarget();

function openPanel() {
  const panel = { items: new Array(100_000).fill(0) };
  const onRefresh = () => panel.items.length;
  appEvents.addEventListener('refresh', onRefresh);
  return { probe: new WeakRef(panel), close: () => appEvents.removeEventListener('refresh', onRefresh) };
}

let handle = openPanel();
const probe = handle.probe;
handle = null; // the caller forgets the panel, but the listener still points at it
await nextTask();
globalThis.gc();
console.log('panel forgotten, listener registered, panel alive:', probe.deref() !== undefined);

let reopened = openPanel();
const secondProbe = reopened.probe;
reopened.close();
reopened = null; // listener removed and handle dropped: nothing reaches the panel
await nextTask();
globalThis.gc();
console.log('listener removed, panel alive:', secondProbe.deref() !== undefined);
