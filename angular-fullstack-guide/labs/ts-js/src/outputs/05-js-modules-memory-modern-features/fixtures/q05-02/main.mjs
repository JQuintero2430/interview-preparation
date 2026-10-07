import snapshot, { count, liveDefault, increment } from './counter.mjs';

increment();
increment();
console.log(count, liveDefault, snapshot);
