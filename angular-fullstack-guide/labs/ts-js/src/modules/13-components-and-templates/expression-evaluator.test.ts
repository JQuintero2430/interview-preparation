// Exercise 13.4 tests: a model of the template-expression subset (sections 2 and 3), not Angular's parser.
// Error kinds are fixtures from the SEC-M13-02 run: each throwaway component compiled with `ngc` 22.2.1 on 2026-10-07 (NG5002 parser errors).
import { describe, expect, it } from 'vitest';
import { evaluate, ExpressionError, renderInterpolation, type ExpressionErrorKind } from './expression-evaluator';

const NGC_ERRORS: ReadonlyArray<readonly [ExpressionErrorKind, string, string]> = [
  ['assignment', 'n = 2', 'Bindings cannot contain assignments at column 6 in [ n = 2 ]'],
  ['increment', 'count++', 'Unexpected end of expression:  count++  at the end of the expression [ count++ ]'],
  ['new', 'new Date()', "Unexpected token 'Date' at column 6 in [ new Date() ]"],
  ['chain', 'n; n', 'Binding expression cannot contain chained expression at column 5 in [ n; n ]'],
  ['bitwise', 'n & 1', "Unexpected token '&' at column 4 in [ n & 1 ]"],
  ['comma', 'n, n', "Unexpected token ',' at column 3 in [ n, n ]"],
  ['unary-before-exponent', '-2 ** 2', 'Unary operator used immediately before exponentiation expression. Parenthesis must be used to disambiguate operator precedence at column 5 in [ -2 ** 2 ]'],
  ['declaration', 'let x = 1', 'Unexpected token let at column 2 in [ let x = 1 ]'],
  ['global', 'Math.max(1, 2)', "TS2339: Property 'Math' does not exist on type 'B10'."],
];

const kindOf = (source: string): unknown => {
  try {
    evaluate(source, { n: 1, count: 0 });
    return 'no error';
  } catch (error) {
    return error instanceof ExpressionError ? error.kind : String(error);
  }
};

describe('E13.4 · a template-expression evaluator (a model, not Angular)', () => {
  it('literals, arithmetic and member/keyed access evaluate against the context', () => {
    const context = { user: { name: 'Ada', tags: ['a', 'b'] }, key: 'name', n: 4, double: (x: number) => x * 2 };

    expect(evaluate("1 + 2 * 3 - 4 / 2 % 3", context)).toBe(5);
    expect(evaluate('(1 + 2) * 3 < 10 == true', context)).toBe(true);
    expect(evaluate("'a' + 'b'", context)).toBe('ab');
    expect(evaluate('user.name', context)).toBe('Ada');
    expect(evaluate('user[key]', context)).toBe('Ada');
    expect(evaluate('user.tags[1]', context)).toBe('b');
    expect(evaluate('double(n) + 1', context)).toBe(9);
    expect(evaluate('this.n', context)).toBe(4);
    expect([evaluate('true', context), evaluate('null', context), evaluate('undefined', context)]).toEqual([true, null, undefined]);
  });

  it('`a?.b` is `undefined` when `a` is nullish and `null` with `legacySafeNavigation`, and a nullish receiver short-circuits the rest of the chain', () => {
    let calls = 0;
    const context = { a: null, b: { c: 1 }, log: () => (calls += 1) };

    expect(evaluate('a?.b', context)).toBeUndefined();
    expect(evaluate('a?.b', context, { legacySafeNavigation: true })).toBeNull();
    expect(evaluate('a?.b.c.d(log())', context)).toBeUndefined();
    expect(evaluate('a?.[log()]', context)).toBeUndefined();
    expect(calls).toBe(0);
    expect(evaluate('b?.c', context)).toBe(1);
    expect(() => evaluate('a.b', context)).toThrow(TypeError);
  });

  it('`2 ** 3 ** 2` is 512 and `-2 ** 2` throws `unary-before-exponent`', () => {
    expect(evaluate('2 ** 3 ** 2', {})).toBe(512);
    expect(evaluate('2 ** -1', {})).toBe(0.5);
    expect(evaluate('(-2) ** 2', {})).toBe(4);
    expect(kindOf('-2 ** 2')).toBe('unary-before-exponent');
  });

  it('`typeof`, `void`, `in`, `??`, `&&`, ternary and template literals follow JavaScript', () => {
    const context = { n: 1, record: { a: 1 }, missing: undefined, zero: 0 };

    expect(evaluate('typeof n', context)).toBe('number');
    expect(evaluate('void 0', context)).toBeUndefined();
    expect(evaluate("'a' in record", context)).toBe(true);
    expect(evaluate("'b' in record", context)).toBe(false);
    expect(evaluate("missing ?? 'fallback'", context)).toBe('fallback');
    expect(evaluate("zero ?? 'fallback'", context)).toBe(0);
    expect(evaluate("zero || 'fallback'", context)).toBe('fallback');
    expect(evaluate('n && record.a', context)).toBe(1);
    expect(evaluate("n > 0 ? 'pos' : 'neg'", context)).toBe('pos');
    expect(evaluate('`n=${n}, next=${n + 1}`', context)).toBe('n=1, next=2');
    expect(evaluate('!zero', context)).toBe(true);
    expect(evaluate('missing && missing.deep', context)).toBeUndefined();
  });

  it('assignment, `++`, `new`, bitwise operators, the comma operator, `;` chains and declarations each throw the matching `ExpressionError` kind', () => {
    NGC_ERRORS.filter(([kind]) => kind !== 'unary-before-exponent' && kind !== 'global').forEach(([kind, source]) => {
      expect(kindOf(source), `${source} (ngc: ${NGC_ERRORS.find(([, s]) => s === source)?.[2]})`).toBe(kind);
    });
    expect(kindOf('++n')).toBe('increment');
    expect(kindOf('~n')).toBe('bitwise');
    expect(kindOf('n += 1')).toBe('assignment');
    expect(kindOf('1 +')).toContain('SyntaxError');
  });

  it('`renderInterpolation` renders `null` and `undefined` as empty, arrays joined with commas and objects as `[object Object]`', () => {
    const context = { nothing: null, absent: undefined, zero: 0, no: false, list: [1, [2, 3]], object: { a: 1 }, name: 'Ada' };

    expect(renderInterpolation('[{{ nothing }}][{{ absent }}]', context)).toBe('[][]');
    expect(renderInterpolation('{{ zero }} {{ no }}', context)).toBe('0 false');
    expect(renderInterpolation('{{ list }}', context)).toBe('1,2,3');
    expect(renderInterpolation('{{ object }}', context)).toBe('[object Object]');
    expect(renderInterpolation('Hello {{ name }}, {{ zero + 1 }}!', context)).toBe('Hello Ada, 1!');
  });

  it('`Math` and other JavaScript globals are not readable (an unknown identifier is `undefined`, or throws `global` for the listed JavaScript globals)', () => {
    expect(evaluate('missing', {})).toBeUndefined();
    expect(kindOf('Math.max(1, 2)')).toBe('global');
    expect(kindOf('Number(n)')).toBe('global');
    expect(evaluate('Math', { Math: 'exposed' })).toBe('exposed');
    expect(evaluate('Math.max(1, 2)', { Math })).toBe(2);
  });
});
