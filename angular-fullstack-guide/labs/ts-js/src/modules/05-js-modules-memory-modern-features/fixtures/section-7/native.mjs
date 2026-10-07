// Runs natively in Node 24 (no transpiler): disposal order and SuppressedError.
const resource = (name, failOnDispose = false) => ({
  [Symbol.dispose]() {
    console.log('dispose', name);
    if (failOnDispose) throw new Error(`${name} failed to close`);
  },
});

{
  using first = resource('connection');
  using second = resource('transaction');
  console.log('body runs');
}

try {
  using file = resource('file', true);
  throw new Error('write failed');
} catch (error) {
  console.log(error.name, '|', error.error.message, '|', error.suppressed.message);
}
