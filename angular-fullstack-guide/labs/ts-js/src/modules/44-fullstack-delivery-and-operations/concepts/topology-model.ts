// Section 1 model: what one screen costs the browser under four ways of reaching Spring Boot. Our model, not a
// gateway's or Nginx's code. It mirrors the rules module 09 section 5 teaches (same origin means same scheme, host and
// port; a cross-origin request is preflighted unless it is a GET, HEAD or POST with a form or plain-text body) and the
// placements of 44 section 1 (facts F32 and 42 section 3). It counts a cold preflight cache: a browser may reuse a
// preflight answer for Access-Control-Max-Age, so the preflight cost shown here is the first one. The caller passes
// every origin; nothing here opens a connection or reads a clock.

export type Topology = 'direct' | 'proxy' | 'gateway' | 'bff';

export type Method = 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE';

export interface Call {
  /** Where the call goes when nothing sits in between, such as `https://api.example.com`. */
  readonly origin: string;
  readonly method: Method;
  /** The `Content-Type` of the body, if any. */
  readonly contentType?: string;
}

export interface Screen {
  /** The origin that served the Angular app. */
  readonly pageOrigin: string;
  /** What the screen needs from the services. */
  readonly calls: readonly Call[];
  /** The origin of the gateway or the BFF (the proxy always shares the page's origin). */
  readonly edgeOrigin: string;
}

export interface Plan {
  /** Requests the browser sends for the screen. */
  readonly requests: number;
  /** Extra `OPTIONS` requests the browser sends first. */
  readonly preflights: number;
  /** Requests plus preflights. */
  readonly roundTrips: number;
  /** The origins that must answer with CORS headers. */
  readonly corsRequiredOn: readonly string[];
  /** What the browser stores and sends: only a BFF keeps the token on the server (42 section 3). */
  readonly browserHolds: 'bearer token' | 'session cookie';
}

const simpleMethods: ReadonlySet<string> = new Set(['GET', 'HEAD', 'POST']);
const simpleTypes: ReadonlySet<string> = new Set(['application/x-www-form-urlencoded', 'multipart/form-data', 'text/plain']);

function sameOrigin(a: string, b: string): boolean {
  return new URL(a).origin === new URL(b).origin;
}

function isPreflighted(call: Call): boolean {
  if (!simpleMethods.has(call.method)) return true;
  return call.contentType !== undefined && !simpleTypes.has(call.contentType);
}

/** The requests the browser sends: a BFF turns the screen's reads into one request shaped for that screen. */
function requestsSent(topology: Topology, screen: Screen): readonly Call[] {
  switch (topology) {
    case 'direct':
      return screen.calls;
    case 'proxy':
      return screen.calls.map((call) => ({ ...call, origin: screen.pageOrigin }));
    case 'gateway':
      return screen.calls.map((call) => ({ ...call, origin: screen.edgeOrigin }));
    case 'bff':
      return screen.calls.length === 0 ? [] : [{ origin: screen.edgeOrigin, method: 'GET' }];
  }
}

/** Counts what the browser pays for one screen under one topology. */
export function requestPlan(topology: Topology, screen: Screen): Plan {
  const sent = requestsSent(topology, screen);
  const crossOrigin = sent.filter((call) => !sameOrigin(call.origin, screen.pageOrigin));
  const preflights = crossOrigin.filter(isPreflighted).length;
  return {
    requests: sent.length,
    preflights,
    roundTrips: sent.length + preflights,
    corsRequiredOn: Array.from(new Set(crossOrigin.map((call) => new URL(call.origin).origin))),
    browserHolds: topology === 'bff' ? 'session cookie' : 'bearer token',
  };
}
