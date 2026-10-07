const resource = (name, failOnDispose = false) => ({
  [Symbol.dispose]() {
    console.log('dispose', name);
    if (failOnDispose) throw new Error(`${name} failed`);
  },
});

function run() {
  using stack = new DisposableStack();
  stack.defer(() => {
    console.log('deferred');
    throw new Error('deferred failed');
  });
  using lock = resource('lock', true);
  stack.use(resource('socket'));
  console.log('body');
  return 'done';
}

try {
  console.log(run());
} catch (error) {
  console.log(error.name, '|', error.error.message, '|', error.suppressed.message);
}
