// Output questions Q01.19 and Q01.20 (section 6: equality).
import { captureLogs } from '../capture';
import { runSnippet } from './run-snippet';

describe('Module 01 · equality', () => {
  it('Q01.19 loose equality and relational puzzles', async () => {
    const snippet = String.raw`
console.log(null == undefined, null == 0, null >= 0);
console.log(undefined == 0, undefined >= 0);
console.log('' == 0, '0' == false, ' \t' == 0);
console.log([] == ![], [0] == false, '1,2' == [1, 2]);
console.log(NaN == NaN, {} == '[object Object]');
`;
    const lines = await captureLogs((log) => runSnippet(snippet, log));
    expect(lines).toEqual(['true false true', 'false false', 'true true true', 'true true true', 'false true']);
  });

  it('Q01.20 strict equality, SameValue and SameValueZero in collections', async () => {
    const snippet = String.raw`
const values = [NaN, 0];
console.log(values.indexOf(NaN), values.includes(NaN), values.findIndex(Number.isNaN));
console.log(values.includes(-0), Object.is(-0, 0), -0 === 0);
console.log(new Set([NaN, NaN, 0, -0]).size);
const m = new Map([[-0, 'zero']]);
console.log(m.get(0));
const [stored] = new Set([-0]);
console.log(Object.is(stored, -0));
`;
    const lines = await captureLogs((log) => runSnippet(snippet, log));
    expect(lines).toEqual(['-1 true 0', 'true false true', '2', 'zero', 'false']);
  });
});
