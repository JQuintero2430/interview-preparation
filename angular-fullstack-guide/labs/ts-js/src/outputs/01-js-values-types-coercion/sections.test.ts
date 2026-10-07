// Section claims for module 01 that no Output question covers (sections 2, 5 and 6).
import { captureLogs } from '../capture';
import { runSnippet } from './run-snippet';

describe('Module 01 · section claims', () => {
  it('Section 2: overflow gives Infinity, and the global isFinite coerces while Number.isFinite does not', async () => {
    const snippet = String.raw`
console.log(Number.MAX_VALUE * 2, 1 / 0, -1 / 0, 0 / 0);
console.log(isFinite('12'), Number.isFinite('12'));
console.log(isFinite(null), Number.isFinite(Infinity));
`;
    const lines = await captureLogs((log) => runSnippet(snippet, log));
    expect(lines).toEqual(['Infinity Infinity -Infinity NaN', 'true false', 'true false']);
  });

  it('Section 5: an object with no usable conversion method throws TypeError', async () => {
    const snippet = String.raw`
const bare = Object.create(null);
try { +bare; } catch (error) { console.log(error.name, error.message); }
try { String(bare); } catch (error) { console.log(error.name, error.message); }
`;
    const lines = await captureLogs((log) => runSnippet(snippet, log));
    expect(lines).toEqual([
      'TypeError Cannot convert object to primitive value',
      'TypeError Cannot convert object to primitive value',
    ]);
  });

  it('Section 5: Number(1n) converts, but unary +1n throws', async () => {
    const snippet = String.raw`
console.log(Number(1n));
try { +1n; } catch (error) { console.log(error.name, error.message); }
`;
    const lines = await captureLogs((log) => runSnippet(snippet, log));
    expect(lines).toEqual(['1', 'TypeError Cannot convert a BigInt value to a number']);
  });

  it('Section 6: strings compare by code unit, and the default sort compares strings', async () => {
    const snippet = String.raw`
console.log('10' < '9', '10' < 9);
console.log([10, 9, 1].sort().join(), [10, 9, 1].sort((a, b) => a - b).join());
console.log(['10', '9', '1'].sort(new Intl.Collator('en', { numeric: true }).compare).join());
`;
    const lines = await captureLogs((log) => runSnippet(snippet, log));
    expect(lines).toEqual(['true false', '1,10,9 1,9,10', '1,9,10']);
  });
});
