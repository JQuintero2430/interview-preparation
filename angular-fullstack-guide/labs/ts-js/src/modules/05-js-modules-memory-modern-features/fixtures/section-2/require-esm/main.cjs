const namespace = require('./esm.mjs');
console.log(namespace.default, namespace.named, Object.prototype.toString.call(namespace));
try {
  require('./tla.mjs');
} catch (error) {
  console.log(error.code);
}
