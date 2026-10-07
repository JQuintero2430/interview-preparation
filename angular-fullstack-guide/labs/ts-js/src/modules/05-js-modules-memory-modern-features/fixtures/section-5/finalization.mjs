// Run with: node --expose-gc finalization.mjs
const nextTask = () => new Promise((resolve) => setTimeout(resolve, 0));
const registry = new FinalizationRegistry((heldValue) => console.log('cleanup for', heldValue));

let session = { user: 'ada' };
registry.register(session, 'session-42');
session = null;

await nextTask();
globalThis.gc();
await nextTask();
console.log('after gc and one more task');
