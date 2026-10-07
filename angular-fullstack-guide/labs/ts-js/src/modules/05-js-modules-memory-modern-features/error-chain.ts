// A registered symbol is shared by every realm, so the brand survives iframes and `vm` contexts.
const APP_ERROR = Symbol.for('app.error');

/** An application error with a stable `code` to branch on and an optional `cause`. */
export class AppError extends Error {
  readonly [APP_ERROR] = true;

  static {
    this.prototype.name = 'AppError';
  }

  /**
   * @param code Machine-readable code, such as `'SAVE_FAILED'`.
   * @param message Human-readable message.
   * @param options `{ cause }` keeps the lower-level error.
   */
  constructor(
    readonly code: string,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
  }
}

/**
 * Recognizes an `AppError` from any realm: a real error (checked by `Error.isError`) that carries the brand.
 * @returns `true` for a branded real error; `false` for fakes, plain errors and non-errors.
 */
export function isAppError(value: unknown): value is AppError {
  return Error.isError(value) && Reflect.get(value, APP_ERROR) === true;
}

/**
 * Describes an error and everything it links to, one line per error.
 * Causes follow with `caused by:`; members of an `errors` array (an `AggregateError`) are indented under it.
 * @param error Anything that was thrown.
 * @returns The lines, outermost error first; a repeated error is reported as `[cycle]` and not walked again.
 */
export function describeChain(error: unknown): string[] {
  const lines: string[] = [];
  const seen = new Set<unknown>();

  const visit = (value: unknown, prefix: string, depth: number): void => {
    const indent = '  '.repeat(depth);
    if (!Error.isError(value)) {
      lines.push(`${indent}${prefix}non-Error value: ${describeValue(value)}`);
      return;
    }
    if (seen.has(value)) {
      lines.push(`${indent}${prefix}[cycle] ${value.name}: ${value.message}`);
      return;
    }
    seen.add(value);
    const code = isAppError(value) ? ` [${value.code}]` : '';
    lines.push(`${indent}${prefix}${value.name}${code}: ${value.message}`);
    // Checked by shape, not `instanceof AggregateError`, which fails for errors from another realm.
    const members = (value as { errors?: unknown }).errors;
    if (Array.isArray(members)) {
      for (const member of members) visit(member, '', depth + 1);
    }
    if (value.cause !== undefined) visit(value.cause, 'caused by: ', depth);
  };

  visit(error, '', 0);
  return lines;
}

function describeValue(value: unknown): string {
  if (typeof value === 'string') return JSON.stringify(value);
  // `String(value)` throws for an object without a usable toString, such as `Object.create(null)`.
  if (typeof value === 'object' && value !== null) return Object.prototype.toString.call(value);
  return String(value);
}
