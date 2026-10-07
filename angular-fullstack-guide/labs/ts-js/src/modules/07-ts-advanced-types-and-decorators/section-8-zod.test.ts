// Section 8 claims: a Zod 4 schema is both the run-time check and, through z.infer, the static type.
import { z } from 'zod';
import { LAB_OPTIONS, typecheck } from '../06-ts-type-system-essentials/typecheck';

const LAB_SRC = new URL('../../', import.meta.url).pathname;
const CONSUMER = `${LAB_SRC}virtual-consumer.ts`;
const EQUAL = 'type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;\n';

/** Checks `code` as a file inside labs/ts-js/src, so `import { z } from 'zod'` resolves to the installed package. */
const codesInLab = (code: string) =>
  typecheck('export {};', LAB_OPTIONS, { [CONSUMER]: code })
    .filter(({ file }) => file === CONSUMER)
    .map(({ line, code: diagnostic }) => `line ${line}: TS${diagnostic}`);

const USER_SCHEMA = `import { z } from 'zod';
const User = z.object({
  id: z.string(),
  age: z.number().int(),
  email: z.string().optional(),
  nickname: z.string().nullable(),
});
type User = z.infer<typeof User>;
`;

const User = z.object({
  id: z.string(),
  age: z.number().int(),
  email: z.string().optional(),
  nickname: z.string().nullable(),
});

describe('Module 07 · section 8', () => {
  it('Section 8: z.infer derives the object type, with optional and nullable fields', () => {
    const code = `${USER_SCHEMA}${EQUAL}export const same: Equal<User, { id: string; age: number; email?: string | undefined; nickname: string | null }> = true;
export const user: User = { id: 'u-1', age: 3, nickname: null, role: 'admin' };`;
    expect(codesInLab(code)).toEqual(['line 11: TS2353']);
  });

  it('Section 8: parse returns the data with unknown keys stripped, and throws a ZodError with a path otherwise', () => {
    expect(User.parse({ id: 'u-1', age: 3, nickname: null, role: 'admin' })).toEqual({ id: 'u-1', age: 3, nickname: null });
    let caught: unknown;
    try {
      User.parse({ id: 1, age: 3, nickname: null });
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(z.ZodError);
    expect((caught as z.ZodError).issues.map(({ code, path, message }) => ({ code, path, message }))).toEqual([
      { code: 'invalid_type', path: ['id'], message: 'Invalid input: expected string, received number' },
    ]);
  });

  it('Section 8: safeParse returns a result object instead of throwing', () => {
    const result = User.safeParse({ id: 'u-1', age: 3.5, nickname: null });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('Invalid input: expected int, received number');
    expect(User.safeParse({ id: 'u-1', age: 3, nickname: 'Ann' })).toEqual({ success: true, data: { id: 'u-1', age: 3, nickname: 'Ann' } });
  });

  it('Section 8: strictObject rejects unknown keys and looseObject keeps them', () => {
    expect(z.strictObject({ id: z.string() }).safeParse({ id: 'a', role: 'admin' }).error?.issues).toEqual([
      { code: 'unrecognized_keys', keys: ['role'], path: [], message: 'Unrecognized key: "role"' },
    ]);
    expect(z.looseObject({ id: z.string() }).parse({ id: 'a', role: 'admin' })).toEqual({ id: 'a', role: 'admin' });
  });

  it('Section 8: a transform makes the input and output types differ', () => {
    const Price = z.string().transform((text) => Math.round(Number(text) * 100));
    expect(Price.parse('19.99')).toBe(1999);
    const code = `import { z } from 'zod';
${EQUAL}const Price = z.string().transform((text) => Math.round(Number(text) * 100));
export const input: Equal<z.input<typeof Price>, string> = true;
export const output: Equal<z.output<typeof Price>, number> = true;
export const inferred: Equal<z.infer<typeof Price>, number> = true;`;
    expect(codesInLab(code)).toEqual([]);
  });

  it('Section 8: .brand() tags the output type only; the parsed value is a plain number', () => {
    const Cents = z.number().int().brand<'Cents'>();
    expect(Cents.parse(1999)).toBe(1999);
    const code = `import { z } from 'zod';
const Cents = z.number().int().brand<'Cents'>();
type Cents = z.infer<typeof Cents>;
declare function charge(amount: Cents): void;
charge(Cents.parse(1999));
charge(1999);`;
    expect(codesInLab(code)).toEqual(['line 6: TS2345']);
  });
});
