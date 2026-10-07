import { assertUser, firstInvalidField, isUser } from './user-guard';
import { typecheck } from './typecheck';

// A variable specifier keeps node:fs out of the bundler's static graph (the lab has no @types/node).
const fsSpecifier = 'node:fs';
const { readFileSync } = (await import(fsSpecifier)) as { readFileSync: (path: URL, encoding: 'utf8') => string };

const GUARD_SOURCE = readFileSync(new URL('./user-guard.ts', import.meta.url), 'utf8');

const valid = () => ({
  id: 7,
  name: 'Ada',
  email: 'ada@example.com',
  address: { street: '1 Analytical Way', city: 'London', zip: 'N1' },
});

describe('E06.2 isUser and assertUser', () => {
  it('accepts a valid payload', () => {
    expect([isUser(valid()), isUser({ ...valid(), phone: '+44 20 0000' })]).toEqual([true, true]);
    expect(isUser(JSON.parse(JSON.stringify(valid())))).toBe(true);
  });

  it.each([
    ['id', { ...valid(), id: '7' }],
    ['id', { ...valid(), id: 7.5 }],
    ['name', { ...valid(), name: null }],
    ['email', { ...valid(), email: 'ada.example.com' }],
    ['phone', { ...valid(), phone: 44 }],
    ['address', { ...valid(), address: 'London' }],
    ['address', { ...valid(), address: null }],
    ['address.city', { ...valid(), address: { street: '1 Analytical Way', zip: 'N1' } }],
    ['address.zip', { ...valid(), address: { ...valid().address, zip: 1 } }],
  ])('rejects each malformed field (%s)', (field, payload) => {
    expect([isUser(payload), firstInvalidField(payload)]).toEqual([false, field]);
  });

  it('null, arrays and primitives are rejected', () => {
    const notObjects: unknown[] = [null, undefined, [valid()], 'user', 7, true];
    expect(notObjects.map(isUser)).toEqual([false, false, false, false, false, false]);
    expect(new Set(notObjects.map(firstInvalidField))).toEqual(new Set(['(root)']));
  });

  it('after the guard, property access compiles without assertions', () => {
    const consumer = `import { assertUser, isUser } from './user-guard';
export function label(data: unknown): string {
  if (isUser(data)) return data.name + ' (' + data.address.city + ')' + (data.phone ?? '');
  return 'unknown';
}
export function zip(data: unknown): string {
  assertUser(data);
  return data.address.zip;
}
export function unchecked(data: unknown): string {
  return data.name;
}`;
    const diagnostics = typecheck(consumer, undefined, { '/virtual/user-guard.ts': GUARD_SOURCE });
    expect(diagnostics.map(({ file, line, code }) => `${file}:${line}: TS${code}`)).toEqual(['/virtual/main.ts:11: TS18046']);
  });

  it('the assertion form throws a TypeError naming the first bad field', () => {
    const payload = { ...valid(), email: 'nope', address: { ...valid().address, zip: 1 } };
    expect(() => assertUser(payload)).toThrow(new TypeError('invalid user: email'));
    expect(() => assertUser([])).toThrow(new TypeError('invalid user: (root)'));
    expect(() => assertUser(valid())).not.toThrow();
  });
});
