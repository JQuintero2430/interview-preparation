// Section 10 claims, about our codec and model (trace-context.ts), not OpenTelemetry's code: a formatted traceparent
// parses back to the same fields; all-zero IDs are rejected as the W3C grammar says; a child span keeps the trace ID
// and gets a new span ID; our propagation rule (mirroring @opentelemetry/web-common 0.300.0) sends the header to the
// same origin and to listed origins only; and one trace ID joins the browser spans, the Nginx log line and the Spring
// log line. No clock, network or real randomness: IDs come from a seeded sequence.
import {
  childOf,
  formatTraceparent,
  hopFromNginxLine,
  hopFromSpringLine,
  joinTrace,
  parseTraceparent,
  shouldPropagate,
  startTrace,
  type Random,
} from './trace-context';

/** A deterministic random source: the Park-Miller sequence from a fixed non-zero seed (exact in doubles). */
function seeded(seed: number): Random {
  let state = seed;
  return () => {
    state = (state * 48_271) % 2_147_483_647;
    return state / 2_147_483_647;
  };
}

const SPEC_EXAMPLE = '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01';
const PAGE = 'https://shop.example.com';

describe('Module 44 · section 10', () => {
  it('Section 10: a formatted traceparent parses back to the same trace ID, parent ID and flags', () => {
    const parsed = parseTraceparent(SPEC_EXAMPLE);
    expect(parsed).toEqual({
      version: '00',
      traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
      parentId: '00f067aa0ba902b7',
      flags: 1,
      sampled: true,
    });
    expect(parsed && formatTraceparent(parsed)).toBe(SPEC_EXAMPLE);
    // The spec's not-sampled example: flags 00.
    expect(parseTraceparent(SPEC_EXAMPLE.replace(/01$/, '00'))?.sampled).toBe(false);
    // Uppercase hex is outside HEXDIGLC, version ff is invalid, and version 00 allows no extra field.
    expect(parseTraceparent(SPEC_EXAMPLE.toUpperCase())).toBeNull();
    expect(parseTraceparent(SPEC_EXAMPLE.replace(/^00/, 'ff'))).toBeNull();
    expect(parseTraceparent(`${SPEC_EXAMPLE}-extra`)).toBeNull();
    // A higher version is read for its first four fields (§3.2.4).
    expect(parseTraceparent(`01${SPEC_EXAMPLE.slice(2)}-extra`)?.traceId).toBe('4bf92f3577b34da6a3ce929d0e0e4736');
  });

  it('Section 10: an all-zero trace ID or parent ID is rejected', () => {
    expect(parseTraceparent(`00-${'0'.repeat(32)}-00f067aa0ba902b7-01`)).toBeNull();
    expect(parseTraceparent(`00-4bf92f3577b34da6a3ce929d0e0e4736-${'0'.repeat(16)}-01`)).toBeNull();
    // Our generator never produces one, even from a source that starts with zeroes.
    const zeroesFirst: Random = (() => {
      let calls = 0;
      return () => (calls++ < 24 ? 0 : 0.5);
    })();
    const root = startTrace(zeroesFirst, true);
    expect(parseTraceparent(formatTraceparent(root))).not.toBeNull();
  });

  it('Section 10: a child span keeps the trace ID and gets a new parent ID', () => {
    const random = seeded(44);
    const root = startTrace(random, true);
    const child = childOf(root, random);
    expect(child.traceId).toBe(root.traceId);
    expect(child.parentId).not.toBe(root.parentId);
    expect(child.callerSpanId).toBe(root.parentId);
    expect(child.sampled).toBe(true);
    expect(formatTraceparent(child)).toMatch(/^00-[0-9a-f]{32}-[0-9a-f]{16}-01$/);
  });

  it('Section 10: our propagation rule sends traceparent to the same origin and to listed origins only', () => {
    const allow = [/^https:\/\/api\.example\.com\//];
    expect(shouldPropagate('/api/orders', PAGE, [])).toBe(true);
    expect(shouldPropagate(`${PAGE}/api/orders`, PAGE, [])).toBe(true);
    expect(shouldPropagate('https://api.example.com/orders', PAGE, [])).toBe(false);
    expect(shouldPropagate('https://api.example.com/orders', PAGE, allow)).toBe(true);
    expect(shouldPropagate('https://cdn.thirdparty.com/x.js', PAGE, allow)).toBe(false);
    // A string entry must equal the whole URL, as OpenTelemetry's urlMatches compares strings; it is not a prefix.
    expect(shouldPropagate('https://api.example.com/orders', PAGE, ['https://api.example.com'])).toBe(false);
  });

  it('Section 10: our four-hop trace joins the browser span, the Nginx log line and the Spring log line by one trace ID', () => {
    const random = seeded(2026);
    const click = startTrace(random, true);
    const fetchSpan = childOf(click, random);
    const header = formatTraceparent(fetchSpan);
    // Spring reads the header (W3C is in its consume default) and starts a child span under the fetch span.
    const received = parseTraceparent(header);
    expect(received).not.toBeNull();
    const springSpan = received && childOf(received, random);
    expect(springSpan?.callerSpanId).toBe(fetchSpan.parentId);

    const nginxLine = `10.0.0.5 "POST /api/orders HTTP/1.1" 502 traceparent="${header}"`;
    const springLine = `ERROR [${click.traceId}-${springSpan?.parentId}] o.e.OrderController : payment failed`;
    const otherTrace = startTrace(random, true);
    const noise = `INFO [${otherTrace.traceId}-${otherTrace.parentId}] o.e.HealthController : ok`;

    const hops = joinTrace(
      [
        { component: 'browser click', traceId: click.traceId, spanId: click.parentId },
        { component: 'browser fetch', traceId: fetchSpan.traceId, spanId: fetchSpan.parentId },
        hopFromNginxLine(nginxLine),
        hopFromSpringLine(noise),
        hopFromSpringLine(springLine),
      ],
      click.traceId,
    );
    expect(hops.map((hop) => hop.component)).toEqual(['browser click', 'browser fetch', 'nginx', 'spring']);
    // Nginx creates no span: it logs the span ID of the fetch that called it.
    expect(hops[2]?.spanId).toBe(fetchSpan.parentId);
  });
});
