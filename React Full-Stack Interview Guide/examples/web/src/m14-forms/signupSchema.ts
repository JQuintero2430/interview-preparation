import * as z from 'zod';

// One schema is the single source of truth: it validates at runtime AND produces the static type.
// Zod 4 style: top-level z.email() (z.string().email() is deprecated) and `error` instead of `message`.
export const signupSchema = z
  .object({
    email: z.email({ error: 'Enter a valid email' }),
    password: z.string().min(8, { error: 'Password must be at least 8 characters' }),
    confirm: z.string(),
  })
  // A cross-field rule. `path` attaches the issue to the field the user must fix.
  .refine((values) => values.password === values.confirm, {
    error: 'Passwords do not match',
    path: ['confirm'],
  });

/** What the inputs hold (what React Hook Form stores). */
export type SignupInput = z.input<typeof signupSchema>;
/** What a successful parse returns (what your submit handler receives). */
export type SignupValues = z.output<typeof signupSchema>;
