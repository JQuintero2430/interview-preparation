exports.loaded = false;
const b = require('./b.cjs');
console.log('a sees b.loaded =', b.loaded);
exports.loaded = true;
