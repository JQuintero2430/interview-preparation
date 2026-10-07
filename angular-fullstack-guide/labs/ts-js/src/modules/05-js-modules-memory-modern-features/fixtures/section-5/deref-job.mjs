// Run with: node --expose-gc deref-job.mjs
const nextTask = () => new Promise((resolve) => setTimeout(resolve, 0));

let target = { name: 'cached' };
const ref = new WeakRef(target); // the constructor also keeps target alive until this job ends
target = null;
globalThis.gc();
console.log('same job, after gc:', ref.deref()?.name);

await nextTask();
globalThis.gc();
console.log('next task, after gc:', ref.deref()?.name);
