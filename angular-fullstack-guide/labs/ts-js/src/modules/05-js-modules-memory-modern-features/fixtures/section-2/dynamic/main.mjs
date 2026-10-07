const first = await import('./dep.mjs');
const second = await import('./dep.mjs');
console.log(first === second, first.value);
try {
  await import('./does-not-exist.mjs');
} catch (error) {
  console.log(error.code);
}
