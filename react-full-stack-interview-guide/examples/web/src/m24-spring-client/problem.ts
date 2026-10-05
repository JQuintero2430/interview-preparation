import { z } from 'zod';

// RFC 9457 members plus this API's `errors` extension (sorted by field, then message).
const fieldErrorSchema = z.object({ field: z.string(), message: z.string() });

export const problemSchema = z.object({
  type: z.string().optional(), // Spring 7 omits it unless set; absent means about:blank
  title: z.string().optional(),
  status: z.number().optional(),
  detail: z.string().optional(),
  instance: z.string().optional(),
  errors: z.array(fieldErrorSchema).optional(),
});

export type ProblemDetail = z.infer<typeof problemSchema>;

/** Any non-2xx answer. `problem` is set only when the body really was `application/problem+json`. */
export class ApiError extends Error {
  readonly status: number;
  readonly problem: ProblemDetail | undefined;

  constructor(status: number, problem?: ProblemDetail) {
    super(problem?.detail ?? problem?.title ?? `HTTP ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.problem = problem;
  }
}

/** Turns a failed Response into an ApiError, parsing the body only if it is problem+json. */
export async function readApiError(res: Response): Promise<ApiError> {
  if (res.headers.get('Content-Type')?.includes('application/problem+json')) {
    const parsed = problemSchema.safeParse(await res.json().catch(() => undefined));
    if (parsed.success) return new ApiError(res.status, parsed.data);
  }
  return new ApiError(res.status);
}

/** Maps `errors: [{field, message}]` to `{ field: firstMessage }` for a form. Empty for any other error. */
export function fieldErrors(error: unknown): Record<string, string> {
  const result: Record<string, string> = {};
  if (!(error instanceof ApiError)) return result;
  for (const { field, message } of error.problem?.errors ?? []) {
    result[field] ??= message; // the API sorts by field then message, so the first one is stable
  }
  return result;
}

export function describeError(error: unknown): string {
  if (error instanceof ApiError) return error.problem?.title ? `${error.status} ${error.problem.title}` : `HTTP ${error.status}`;
  return 'Network error';
}
