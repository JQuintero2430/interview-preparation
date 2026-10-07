import ts from 'typescript';
import * as strictCart from './cart';
import { LAB_OPTIONS, typecheck } from './typecheck';

// A variable specifier keeps node:fs out of the bundler's static graph (the lab has no @types/node).
const fsSpecifier = 'node:fs';
const { readFileSync } = (await import(fsSpecifier)) as { readFileSync: (path: URL, encoding: 'utf8') => string };

const LEGACY_SOURCE = readFileSync(new URL('./fixtures/legacy-cart/legacy-cart.ts', import.meta.url), 'utf8');
const STRICT_SOURCE = readFileSync(new URL('./cart.ts', import.meta.url), 'utf8');
const STRICTEST = { ...LAB_OPTIONS, exactOptionalPropertyTypes: true };
const linesAndCodes = (code: string, options: Record<string, unknown>) =>
  typecheck(code, options).map(({ line, code: diagnostic }) => `line ${line}: TS${diagnostic}`);

type CartApi = typeof strictCart;

/** Runs the legacy file the way a non-strict build would: types stripped, nothing checked. */
function loadLegacyCart(): CartApi {
  const javascript = ts.transpileModule(LEGACY_SOURCE, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const exports: Record<string, unknown> = {};
  new Function('exports', javascript)(exports);
  return exports as unknown as CartApi;
}

const pen = () => ({ sku: 'PEN', price: 2, quantity: 1 });
const book = () => ({ sku: 'BOOK', price: 20, quantity: 1, coupon: 'SAVE10' });

describe('E06.4 make a loose module strict', () => {
  it('the legacy source has the listed diagnostics under strict', () => {
    expect(linesAndCodes(LEGACY_SOURCE, { strict: false })).toEqual([]);
    expect(linesAndCodes(LEGACY_SOURCE, STRICTEST)).toEqual([
      'line 11: TS7006',
      'line 11: TS7006',
      'line 12: TS7006',
      'line 21: TS2538',
      'line 26: TS2532',
      'line 30: TS2322',
      'line 34: TS2375',
    ]);
  });

  it('the new source has none', () => {
    expect(linesAndCodes(STRICT_SOURCE, STRICTEST)).toEqual([]);
  });

  it.each([
    ['legacy', loadLegacyCart()],
    ['strict', strictCart],
  ])('the same run-time tests pass for both behaviors (%s)', (_name, cart) => {
    const lines = cart.addItem([], pen());
    const merged = cart.addItem(lines, pen());
    const grown = cart.addItem(merged, book());
    expect([merged === lines, merged[0]?.quantity, grown.length]).toEqual([true, 2, 2]);
    expect([cart.lineTotal(book()), cart.lineTotal({ ...book(), coupon: 'UNKNOWN' }), cart.lineTotal(pen())]).toEqual([18, 20, 2]);
    expect([cart.firstSku(grown), cart.findItem(grown, 'BOOK')?.price, cart.findItem(grown, 'MUG')]).toEqual(['PEN', 20, undefined]);
    expect(() => cart.firstSku([])).toThrow(TypeError);
    const cleared = cart.clearCoupon(book());
    expect([cleared.coupon, cart.lineTotal(cleared), book().coupon]).toEqual([undefined, 20, 'SAVE10']);
  });

  it('no any, no non-null !, no as', () => {
    const code = STRICT_SOURCE.replace(/\/\*\*[\s\S]*?\*\/|\/\/.*$/gm, '');
    expect([/\bany\b/.test(code), /[\w\])]!(?!=)/.test(code), /\bas\b/.test(code)]).toEqual([false, false, false]);
  });
});
