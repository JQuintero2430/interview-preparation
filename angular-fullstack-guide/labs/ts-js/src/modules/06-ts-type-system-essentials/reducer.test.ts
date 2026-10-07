import { reduce, type OrdersAction, type OrdersState } from './reducer';
import { typecheck } from './typecheck';

// A variable specifier keeps node:fs out of the bundler's static graph (the lab has no @types/node).
const fsSpecifier = 'node:fs';
const { readFileSync } = (await import(fsSpecifier)) as { readFileSync: (path: URL, encoding: 'utf8') => string };

const SOURCE = readFileSync(new URL('./reducer.ts', import.meta.url), 'utf8');
const codesAndLines = (code: string) => typecheck(code).map(({ line, code: diagnostic }) => `line ${line}: TS${diagnostic}`);
const lineOf = (code: string, text: string) => code.split('\n').findIndex((line) => line.includes(text)) + 1;

const orders = [{ id: 'A-1', total: 30 }];

describe('E06.1 reduce', () => {
  it('each action produces the expected state', () => {
    const loading = reduce({ status: 'idle' }, { type: 'load' });
    expect(loading).toEqual({ status: 'loading' });
    expect(reduce(loading, { type: 'loaded', orders })).toEqual({ status: 'loaded', orders });
    expect(reduce(loading, { type: 'failed', error: 'timeout' })).toEqual({ status: 'failed', error: 'timeout' });
    expect(reduce({ status: 'loaded', orders }, { type: 'reset' })).toEqual({ status: 'idle' });
    const idle: OrdersState = { status: 'idle' };
    expect(reduce(idle, { type: 'loaded', orders })).toBe(idle);
  });

  it('an unknown action at run time throws with its type', () => {
    const fromOutside = JSON.parse('{"type":"refund","amount":5}') as OrdersAction;
    expect(() => reduce({ status: 'idle' }, fromOutside)).toThrow('unknown action: {"type":"refund","amount":5}');
  });

  it('adding a variant without a case is a compile error', () => {
    expect(codesAndLines(SOURCE)).toEqual([]);
    const withRefund = SOURCE.replace("| { type: 'reset' };", "| { type: 'reset' }\n  | { type: 'refund'; amount: number };");
    expect(codesAndLines(withRefund)).toEqual([`line ${lineOf(withRefund, 'return assertNever(action)')}: TS2345`]);
    // The alternative in the worked solution: a handler table typed with a mapped type reports the missing entry.
    const handlerTable = `${SOURCE}
type Handlers = { [K in OrdersAction['type']]: (state: OrdersState, action: Extract<OrdersAction, { type: K }>) => OrdersState };
export const handlers: Handlers = {
  load: () => ({ status: 'loading' }),
  loaded: (_state, action) => ({ status: 'loaded', orders: action.orders }),
  failed: (_state, action) => ({ status: 'failed', error: action.error }),
};`;
    expect(codesAndLines(handlerTable)).toEqual([`line ${lineOf(handlerTable, 'export const handlers')}: TS2741`]);
  });

  it('the state type forbids loading with error', () => {
    const loadingWithError = `${SOURCE}\nexport const impossible: OrdersState = { status: 'loading', error: 'timeout' };`;
    expect(codesAndLines(loadingWithError)).toEqual([`line ${lineOf(loadingWithError, 'export const impossible')}: TS2353`]);
  });
});
