// Exercise 09.1: a pure model of the CORS rules MDN and the Fetch Standard state. It is not a browser.

export interface CorsRequest {
  /** The page's origin, for example `https://app.example.com`. */
  readonly origin: string;
  readonly method: string;
  /** Request headers the script sets, by name (any case). */
  readonly headers?: Readonly<Record<string, string>>;
  /** True for `credentials: 'include'`. */
  readonly credentials?: boolean;
}

/** What the server answered, whether to the preflight or to the real request. */
export interface CorsAnswer {
  readonly status: number;
  /** Response headers, by name (any case). */
  readonly headers: Readonly<Record<string, string>>;
}

export interface CorsOutcome {
  /** False when a failed preflight stops the real request. */
  readonly sent: boolean;
  /** True when script may read the response. */
  readonly readable: boolean;
  readonly reason: string;
}

const SAFE_METHODS = ['GET', 'HEAD', 'POST'];
const SAFE_CONTENT_TYPES = ['application/x-www-form-urlencoded', 'multipart/form-data', 'text/plain'];
const SAFE_HEADERS = ['accept', 'accept-language', 'content-language'];

const lowerKeys = (headers: Readonly<Record<string, string>> = {}): Map<string, string> =>
  new Map(Object.entries(headers).map(([name, value]) => [name.toLowerCase(), value]));

/** The request headers that are not CORS-safelisted, lowercased. A JSON `Content-Type` counts. */
const unsafeHeaderNames = (request: CorsRequest): string[] =>
  [...lowerKeys(request.headers)].flatMap(([name, value]) => {
    if (SAFE_HEADERS.includes(name)) return [];
    if (name === 'content-type') return SAFE_CONTENT_TYPES.includes(value.split(';')[0]!.trim().toLowerCase()) ? [] : [name];
    if (name === 'range') return /^bytes=\d+-\d*$/.test(value) ? [] : [name];
    return [name];
  });

/** A request is simple (no preflight) when its method and all its headers are safelisted. */
export const needsPreflight = (request: CorsRequest): boolean =>
  !SAFE_METHODS.includes(request.method) || unsafeHeaderNames(request).length > 0;

/** The CORS check: the answer names this origin (or `*`), and credentials need the exact origin plus `Allow-Credentials: true`. */
const originCheck = (request: CorsRequest, answer: CorsAnswer): string | undefined => {
  const headers = lowerKeys(answer.headers);
  const allowed = headers.get('access-control-allow-origin');
  if (allowed !== '*' && allowed !== request.origin) return 'Access-Control-Allow-Origin does not allow this origin';
  if (request.credentials && allowed === '*') return 'a wildcard origin is rejected for credentialed requests';
  if (request.credentials && headers.get('access-control-allow-credentials') !== 'true') return 'Access-Control-Allow-Credentials: true is missing';
  return undefined;
};

const listOf = (value: string | undefined): string[] => (value ?? '').split(',').map((item) => item.trim()).filter(Boolean);

/** The preflight answer must pass the origin check, be ok, and allow the method and every unsafe header name. */
const preflightCheck = (request: CorsRequest, preflight: CorsAnswer): string | undefined => {
  const failure = originCheck(request, preflight);
  if (failure) return failure;
  if (preflight.status < 200 || preflight.status > 299) return 'the preflight status is not ok';
  const headers = lowerKeys(preflight.headers);
  if (!SAFE_METHODS.includes(request.method) && !listOf(headers.get('access-control-allow-methods')).includes(request.method)) return 'the method is not allowed';
  const allowedNames = listOf(headers.get('access-control-allow-headers')).map((name) => name.toLowerCase());
  const missing = unsafeHeaderNames(request).find((name) => !allowedNames.includes(name));
  return missing ? `the header ${missing} is not allowed` : undefined;
};

/** Decides whether the real request is sent and whether its response is readable. */
export const checkCors = (input: { request: CorsRequest; preflight?: CorsAnswer; response: CorsAnswer }): CorsOutcome => {
  const { request, preflight, response } = input;
  if (needsPreflight(request)) {
    const failure = preflight ? preflightCheck(request, preflight) : 'a preflight answer is required';
    if (failure) return { sent: false, readable: false, reason: `preflight failed: ${failure}` };
  }
  const failure = originCheck(request, response);
  return failure ? { sent: true, readable: false, reason: failure } : { sent: true, readable: true, reason: 'allowed' };
};
