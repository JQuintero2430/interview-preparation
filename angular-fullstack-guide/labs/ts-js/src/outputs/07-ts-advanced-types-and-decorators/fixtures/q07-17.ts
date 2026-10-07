import { z } from 'zod';

const User = z.object({ id: z.string(), age: z.number().int() });
const StrictUser = z.strictObject({ id: z.string() });

const a = User.parse({ id: 'u-1', age: 30, role: 'admin' });
const b = User.safeParse({ id: 'u-1', age: 30.5 });
const c = StrictUser.safeParse({ id: 'u-1', role: 'admin' });

export const lines = [JSON.stringify(a), b.success ? 'ok' : b.error.issues[0]?.message, c.success ? 'ok' : c.error.issues[0]?.code];
