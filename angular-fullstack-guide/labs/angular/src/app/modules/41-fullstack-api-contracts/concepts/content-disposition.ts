/** The name used when a header carries no usable file name. */
export const FALLBACK_FILE_NAME = 'download';

/** What the client needs from a `Content-Disposition` value: its type and a file name it may show or save. */
export interface DispositionInfo {
  readonly type: string;
  readonly filename: string;
}

/** Splits on `;` outside double quotes, so a quoted file name may contain a semicolon. */
function splitParams(header: string): string[] {
  const parts: string[] = [];
  let current = '';
  let quoted = false;
  let escaped = false;
  for (const ch of header) {
    if (ch === ';' && !quoted) {
      parts.push(current.trim());
      current = '';
      continue;
    }
    if (ch === '"' && !escaped) quoted = !quoted;
    escaped = ch === '\\' && !escaped;
    current += ch;
  }
  parts.push(current.trim());
  return parts.filter((part) => part !== '');
}

/** Removes the surrounding quotes of a quoted-string and the backslash of each quoted pair. */
function unquote(value: string): string {
  if (value.length < 2 || !value.startsWith('"') || !value.endsWith('"')) return value;
  return value.slice(1, -1).replace(/\\(.)/g, '$1');
}

/** Decodes an RFC 5987 value, `UTF-8'language'percent-encoded`; any other charset or bad escape gives `undefined`. */
function decodeExtended(value: string): string | undefined {
  const match = /^([^']*)'[^']*'(.*)$/.exec(value);
  if (!match || match[1].toLowerCase() !== 'utf-8') return undefined;
  try {
    return decodeURIComponent(match[2]);
  } catch {
    return undefined;
  }
}

/** RFC 6266 §4.3: never trust folder information, so keep only the last segment after `/` or `\`. */
function lastSegment(name: string): string {
  return name.slice(Math.max(name.lastIndexOf('/'), name.lastIndexOf('\\')) + 1).trim();
}

/**
 * Reads the type and file name from a `Content-Disposition` value. When both `filename*` and `filename` are
 * present, `filename*` wins (RFC 6266 §4.3). A missing header or a missing or empty name gives the fallback.
 */
export function parseContentDisposition(header: string | null): DispositionInfo {
  const [type = '', ...params] = splitParams(header ?? '');
  const values = new Map<string, string>();
  for (const param of params) {
    const eq = param.indexOf('=');
    if (eq > 0) values.set(param.slice(0, eq).trim().toLowerCase(), param.slice(eq + 1).trim());
  }
  const extended = decodeExtended(values.get('filename*') ?? '');
  const plain = unquote(values.get('filename') ?? '');
  const name = lastSegment(extended ?? plain);
  return { type: type.toLowerCase(), filename: name === '' ? FALLBACK_FILE_NAME : name };
}
