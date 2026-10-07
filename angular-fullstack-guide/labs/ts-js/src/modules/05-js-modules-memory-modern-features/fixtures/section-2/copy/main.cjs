const counter = require('./counter.cjs');

console.log('before', counter.count);
counter.increment();
console.log('after', counter.count);
