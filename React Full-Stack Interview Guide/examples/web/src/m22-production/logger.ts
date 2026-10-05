export type Level = 'debug' | 'info' | 'warn' | 'error';
export type LogRecord = { level: Level; message: string; time: string; context: Record<string, unknown> };
export type Sink = (record: LogRecord) => void;

const ORDER: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };
const SENSITIVE_KEY = /password|token|authorization|cookie|secret|email/i;
const SENSITIVE_PARAM = /token|code|key|secret|password|signature/i;
const MAX_DEPTH = 4;

/** Copies `value` with sensitive keys masked, Errors flattened and depth capped. */
export function redact(value: unknown, depth = 0): unknown {
  if (value instanceof Error) return { name: value.name, message: value.message };
  if (typeof value !== 'object' || value === null) return value;
  if (depth >= MAX_DEPTH) return '[truncated]';
  if (Array.isArray(value)) return value.map((item) => redact(item, depth + 1));
  const out: Record<string, unknown> = {};
  for (const [key, inner] of Object.entries(value)) {
    out[key] = SENSITIVE_KEY.test(key) ? '[redacted]' : redact(inner, depth + 1);
  }
  return out;
}

/** Masks sensitive query parameters (OAuth `code`, `token`, signed-URL signatures) before a URL is logged. */
export function scrubUrl(raw: string): string {
  let url: URL;
  try {
    url = new URL(raw, 'http://placeholder.invalid');
  } catch {
    return '[unparseable url]';
  }
  for (const name of [...url.searchParams.keys()]) {
    if (SENSITIVE_PARAM.test(name)) url.searchParams.set(name, 'REDACTED');
  }
  const relative = !/^[a-z][a-z0-9+.-]*:/i.test(raw);
  return relative ? `${url.pathname}${url.search}${url.hash}` : url.toString();
}

type LoggerOptions = {
  level: Level;
  sink: Sink;
  context?: Record<string, unknown>;
  now?: () => Date;
};

export type Logger = {
  debug: (message: string, context?: Record<string, unknown>) => void;
  info: (message: string, context?: Record<string, unknown>) => void;
  warn: (message: string, context?: Record<string, unknown>) => void;
  error: (message: string, context?: Record<string, unknown>) => void;
  /** A logger that adds `extra` to every record, for example `{ feature: 'cart' }` or a request id. */
  child: (extra: Record<string, unknown>) => Logger;
};

export function createLogger({ level, sink, context = {}, now = () => new Date() }: LoggerOptions): Logger {
  function log(at: Level, message: string, extra: Record<string, unknown> = {}) {
    if (ORDER[at] < ORDER[level]) return;
    const merged = redact({ ...context, ...extra }) as Record<string, unknown>;
    try {
      sink({ level: at, message, time: now().toISOString(), context: merged });
    } catch {
      // Logging must never break the feature that logged.
    }
  }
  return {
    debug: (m, c) => log('debug', m, c),
    info: (m, c) => log('info', m, c),
    warn: (m, c) => log('warn', m, c),
    error: (m, c) => log('error', m, c),
    child: (extra) => createLogger({ level, sink, context: { ...context, ...extra }, now }),
  };
}
