try {
  require('./flaky.cjs');
} catch (error) {
  console.log('first require:', error.message);
}
require('./flaky.cjs');
console.log('second require ran the body again: runs =', globalThis.runs);
