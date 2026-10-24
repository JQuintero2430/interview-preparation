// Section 10 codec and model: format and parse a W3C `traceparent` header, make a child span, decide which URLs get
// the header, and join one trace across hops by its trace ID. Our codec and model, not OpenTelemetry's code. It
// mirrors, all read 2026-10-22: W3C Trace Context Level 1 (Recommendation, 23 November 2021) §3.2.2 (the grammar:
// lowercase hex, version `ff` invalid, all-zero trace-id and parent-id invalid, flag bit 1 = sampled) and §3.2.4
// (a higher version is read for its first four fields; extra fields are allowed only there); and the propagation
// rule of `@opentelemetry/web-common` 0.300.0 `shouldPropagateTraceHeaders` (a deprecated helper): same-origin URLs
// always, cross-origin URLs only when they match the allow list (a string must equal the whole URL, a RegExp must
// match). Differences from OpenTelemetry's parser (`@opentelemetry/core` 3.0.0 `parseTraceParent`): its regex also
// accepts one leading or trailing whitespace character; ours accepts none, as the grammar says. Not modeled:
// `tracestate`, baggage, sampling decisions. Randomness comes from an injected source; nothing reads a clock.

/** One span's identity as `traceparent` carries it. */
export interface TraceContext {
  version: string;
  traceId: string;
  parentId: string;
  flags: number;
  sampled: boolean;
}

/** A random source returning numbers in [0, 1), injected so tests are deterministic. */
export type Random = () => number;

/** One hop of a trace as our join sees it: a component, the trace ID and the span ID it logged. */
export interface Hop {
  component: string;
  traceId: string;
  spanId: string;
}

const SAMPLED = 0x01;
const LOWER_HEX = /^[0-9a-f]+$/;
const ALL_ZEROES = /^0+$/;
const NGINX_TRACEPARENT = /traceparent="([^"]*)"/;
const SPRING_CORRELATION = /\[([0-9a-fA-F]{32})-([0-9a-fA-F]{16})\]/;

function isHex(value: string, length: number): boolean {
  return value.length === length && LOWER_HEX.test(value);
}

function isNonZeroHex(value: string, length: number): boolean {
  return isHex(value, length) && !ALL_ZEROES.test(value);
}

function randomHex(random: Random, bytes: number): string {
  let hex = '';
  for (let index = 0; index < bytes; index++) {
    hex += Math.floor(random() * 256)
      .toString(16)
      .padStart(2, '0');
  }
  return hex;
}

/** Draws IDs until one is not all zeroes, because the spec forbids all-zero IDs (§3.2.2.3, §3.2.2.4). */
function nonZeroId(random: Random, bytes: number): string {
  let id = randomHex(random, bytes);
  while (ALL_ZEROES.test(id)) id = randomHex(random, bytes);
  return id;
}

/** Formats version 00: `00-<32 hex trace-id>-<16 hex parent-id>-<2 hex flags>`. */
export function formatTraceparent(context: Pick<TraceContext, 'traceId' | 'parentId' | 'sampled'>): string {
  return `00-${context.traceId}-${context.parentId}-${context.sampled ? '01' : '00'}`;
}

/**
 * Parses a header per §3.2.2 and §3.2.4. Returns null for anything a receiver must ignore: a bad version, version
 * `ff`, uppercase or non-hex characters, all-zero IDs, or extra fields on version 00.
 */
export function parseTraceparent(header: string): TraceContext | null {
  const [version = '', traceId = '', parentId = '', flags = '', ...extra] = header.split('-');
  const knownVersion = version === '00';
  const versionOk = isHex(version, 2) && version !== 'ff';
  const shapeOk = knownVersion ? extra.length === 0 : header.length >= 55;
  const fieldsOk = isNonZeroHex(traceId, 32) && isNonZeroHex(parentId, 16) && isHex(flags, 2);
  if (!versionOk || !shapeOk || !fieldsOk) return null;
  const bits = Number.parseInt(flags, 16);
  return { version, traceId, parentId, flags: bits, sampled: (bits & SAMPLED) === SAMPLED };
}

/** Starts a trace: a new trace ID and span ID, with the sampling decision the caller made. */
export function startTrace(random: Random, sampled: boolean): TraceContext {
  const traceId = nonZeroId(random, 16);
  return { version: '00', traceId, parentId: nonZeroId(random, 8), flags: sampled ? SAMPLED : 0, sampled };
}

/**
 * A child span: the same trace ID and flags, and a new span ID. The child's `parentId` field is its own span ID,
 * which is what it sends downstream; `callerSpanId` keeps the span it hangs under.
 */
export function childOf(parent: TraceContext, random: Random): TraceContext & { callerSpanId: string } {
  return { ...parent, version: '00', parentId: nonZeroId(random, 8), callerSpanId: parent.parentId };
}

/** Our mirror of OpenTelemetry's rule: same origin always; other origins only when a list entry matches the URL. */
export function shouldPropagate(url: string, pageOrigin: string, allowList: readonly (string | RegExp)[]): boolean {
  if (new URL(url, pageOrigin).origin === pageOrigin) return true;
  return allowList.some((entry) => (typeof entry === 'string' ? entry === url : entry.test(url)));
}

/** Reads our Nginx access-log line (`traceparent="$http_traceparent"`); Nginx logs the caller's span, it makes none. */
export function hopFromNginxLine(line: string): Hop | null {
  const header = NGINX_TRACEPARENT.exec(line)?.[1];
  const context = header === undefined ? null : parseTraceparent(header);
  return context && { component: 'nginx', traceId: context.traceId, spanId: context.parentId };
}

/** Reads Spring Boot's default correlation prefix `[<traceId>-<spanId>]` (tracing.adoc's example shape). */
export function hopFromSpringLine(line: string): Hop | null {
  const match = SPRING_CORRELATION.exec(line);
  if (!match?.[1] || !match[2]) return null;
  return { component: 'spring', traceId: match[1].toLowerCase(), spanId: match[2].toLowerCase() };
}

/** Keeps the hops of one trace, in the order given: the join support does by trace ID instead of by time. */
export function joinTrace(hops: readonly (Hop | null)[], traceId: string): Hop[] {
  return hops.filter((hop): hop is Hop => hop !== null && hop.traceId === traceId);
}
