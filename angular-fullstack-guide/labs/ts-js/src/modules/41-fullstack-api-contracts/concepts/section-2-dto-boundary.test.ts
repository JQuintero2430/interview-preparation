// Section 2 claims: the client checks a response at its edge, and a PATCH body keeps the difference between absent and null.
import { OrderDto, parseOrder, toPatchBody } from './order-dto';

const WIRE = { id: '1001', status: 'NEW', quantity: 2, note: null };

describe('Module 41 · section 2', () => {
  it('Section 2: the response schema accepts an added field and drops it from the result', () => {
    const parsed = parseOrder({ ...WIRE, discountCode: 'SPRING' });
    expect(parsed).toEqual(WIRE);
    expect('discountCode' in parsed).toBe(false);
  });

  it('Section 2: the response schema rejects a renamed field and names its path', () => {
    const renamed = { id: WIRE.id, status: WIRE.status, qty: WIRE.quantity, note: WIRE.note };
    const result = OrderDto.safeParse(renamed);
    expect(result.success).toBe(false);
    expect(result.error?.issues.map(({ code, path }) => ({ code, path }))).toEqual([{ code: 'invalid_type', path: ['quantity'] }]);
    const withoutNote = OrderDto.safeParse({ id: '1', status: 'NEW', quantity: 1 });
    expect(withoutNote.error?.issues.map(({ path }) => path)).toEqual([['note']]);
  });

  it('Section 2: the PATCH body keeps an explicit null and omits an untouched field', () => {
    expect(toPatchBody({ note: null, quantity: undefined })).toBe('{"note":null}');
    expect(toPatchBody({})).toBe('{}');
  });

  it('Section 2: an ID typed as a string keeps all its digits', () => {
    const body = '{"id":"9007199254740993","status":"NEW","quantity":1,"note":null}';
    expect(parseOrder(JSON.parse(body)).id).toBe('9007199254740993');
    const numeric: { id: number } = JSON.parse('{"id":9007199254740993}');
    expect(numeric.id).toBe(9007199254740992);
    expect(OrderDto.safeParse({ ...WIRE, id: numeric.id }).success).toBe(false);
  });
});
