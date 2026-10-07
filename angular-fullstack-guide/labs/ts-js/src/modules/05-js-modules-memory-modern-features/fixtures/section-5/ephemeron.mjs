// Run with: node --expose-gc ephemeron.mjs
const nextTask = () => new Promise((resolve) => setTimeout(resolve, 0));
const metadata = new WeakMap();

let key = { id: 7 };
metadata.set(key, { owner: key }); // the value points back at its own key
const probe = new WeakRef(key);
key = null;

await nextTask();
globalThis.gc();
console.log('key collected although its value references it:', probe.deref() === undefined);
