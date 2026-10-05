import { z } from 'zod';

/** The schema is the single source of truth: the TypeScript type is derived from it, never written twice. */
export const userSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  email: z.email(),
  role: z.enum(['admin', 'user']),
  // ISO string on the wire, Date in the program: z.input and z.output differ.
  joined: z.iso.datetime().transform((value) => new Date(value)),
});
export type User = z.output<typeof userSchema>; // same as z.infer
export type UserWire = z.input<typeof userSchema>;

export const newUserSchema = z.object({ name: z.string().min(1), email: z.email() });
export type NewUserInput = z.input<typeof newUserSchema>;

/** The server answered, but not with 2xx. */
export class HttpError extends Error {
  readonly status: number;
  readonly body: string;
  constructor(status: number, body: string) {
    super(`HTTP ${status}`);
    this.name = 'HttpError';
    this.status = status;
    this.body = body;
  }
}

/** The server answered 2xx, but the body is not what the contract promised. */
export class ContractError extends Error {
  readonly path: string;
  readonly issues: z.ZodError;
  constructor(path: string, issues: z.ZodError) {
    super(`Response from ${path} does not match its schema`);
    this.name = 'ContractError';
    this.path = path;
    this.issues = issues;
  }
}

export function createApiClient(baseUrl: string) {
  /** The one place JSON crosses the trust boundary: `unknown` goes in, `z.output<S>` comes out or it throws. */
  async function request<S extends z.ZodType>(path: string, schema: S, init?: RequestInit): Promise<z.output<S>> {
    const response = await fetch(`${baseUrl}${path}`, init);
    if (!response.ok) throw new HttpError(response.status, await response.text());
    const json: unknown = await response.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) throw new ContractError(path, parsed.error);
    return parsed.data;
  }

  return {
    request,
    getUser: (id: number) => request(`/users/${id}`, userSchema),
    listUsers: () => request('/users', z.array(userSchema)),
    /** Validates the request too: bad input never leaves the process. */
    createUser: async (input: NewUserInput) => {
      const body = newUserSchema.parse(input);
      return request('/users', userSchema, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    },
  };
}
