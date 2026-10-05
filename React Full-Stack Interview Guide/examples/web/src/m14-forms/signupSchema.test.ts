import { expectTypeOf } from 'vitest';
import * as z from 'zod';
import { signupSchema, type SignupValues } from './signupSchema';

test('valid values parse to the same shape', () => {
  const values = { email: 'ana@example.com', password: 'correct-horse', confirm: 'correct-horse' };
  expect(signupSchema.parse(values)).toEqual(values);
});

test('empty values report one message per invalid field (z.flattenError, Zod 4)', () => {
  const result = signupSchema.safeParse({ email: '', password: '', confirm: '' });
  expect(result.success).toBe(false);
  if (result.success) return;
  expect(z.flattenError(result.error).fieldErrors).toEqual({
    email: ['Enter a valid email'],
    password: ['Password must be at least 8 characters'],
  });
});

test('the cross-field rule reports on the confirm field', () => {
  const result = signupSchema.safeParse({
    email: 'ana@example.com',
    password: 'correct-horse',
    confirm: 'correct-hors',
  });
  expect(result.success).toBe(false);
  if (result.success) return;
  expect(z.flattenError(result.error).fieldErrors).toEqual({ confirm: ['Passwords do not match'] });
});

test('the static type is inferred from the schema', () => {
  expectTypeOf<SignupValues>().toEqualTypeOf<{ email: string; password: string; confirm: string }>();
});
