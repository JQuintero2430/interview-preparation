exports.loaded = false;
const a = require('./a.cjs');
console.log('b sees a.loaded =', a.loaded);
exports.loaded = true;
