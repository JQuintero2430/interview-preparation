/** RFC 9457's default problem type: the problem means no more than its HTTP status. */
export const ABOUT_BLANK = 'about:blank';

/** One entry of our `errors` extension member, shaped like RFC 9457's validation example. */
export interface FieldProblem {
  readonly pointer: string;
  readonly detail: string;
}

/** A problem detail as our client reads it: `type` defaulted, unknown members ignored. */
export interface Problem {
  readonly type: string;
  readonly title: string | undefined;
  readonly status: number | undefined;
  readonly detail: string | undefined;
  readonly instance: string | undefined;
  readonly errors: readonly FieldProblem[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function optionalNumber(value: unknown): number | undefined {
  return typeof value === 'number' ? value : undefined;
}

function isFieldProblem(entry: unknown): entry is FieldProblem {
  return isRecord(entry) && typeof entry['pointer'] === 'string' && typeof entry['detail'] === 'string';
}

/** True for a JSON object with a numeric `status` or a string `title`, and a string `type` when present. */
export function isProblemDetail(body: unknown): body is Record<string, unknown> {
  if (!isRecord(body)) return false;
  const typeOk = body['type'] === undefined || typeof body['type'] === 'string';
  return typeOk && (typeof body['status'] === 'number' || typeof body['title'] === 'string');
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/** `HttpErrorResponse.error` follows the request's `responseType`: an object, a string or a `Blob`. */
async function decode(body: unknown): Promise<unknown> {
  if (body instanceof Blob) return parseJson(await body.text());
  return typeof body === 'string' ? parseJson(body) : body;
}

/** Reads a problem detail from any error body, or returns `null` when the body is not one. */
export async function readProblem(body: unknown): Promise<Problem | null> {
  const decoded = await decode(body);
  if (!isProblemDetail(decoded)) return null;
  const errors = decoded['errors'];
  return {
    type: optionalString(decoded['type']) ?? ABOUT_BLANK,
    title: optionalString(decoded['title']),
    status: optionalNumber(decoded['status']),
    detail: optionalString(decoded['detail']),
    instance: optionalString(decoded['instance']),
    errors: Array.isArray(errors) ? errors.filter(isFieldProblem) : [],
  };
}

/** The key a mapping layer switches on: the type URI, or the response status when the type is `about:blank`. */
export function problemKey(problem: Problem, httpStatus: number): string {
  return problem.type === ABOUT_BLANK ? String(httpStatus) : problem.type;
}
