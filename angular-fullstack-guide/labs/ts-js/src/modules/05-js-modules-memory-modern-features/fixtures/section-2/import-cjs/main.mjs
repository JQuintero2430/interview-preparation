import lib, { greet, version } from './lib.cjs';
import * as namespace from './lib.cjs';

console.log(greet('esm'), version);
console.log(Object.keys(lib));
console.log(Object.keys(namespace));
