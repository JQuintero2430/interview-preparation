// Run with: node --expose-gc main.mjs
const registry = new FinalizationRegistry((label) => console.log('finalized', label));

let config = { name: 'config' };
const ref = new WeakRef(config);
registry.register(config, 'config');
config = null;

globalThis.gc();
console.log('same job:', ref.deref()?.name);

setTimeout(() => {
  globalThis.gc();
  console.log('later task:', ref.deref()?.name);
}, 0);
