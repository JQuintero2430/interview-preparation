// Output questions Q01.15 and Q01.16, and bug hunt Q01.17 (section 5: coercion).
import { captureLogs } from '../capture';
import { runSnippet } from './run-snippet';

describe('Module 01 · coercion', () => {
  it('Q01.15 the binary + operator', async () => {
    const snippet = String.raw`
console.log([] + []);
console.log([] + {});
console.log(1 + '2', 1 + 2 + '3', '1' + 2 + 3);
console.log(true + 1, null + 1, undefined + 1);
console.log([1, 2] + [3]);
console.log({} + []);
console.log(eval('{} + []'));
`;
    const lines = await captureLogs((log) => runSnippet(snippet, log));
    expect(lines).toEqual(['', '[object Object]', '12 33 123', '2 1 NaN', '1,23', '[object Object]', '0']);
  });

  it('Q01.16 ToNumber: unary plus, Number and parseInt', async () => {
    const snippet = String.raw`
console.log(+'', +' 42\n', +'4 2');
console.log(+[], +[7], +[1, 2]);
console.log(+null, +undefined, +true);
console.log(Number('0x1F'), Number('1e3'), parseInt('1e3'));
console.log(parseInt('08px'), Number('08px'));
console.log(['1', '7', '11'].map(parseInt).join(', '));
console.log(parseInt(0.0000005));
`;
    const lines = await captureLogs((log) => runSnippet(snippet, log));
    expect(lines).toEqual(['0 42 NaN', '0 7 NaN', '0 NaN 1', '31 1000 1', '8 NaN', '1, NaN, 3', '5']);
  });

  it('Q01.17 three truthiness checks from a product page', async () => {
    const snippet = String.raw`
function stockLabel(quantityField) { // the value of an <input>: always a string
  return quantityField ? 'In stock' : 'Out of stock';
}
function resultsView(results) { // an array from the API
  return results ? 'list' : 'empty state';
}
function shippingLabel(costCents) { // a number, or undefined while it loads
  return costCents ? '$' + (costCents / 100).toFixed(2) : 'Calculating…';
}
console.log(stockLabel('0'), '|', resultsView([]), '|', shippingLabel(0));
`;
    const lines = await captureLogs((log) => runSnippet(snippet, log));
    expect(lines).toEqual(['In stock | list | Calculating…']);
  });

  it('Q01.17 the fixes test the exact condition', async () => {
    const snippet = String.raw`
const stockLabel = (quantityField) => (Number(quantityField) > 0 ? 'In stock' : 'Out of stock');
const resultsView = (results) => (results.length > 0 ? 'list' : 'empty state');
const shippingLabel = (costCents) =>
  costCents === undefined ? 'Calculating…' : '$' + (costCents / 100).toFixed(2);
console.log(stockLabel('0'), '|', resultsView([]), '|', shippingLabel(0), '|', shippingLabel(undefined));
`;
    const lines = await captureLogs((log) => runSnippet(snippet, log));
    expect(lines).toEqual(['Out of stock | empty state | $0.00 | Calculating…']);
  });

  it('Q01.17 evidence: ToBoolean, truthy and falsy', async () => {
    const snippet = String.raw`
console.log(Boolean('0'), Boolean('false'), Boolean(' '));
console.log(Boolean([]), Boolean({}), Boolean(new Boolean(false)));
console.log(Boolean(0n), Boolean(-0), Boolean(NaN), Boolean(''));
console.log(Boolean(false), Boolean(0), Boolean(null), Boolean(undefined));
console.log([] == false, Boolean([]));
`;
    const lines = await captureLogs((log) => runSnippet(snippet, log));
    expect(lines).toEqual(['true true true', 'true true true', 'false false false false', 'false false false false', 'true true']);
  });
});
