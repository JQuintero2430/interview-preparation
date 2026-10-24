// Exercise 44.2: both variants against the same six criteria. Zoneless TestBed, HttpTestingController as the server,
// an injected BEACON and RANDOM, and a stubbed `document.visibilityState`. Nothing leaves the test.
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { type EnvironmentProviders, type Provider, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { traceRequests } from './a/trace.interceptor';
import { INNER_BACKEND, provideTracingBackend } from './b/tracing-backend';
import {
  BEACON,
  type ErrorReport,
  ErrorReporter,
  RANDOM,
  REPORT_URL,
  TRACE_CONFIG,
  type TraceConfig,
  Tracer,
  formatTraceparent,
} from './tracing';

type Variant = 'a' | 'b';
const VARIANTS: readonly Variant[] = ['a', 'b'];
const PROVIDE_HTTP: Record<Variant, () => (Provider | EnvironmentProviders)[]> = {
  a: () => [provideHttpClient(withInterceptors([traceRequests])), provideHttpClientTesting()],
  // provideHttpClientTesting() registers HttpBackend as its testing backend, whose class Angular does not export; the
  // HttpTestingController is that same instance, so the decorator wraps it. Listed last, because the last provider wins.
  b: () => [
    provideHttpClient(),
    provideHttpClientTesting(),
    provideTracingBackend(),
    { provide: INNER_BACKEND, useExisting: HttpTestingController },
  ],
};

/** Section 10's version-00 format: W3C Trace Context §3.2.2.2, lowercase hex, all-zero IDs forbidden. */
const W3C_VERSION_00 = /^00-(?!0{32})[0-9a-f]{32}-(?!0{16})[0-9a-f]{16}-[0-9a-f]{2}$/;
/** The non-normative example of W3C Trace Context §3.2.3. */
const W3C_EXAMPLE = '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01';

const RELEASE = 'web-1.4.2';
const ERRORS_URL = '/errors';
const CONFIG: TraceConfig = {
  propagateTo: ['https://api.example.com', /^https:\/\/files\.example\.com\/public\//],
  release: RELEASE,
  sampleRate: 0.1,
};
const SERVER_ERROR = { status: 500, statusText: 'Internal Server Error' };
const NOT_FOUND = { status: 404, statusText: 'Not Found' };

function parseReports(body: string): ErrorReport[] {
  const parsed: unknown = JSON.parse(body);
  if (!Array.isArray(parsed)) throw new Error('the beacon body is not an array');
  return parsed;
}

class FakeBeacon {
  readonly sent: { url: string; reports: ErrorReport[] }[] = [];
  accept = true;

  readonly send = (url: string, body: string): boolean => {
    if (this.accept) this.sent.push({ url, reports: parseReports(body) });
    return this.accept;
  };
}

/** The first values decide the sampling draws; after them, a sequence that never repeats a byte run. */
function randomSource(first: number[], rest: () => number): () => number {
  return () => first.shift() ?? rest();
}

function counter(): () => number {
  let n = 0;
  return () => (n++ % 251) / 256 + 1 / 512;
}

function fields(header: string | null): { traceId: string; parentId: string; flags: string } {
  const [, traceId = '', parentId = '', flags = ''] = (header ?? '').split('-');
  return { traceId, parentId, flags };
}

let visibility: DocumentVisibilityState = 'visible';

function hide(): void {
  visibility = 'hidden';
  document.dispatchEvent(new Event('visibilitychange'));
}

describe.each(VARIANTS)('Exercise 44.2 variant %s', (variant) => {
  let beacon = new FakeBeacon();
  let controller: HttpTestingController;
  let http: HttpClient;
  let tracer: Tracer;
  let reporter: ErrorReporter;

  function setUp(random: () => number): void {
    beacon = new FakeBeacon();
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        ...PROVIDE_HTTP[variant](),
        { provide: TRACE_CONFIG, useValue: CONFIG },
        { provide: RANDOM, useValue: random },
        { provide: BEACON, useValue: beacon.send },
        { provide: REPORT_URL, useValue: ERRORS_URL },
      ],
    });
    controller = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
    tracer = TestBed.inject(Tracer);
    reporter = TestBed.inject(ErrorReporter);
  }

  function send(url: string): void {
    http.get(url).subscribe({ error: () => undefined });
  }

  function headerOf(url: string): string | null {
    const request = controller.expectOne(url);
    const header = request.request.headers.get('traceparent');
    request.flush({});
    return header;
  }

  beforeEach(() => {
    visibility = 'visible';
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => visibility });
  });

  afterEach(() => {
    controller.verify();
    Reflect.deleteProperty(document, 'visibilityState');
  });

  it('adds a valid `traceparent` to same-origin and allow-listed URLs and none to other origins', () => {
    expect(formatTraceparent('4bf92f3577b34da6a3ce929d0e0e4736', '00f067aa0ba902b7', true)).toBe(W3C_EXAMPLE);
    setUp(randomSource([], counter()));
    const listed = [
      '/api/orders',
      `${document.location.origin}/api/cart`,
      'https://api.example.com/orders?page=2',
      'https://files.example.com/public/terms.json',
    ];
    const unlisted = [
      'https://cdn.other.example/lib.js',
      'https://files.example.com/private/keys.json',
      'https://api.example.com.evil.test/orders',
    ];
    tracer.startInteraction('load');
    [...listed, ...unlisted].forEach(send);

    for (const url of listed) expect(headerOf(url)).toMatch(W3C_VERSION_00);
    for (const url of unlisted) expect(headerOf(url)).toBeNull();
  });

  it('gives requests in one interaction the same trace ID and different parent IDs', () => {
    setUp(randomSource([], counter()));
    const urls = ['/api/cart', '/api/orders', 'https://api.example.com/payments'];
    const interaction = tracer.startInteraction('pay');
    urls.forEach(send);
    const sent = urls.map((url) => fields(headerOf(url)));

    expect(sent.map((field) => field.traceId)).toEqual([interaction.traceId, interaction.traceId, interaction.traceId]);
    expect(new Set(sent.map((field) => field.parentId)).size).toBe(3);

    tracer.endInteraction();
    send('/api/cart');
    expect(fields(headerOf('/api/cart')).traceId).not.toBe(interaction.traceId);
  });

  it('decides sampling once per interaction and sets the sampled flag to match', () => {
    // The first draw is the interaction's; every later draw would flip the decision if it were drawn again.
    setUp(randomSource([0.05], () => 0.99));
    expect(tracer.startInteraction('pay').sampled).toBe(true);
    ['/api/a', '/api/b', '/api/c'].forEach(send);
    expect(['/api/a', '/api/b', '/api/c'].map((url) => fields(headerOf(url)).flags)).toEqual(['01', '01', '01']);

    TestBed.resetTestingModule();
    setUp(randomSource([0.5], counter()));
    expect(tracer.startInteraction('browse').sampled).toBe(false);
    ['/api/a', '/api/b'].forEach(send);
    expect(['/api/a', '/api/b'].map((url) => fields(headerOf(url)).flags)).toEqual(['00', '00']);
  });

  it('turns a failed request (a 5xx or a network error) into one report with the trace ID, the release and the route', () => {
    setUp(randomSource([], counter()));
    reporter.setRoute('/checkout');
    const interaction = tracer.startInteraction('pay');
    send('/api/orders');
    send('https://cdn.other.example/lib.js');
    send('/api/missing');
    controller.expectOne('/api/orders').flush({ error: 'boom' }, SERVER_ERROR);
    controller.expectOne('https://cdn.other.example/lib.js').error(new ProgressEvent('error'));
    controller.expectOne('/api/missing').flush(null, NOT_FOUND);
    reporter.flush();

    const reports = beacon.sent[0]?.reports ?? [];
    expect(reports.map((report) => report.status)).toEqual([500, 0]);
    for (const report of reports) {
      expect(report).toEqual(
        expect.objectContaining({ traceId: interaction.traceId, release: RELEASE, route: '/checkout' }),
      );
    }
  });

  it('queues reports and sends them in one beacon when the document becomes hidden', () => {
    setUp(randomSource([], counter()));
    send('/api/a');
    send('/api/b');
    controller.expectOne('/api/a').flush(null, SERVER_ERROR);
    controller.expectOne('/api/b').error(new ProgressEvent('error'));
    expect(beacon.sent).toHaveLength(0);

    hide();
    expect(beacon.sent).toHaveLength(1);
    expect(beacon.sent[0]?.url).toBe(ERRORS_URL);
    expect(beacon.sent[0]?.reports).toHaveLength(2);

    hide();
    expect(beacon.sent).toHaveLength(1);
  });

  it('keeps the batch for the next flush when the beacon refuses it', () => {
    setUp(randomSource([], counter()));
    beacon.accept = false;
    send('/api/a');
    controller.expectOne('/api/a').flush(null, SERVER_ERROR);
    hide();
    expect(beacon.sent).toHaveLength(0);

    beacon.accept = true;
    send('/api/b');
    controller.expectOne('/api/b').flush(null, SERVER_ERROR);
    hide();
    expect(beacon.sent).toHaveLength(1);
    expect(beacon.sent[0]?.reports.map((report) => report.message)).toEqual([
      expect.stringContaining('/api/a'),
      expect.stringContaining('/api/b'),
    ]);
  });
});
