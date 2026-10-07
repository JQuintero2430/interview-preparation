import greet, { version } from './legacy.cjs';
import * as namespace from './legacy.cjs';

console.log(typeof greet, greet('esm'), version);
console.log(typeof namespace, typeof namespace.default, namespace.version);
