// Output questions Q01.04 to Q01.08 (section 2: numbers).
import { captureLogs } from '../capture';
import { runSnippet } from './run-snippet';

describe('Module 01 · numbers', () => {
  it('Q01.04 floating point: 0.1 + 0.2 and toFixed', async () => {
    const snippet = String.raw`
console.log(0.1 + 0.2);
console.log(0.1 + 0.2 === 0.3);
console.log(Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON);
console.log(1.005 * 100);
console.log((1.005).toFixed(2));
`;
    const lines = await captureLogs((log) => runSnippet(snippet, log));
    expect(lines).toEqual(['0.30000000000000004', 'false', 'true', '100.49999999999999', '1.00']);
  });

  it('Q01.05 NaN', async () => {
    const snippet = String.raw`
console.log(NaN === NaN);
console.log(isNaN('abc'), Number.isNaN('abc'));
console.log(Object.is(NaN, 0 / 0));
console.log(Math.max(1, NaN, 3));
console.log(NaN ** 0);
`;
    const lines = await captureLogs((log) => runSnippet(snippet, log));
    expect(lines).toEqual(['false', 'true false', 'true', 'NaN', '1']);
  });

  it('Q01.06 negative zero', async () => {
    const snippet = String.raw`
const z = -0;
console.log(z === 0, Object.is(z, 0));
console.log(1 / z);
console.log(String(z), JSON.stringify(z));
console.log(Object.is(Math.round(-0.4), -0));
const fmt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
console.log(fmt.format(-0.4));
const fmtNegative = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0, signDisplay: 'negative' });
console.log(fmtNegative.format(-0.4));
`;
    const lines = await captureLogs((log) => runSnippet(snippet, log));
    expect(lines).toEqual(['true false', '-Infinity', '0 0', 'true', '-0', '0']);
  });

  it('Q01.07 safe integers and large IDs in JSON', async () => {
    const snippet = String.raw`
console.log(Number.MAX_SAFE_INTEGER);
console.log(2 ** 53 === 2 ** 53 + 1);
console.log(Number.isSafeInteger(2 ** 53));
console.log(9007199254740993);
console.log(JSON.parse('{"id":9007199254740993}').id);
console.log(JSON.parse('{"id":"9007199254740993"}').id);
`;
    const lines = await captureLogs((log) => runSnippet(snippet, log));
    expect(lines).toEqual([
      '9007199254740991',
      'true',
      'false',
      '9007199254740992',
      '9007199254740992',
      '9007199254740993',
    ]);
  });

  it('Q01.08 BigInt', async () => {
    const snippet = String.raw`
const attempt = (f) => { try { return String(f()); } catch (e) { return e.name; } };
console.log(attempt(() => 2n ** 64n));
console.log(attempt(() => 7n / 2n), attempt(() => -7n / 2n));
console.log(attempt(() => 1n + 1));
console.log(1n == 1, 1n === 1, 2n > 1);
console.log(attempt(() => BigInt('9007199254740993')));
console.log(attempt(() => BigInt(1.5)));
console.log(attempt(() => JSON.stringify({ id: 1n })));
`;
    const lines = await captureLogs((log) => runSnippet(snippet, log));
    expect(lines).toEqual([
      '18446744073709551616',
      '3 -3',
      'TypeError',
      'true false true',
      '9007199254740993',
      'RangeError',
      'TypeError',
    ]);
  });
});
