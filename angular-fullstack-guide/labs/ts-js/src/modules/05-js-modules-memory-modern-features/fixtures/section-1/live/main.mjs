import { count, increment } from './counter.mjs';

console.log('before', count);
increment();
console.log('after', count);
try {
  count = 10;
} catch (error) {
  console.log(error.name, error.message);
}
