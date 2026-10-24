// Section 4 model: what Nginx sends to the upstream for the proxy directives of labs/angular/deploy/nginx/default.conf.template,
// how long a quiet stream lives, and how an application decides whether forwarded headers may be believed. Our model, not
// Nginx's or Spring's code. It mirrors nginx.org (read 2026-10-22): ngx_http_proxy_module `proxy_pass` (F8: with a URI,
// "the part of a normalized request URI matching the location is replaced by a URI specified in the directive"; without
// one, "the request URI is passed to the server in the same form as sent by a client"), `proxy_set_header` (F9: "Host"
// and "Connection" are not passed, `Host $proxy_host` and `Connection close` are sent instead; a field set to an empty
// string is not passed; the directives are inherited "if and only if there are no proxy_set_header directives defined on
// the current level"), `proxy_read_timeout` (F10: 60s, counted "between two successive read operations") and
// docs/http/websocket.html ("Upgrade" is hop-by-hop, so it is not passed); ngx_http_map_module (`default`). The resolver
// follows the ForwardedHeaderFilter javadoc (Spring Framework 7.0.9, F25): an application "cannot know if forwarded
// headers were added by a trusted proxy or by a malicious client". Walking X-Forwarded-For from the right is our own
// rule, not read from Tomcat. Not modeled: regex locations with a URI, `rewrite`, variables beyond the few listed below,
// `Forwarded`, query strings, IPv6 ranges, TLS, HTTP/2, buffering as bytes. It reuses the Section 3 kernel (nginx-model.ts) to parse the
// file and select the location. Nothing here reads a file, a clock or a network.
import { findDirective, normalizeUri, parseConfig, type Directive, type Location, type Server } from './nginx-model';

/** A header set, names compared without case. */
export type Headers = Readonly<Record<string, string>>;

/** The context the few Nginx variables of the template are resolved from. */
export interface ProxyRequest {
  readonly headers: Headers;
  /** The client address Nginx sees (`$remote_addr`). */
  readonly remoteAddr: string;
  /** `http` or `https`: the connection to this Nginx (`$scheme`). */
  readonly scheme: string;
}

/** `proxy_read_timeout 60s;` is the documented default. */
const DEFAULT_READ_TIMEOUT_SECONDS = 60;
const TIME_UNITS_IN_SECONDS: Readonly<Record<string, number>> = { ms: 0.001, s: 1, m: 60, h: 3600 };
/** Hop-by-hop fields of the request that Nginx does not pass on (websocket.html names Upgrade and Connection). */
const NOT_PASSED = new Set(['host', 'connection', 'upgrade']);

const lower = (name: string): string => name.toLowerCase();

function header(headers: Headers, name: string): string {
  const key = Object.keys(headers).find((candidate) => lower(candidate) === lower(name));
  return key === undefined ? '' : (headers[key] ?? '');
}

/** The URI part of a `proxy_pass` target such as `http://spring:8080/v1/`, or undefined when there is none. */
function targetUri(proxyPass: string): string | undefined {
  return /^[a-z]+:\/\/[^/]+(\/.*)?$/i.exec(proxyPass)?.[1];
}

/** The `host:port` of a `proxy_pass` target: the value of `$proxy_host`. */
function targetHost(proxyPass: string): string {
  return /^[a-z]+:\/\/([^/]+)/i.exec(proxyPass)?.[1] ?? '';
}

/**
 * The request URI the upstream receives. With a URI in `proxy_pass`, the part of the normalized URI that the location
 * matched is replaced by it; without one, the URI goes on as the client sent it. A regular-expression location cannot
 * say what to replace (nginx.org), so it must have no URI and the request goes on unchanged.
 */
export function upstreamUri(location: Location, proxyPass: string, requestUri: string): string {
  const replacement = targetUri(proxyPass);
  if (replacement === undefined || location.modifier === '~' || location.modifier === '~*') {
    return requestUri;
  }
  return `${replacement}${normalizeUri(requestUri).slice(location.pattern.length)}`;
}

/** The `proxy_pass` target of a location, undefined when it has none. */
export function proxyTarget(location: Location): string | undefined {
  return findDirective(location.directives, 'proxy_pass')?.args[0];
}

/** One `map $source $target { … }` block of a configuration: the first match wins, else `default`, else "". */
export interface MapBlock {
  readonly source: string;
  readonly target: string;
  readonly entries: readonly Directive[];
}

/** The top-level `map` blocks of a configuration text (in Nginx they live in `http`; the template sits inside it). */
export function readMaps(text: string): readonly MapBlock[] {
  return parseConfig(text)
    .filter((directive) => directive.name === 'map')
    .map(({ args: [source = '', target = ''], block = [] }) => ({ source, target, entries: block }));
}

function mapValue(block: MapBlock, sourceValue: string): string {
  const exact = block.entries.find((entry) => entry.name === sourceValue);
  const fallback = block.entries.find((entry) => entry.name === 'default');
  return (exact ?? fallback)?.args[0] ?? '';
}

/** Resolves the variables a `proxy_set_header` value may use; an unknown name resolves to "" (our model's limit). */
function expand(value: string, request: ProxyRequest, maps: readonly MapBlock[], proxyHost: string): string {
  return value.replace(/\$([a-z_0-9]+)/gi, (_whole, name: string) => {
    const mapped = maps.find((block) => block.target === `$${name}`);
    const builtIn: Readonly<Record<string, string>> = {
      host: header(request.headers, 'Host'),
      scheme: request.scheme,
      remote_addr: request.remoteAddr,
      proxy_host: proxyHost,
    };
    if (mapped) {
      return mapValue(mapped, expand(mapped.source, request, maps, proxyHost));
    }
    return name.startsWith('http_') ? header(request.headers, name.slice(5).replaceAll('_', '-')) : (builtIn[name] ?? '');
  });
}

/** F9: the location's `proxy_set_header` directives, or the server's when it has none of its own. */
function proxySettings(server: Server, location: Location): readonly Directive[] {
  const own = location.directives.filter((directive) => directive.name === 'proxy_set_header');
  return own.length > 0 ? own : server.directives.filter((directive) => directive.name === 'proxy_set_header');
}

/**
 * The header fields the upstream receives for a request in a proxied location. Fields of the client pass,
 * except Host, Connection and Upgrade; `Host $proxy_host` and `Connection close` are the defaults; each
 * `proxy_set_header` replaces the field of that name; an empty value removes it.
 */
export function upstreamHeaders(
  server: Server,
  location: Location,
  request: ProxyRequest,
  maps: readonly MapBlock[],
): Headers {
  const proxyHost = targetHost(proxyTarget(location) ?? '');
  const sent = new Map<string, [string, string]>();
  for (const [name, value] of Object.entries(request.headers)) {
    if (!NOT_PASSED.has(lower(name))) {
      sent.set(lower(name), [name, value]);
    }
  }
  sent.set('host', ['Host', proxyHost]);
  sent.set('connection', ['Connection', 'close']);
  for (const { args: [name = '', value = ''] } of proxySettings(server, location)) {
    const resolved = expand(value, request, maps, proxyHost);
    if (resolved === '') {
      sent.delete(lower(name));
    } else {
      sent.set(lower(name), [name, resolved]);
    }
  }
  return Object.fromEntries(sent.values());
}

/** `60s`, `1h` or `500ms` in seconds; a bare number is seconds, as in Nginx. */
export function parseSeconds(time: string): number {
  const [, amount = '0', unit = 's'] = /^(\d+(?:\.\d+)?)(ms|s|m|h)?$/.exec(time) ?? [];
  return Number(amount) * (TIME_UNITS_IN_SECONDS[unit] ?? 1);
}

/** F10: the location's `proxy_read_timeout`, else the server's, else the 60-second default. */
export function readTimeoutSeconds(server: Server, location: Location): number {
  const own = findDirective(location.directives, 'proxy_read_timeout') ?? findDirective(server.directives, 'proxy_read_timeout');
  return own?.args[0] === undefined ? DEFAULT_READ_TIMEOUT_SECONDS : parseSeconds(own.args[0]);
}

/**
 * When Nginx closes a stream, given the seconds at which the upstream sent something (the first entry is the
 * response start). The timeout counts only the silence between two reads, so the total length never matters.
 * A silence of exactly the timeout is left out of the model. Returns undefined when the stream is still open at `until`.
 */
export function closedAt(timeoutSeconds: number, writes: readonly number[], until: number): number | undefined {
  let last = 0;
  for (const at of [...writes, until]) {
    if (at - last > timeoutSeconds) {
      return last + timeoutSeconds;
    }
    last = at;
  }
  return undefined;
}

/** The forwarded values an application acts on. */
export interface ClientView {
  readonly clientIp: string;
  readonly scheme: string;
  readonly host: string;
}

/** What the application's server receives: the address of the direct peer and the request's header fields. */
export interface ReceivedRequest {
  readonly peer: string;
  readonly headers: Headers;
  /** The scheme of the connection from the peer. */
  readonly scheme: string;
}

function ipv4(address: string): number | undefined {
  const parts = address.split('.').map(Number);
  const valid = parts.length === 4 && parts.every((part) => Number.isInteger(part) && part >= 0 && part <= 255);
  return valid ? parts.reduce((total, part) => total * 256 + part, 0) : undefined;
}

/** True when the address equals a listed entry or lies inside a listed IPv4 `a.b.c.d/n` range. */
export function isTrusted(address: string, trusted: readonly string[]): boolean {
  const value = ipv4(address);
  return trusted.some((entry) => {
    const [base = '', bits] = entry.split('/');
    const baseValue = ipv4(base);
    if (bits === undefined || value === undefined || baseValue === undefined) {
      return entry === address;
    }
    const size = 2 ** (32 - Number(bits));
    return Math.floor(value / size) === Math.floor(baseValue / size);
  });
}

/** Walks X-Forwarded-For from the right, past trusted proxies; the first other address is the client (our rule). */
function clientFrom(forwardedFor: string, peer: string, trusted: readonly string[]): string {
  const chain = forwardedFor.split(',').map((part) => part.trim()).filter((part) => part !== '');
  const client = [...chain].reverse().find((address) => !isTrusted(address, trusted));
  return client ?? chain[0] ?? peer;
}

/**
 * Forwarded headers count only when the direct peer is a trusted proxy, because the application cannot tell a
 * proxy's header from a client's. From any other peer they are ignored and the connection itself is the truth.
 */
export function resolveClient(request: ReceivedRequest, trustedProxies: readonly string[]): ClientView {
  const direct: ClientView = { clientIp: request.peer, scheme: request.scheme, host: header(request.headers, 'Host') };
  if (!isTrusted(request.peer, trustedProxies)) {
    return direct;
  }
  return {
    clientIp: clientFrom(header(request.headers, 'X-Forwarded-For'), request.peer, trustedProxies),
    scheme: header(request.headers, 'X-Forwarded-Proto') || direct.scheme,
    host: header(request.headers, 'X-Forwarded-Host') || direct.host,
  };
}
