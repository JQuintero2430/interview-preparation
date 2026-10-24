// Section 3 model: how Nginx picks a `location`, runs `try_files`, resolves `add_header` and serves `gzip_static` files,
// for the directive subset of labs/angular/deploy/nginx/default.conf.template. Our model, not Nginx's code. It mirrors
// nginx.org (read 2026-10-22): ngx_http_core_module `location` (F5: exact "=" ends the search; the longest prefix is
// remembered; "^~" on it skips the regular expressions; otherwise regular expressions "in the order of their appearance"
// and the first match wins; otherwise the remembered prefix), the normalized URI (F4) and `try_files` (the first file
// found, else "an internal redirect to the uri specified in the last parameter", or "=code"); ngx_http_headers_module
// `add_header` (F6: inherited "if and only if there are no add_header directives defined on the current level"; only
// the status list below unless `always`) and `add_header_inherit` ("appeared in version 1.29.3"; `merge` appends the
// previous level's headers to the current level's); ngx_http_gzip_static_module and `gzip_vary` (F7). Two details come
// from the nginx `release-1.31.8` sources: `merge` puts the parent's headers after the location's own
// (ngx_http_headers_filter_module.c), and with `gzip_static on` the `Vary: Accept-Encoding` header is sent whenever
// the .gz file exists, compressed or not (ngx_http_gzip_static_module.c). Not modeled: nested and named locations,
// predicate locations (mainline 1.31.5), `if`, `rewrite`, `expires`, `index` other than index.html, `try_files` at
// server level, on-the-fly gzip, query strings and Content-Type. Nothing here reads a file, a clock or a network.

/** One directive: its name, its arguments with quotes removed, and its block when it has one (`server`, `location`). */
export interface Directive {
  readonly name: string;
  readonly args: readonly string[];
  readonly block?: readonly Directive[];
}

/** `=` exact, `^~` prefix that skips regular expressions, `~` and `~*` regular expressions, `''` plain prefix. */
export type LocationModifier = '=' | '^~' | '~' | '~*' | '';

export interface Location {
  readonly modifier: LocationModifier;
  readonly pattern: string;
  readonly directives: readonly Directive[];
}

/** One `server` block: its own directives (locations excluded) and its locations in file order. */
export interface Server {
  readonly directives: readonly Directive[];
  readonly locations: readonly Location[];
}

export interface ResponseHeader {
  readonly name: string;
  readonly value: string;
}

export interface StaticRequest {
  readonly uri: string;
  readonly acceptEncoding?: string;
}

export interface StaticResponse {
  readonly status: number;
  /** The location that produced the response, after any internal redirect; undefined when none matched. */
  readonly location?: Location;
  /** The file path sent with a 200. */
  readonly file?: string;
  readonly headers: readonly ResponseHeader[];
}

/** The statuses `add_header` and `expires` act on without `always` (ngx_http_headers_module). */
export const ADD_HEADER_STATUSES: readonly number[] = [200, 201, 204, 206, 301, 302, 303, 304, 307, 308];

/** `root html;` is the documented default. */
const DEFAULT_ROOT = 'html';
/** `index index.html;` is the documented default of ngx_http_index_module. */
const INDEX_FILE = 'index.html';
/** Our guard against a redirect loop; Nginx has its own limit, not modeled. */
const MAX_INTERNAL_REDIRECTS = 10;
const LOCATION_MODIFIERS: readonly LocationModifier[] = ['=', '^~', '~', '~*'];
const VARY_ACCEPT_ENCODING: ResponseHeader = { name: 'Vary', value: 'Accept-Encoding' };
const CONTENT_ENCODING_GZIP: ResponseHeader = { name: 'Content-Encoding', value: 'gzip' };
const PUNCTUATION = new Set([';', '{', '}']);
const QUOTES = new Set(['"', "'"]);
const ESCAPES: Readonly<Record<string, string>> = { '"': '"', "'": "'", '\\': '\\', t: '\t', r: '\r', n: '\n' };

interface Token {
  readonly text: string;
  /** True for `;`, `{` and `}` outside quotes. */
  readonly punctuation: boolean;
}

type Outcome =
  | { readonly kind: 'file'; readonly path: string }
  | { readonly kind: 'status'; readonly status: number }
  | { readonly kind: 'redirect'; readonly uri: string };

/** Reads a quoted string starting at `start` (the quote); returns its text and the index after the closing quote. */
function readQuoted(text: string, start: number): [string, number] {
  const quote = text[start];
  let value = '';
  let i = start + 1;
  while (i < text.length && text[i] !== quote) {
    const next = text[i + 1] ?? '';
    // As nginx's parser does: \" \' \\ \t \r \n are escapes; any other backslash stays, so "\." reaches PCRE intact.
    const escaped = text[i] === '\\' ? ESCAPES[next] : undefined;
    value += escaped ?? text[i];
    i += escaped === undefined ? 1 : 2;
  }
  return [value, i + 1];
}

/** Reads an unquoted word; `${NAME}` stays one word although it holds braces. */
function readWord(text: string, start: number): [string, number] {
  let i = start;
  while (i < text.length && !/[\s;{}]/.test(text[i] ?? '')) {
    const close = text.startsWith('${', i) ? text.indexOf('}', i) : -1;
    i = close === -1 ? i + 1 : close + 1;
  }
  return [text.slice(start, i), i];
}

function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < text.length) {
    const char = text[i] ?? '';
    if (/\s/.test(char)) {
      i += 1;
    } else if (char === '#') {
      const end = text.indexOf('\n', i);
      i = end === -1 ? text.length : end;
    } else if (PUNCTUATION.has(char)) {
      tokens.push({ text: char, punctuation: true });
      i += 1;
    } else {
      const [word, next] = QUOTES.has(char) ? readQuoted(text, i) : readWord(text, i);
      tokens.push({ text: word, punctuation: false });
      i = next;
    }
  }
  return tokens;
}

/** Parses directives until a closing `}` or the end; returns them and the index of the next unread token. */
function parseBlock(tokens: readonly Token[], start: number): [Directive[], number] {
  const directives: Directive[] = [];
  let words: string[] = [];
  let i = start;
  while (i < tokens.length) {
    const token = tokens[i] ?? { text: '}', punctuation: true };
    i += 1;
    if (!token.punctuation) {
      words.push(token.text);
    } else if (token.text === '}') {
      return [directives, i];
    } else if (token.text === ';') {
      directives.push({ name: words[0] ?? '', args: words.slice(1) });
      words = [];
    } else {
      const [block, next] = parseBlock(tokens, i);
      directives.push({ name: words[0] ?? '', args: words.slice(1), block });
      words = [];
      i = next;
    }
  }
  return [directives, i];
}

/**
 * Parses Nginx configuration text into directives and blocks. Comments go; quotes are removed with nginx's escapes.
 * It checks no directive name and no context: it reads a file Nginx would accept, it does not validate one.
 */
export function parseConfig(text: string): readonly Directive[] {
  return parseBlock(tokenize(text), 0)[0];
}

/** The first directive with this name at this level, or undefined. */
export function findDirective(directives: readonly Directive[], name: string): Directive | undefined {
  return directives.find((directive) => directive.name === name);
}

function toLocation(directive: Directive): Location {
  const [first = '', second] = directive.args;
  const modifier = LOCATION_MODIFIERS.find((candidate) => candidate === first);
  const directives = directive.block ?? [];
  return modifier === undefined || second === undefined
    ? { modifier: '', pattern: first, directives }
    : { modifier, pattern: second, directives };
}

/** The first `server` block of a configuration text, with its locations split out in file order. */
export function readServer(text: string): Server {
  const server = findDirective(parseConfig(text), 'server');
  const body = server?.block ?? [];
  return {
    directives: body.filter((directive) => directive.name !== 'location'),
    locations: body.filter((directive) => directive.name === 'location').map(toLocation),
  };
}

/**
 * F4: decodes %XX, resolves "." and ".." segments and merges adjacent slashes, as Nginx does before matching.
 * Our model keeps a ".." above the root at the root; what Nginx does with one is not modeled.
 */
export function normalizeUri(raw: string): string {
  const segments: string[] = [];
  for (const segment of decodeURIComponent(raw).split('/')) {
    if (segment === '..') {
      segments.pop();
    } else if (segment !== '.' && segment !== '') {
      segments.push(segment);
    }
  }
  const trailing = /\/\.{0,2}$/.test(raw) && segments.length > 0 ? '/' : '';
  return `/${segments.join('/')}${trailing}`;
}

function isRegex(location: Location): boolean {
  return location.modifier === '~' || location.modifier === '~*';
}

function isPrefix(location: Location): boolean {
  return location.modifier === '' || location.modifier === '^~';
}

/** `~*` is case-insensitive, `~` case-sensitive; the patterns this lab uses mean the same in PCRE and JavaScript. */
function regexMatches(location: Location, uri: string): boolean {
  return new RegExp(location.pattern, location.modifier === '~*' ? 'i' : '').test(uri);
}

function longestPrefix(locations: readonly Location[], uri: string): Location | undefined {
  return locations
    .filter((location) => isPrefix(location) && uri.startsWith(location.pattern))
    .reduce<Location | undefined>(
      (best, location) => (location.pattern.length > (best?.pattern.length ?? -1) ? location : best),
      undefined,
    );
}

/**
 * The location that serves a normalized URI, in nginx.org's order: an exact `=` match ends the search; the longest
 * matching prefix is remembered, and if it has `^~` it wins; otherwise the first regular expression that matches, in
 * file order; otherwise the remembered prefix. Undefined when nothing matches.
 */
export function selectLocation(server: Server, uri: string): Location | undefined {
  const exact = server.locations.find((location) => location.modifier === '=' && location.pattern === uri);
  if (exact) {
    return exact;
  }
  const prefix = longestPrefix(server.locations, uri);
  if (prefix?.modifier === '^~') {
    return prefix;
  }
  return server.locations.find((location) => isRegex(location) && regexMatches(location, uri)) ?? prefix;
}

/** The first argument of a directive set in the location, else in the server, else undefined. */
function setting(server: Server, location: Location | undefined, name: string): string | undefined {
  const own = findDirective(location?.directives ?? [], name) ?? findDirective(server.directives, name);
  return own?.args[0];
}

interface DeclaredHeader extends ResponseHeader {
  readonly always: boolean;
}

function declaredHeaders(directives: readonly Directive[]): DeclaredHeader[] {
  return directives
    .filter((directive) => directive.name === 'add_header')
    .map(({ args: [name = '', value = '', flag] }) => ({ name, value, always: flag === 'always' }));
}

function declaredForLocation(server: Server, location: Location | undefined): DeclaredHeader[] {
  const inherited = declaredHeaders(server.directives);
  if (!location) {
    return inherited;
  }
  const own = declaredHeaders(location.directives);
  const mode = setting(server, location, 'add_header_inherit') ?? 'on';
  if (mode === 'off' || inherited.length === 0) {
    return own;
  }
  if (own.length === 0) {
    return inherited;
  }
  return mode === 'merge' ? [...own, ...inherited] : own;
}

/**
 * The `add_header` fields a response carries: the location's own, or the server's when the location has none
 * (`add_header_inherit merge` appends the server's after the location's own; `off` inherits nothing); a header
 * without `always` is dropped unless the status is in {@link ADD_HEADER_STATUSES}.
 */
export function resolveHeaders(
  server: Server,
  location: Location | undefined,
  status: number,
): readonly ResponseHeader[] {
  return declaredForLocation(server, location)
    .filter((header) => header.always || ADD_HEADER_STATUSES.includes(status))
    .map(({ name, value }) => ({ name, value }));
}

/** The file path for a URI: `alias` replaces the location's prefix, `root` is prepended to the whole URI. */
function filePath(server: Server, location: Location | undefined, uri: string): string {
  const alias = findDirective(location?.directives ?? [], 'alias')?.args[0];
  const path = alias === undefined || !location || isRegex(location)
    ? `${setting(server, location, 'root') ?? DEFAULT_ROOT}${uri}`
    : `${alias}${uri.slice(location.pattern.length)}`;
  return path.replace(/\/{2,}/g, '/');
}

/** A URI ending in "/" names a folder: its index.html by internal redirect, 403 without one, nothing if absent. */
function checkFolder(
  server: Server,
  location: Location | undefined,
  uri: string,
  files: ReadonlySet<string>,
): Outcome | undefined {
  const folder = filePath(server, location, uri);
  if (files.has(`${folder}${INDEX_FILE}`)) {
    return { kind: 'redirect', uri: `${uri}${INDEX_FILE}` };
  }
  return [...files].some((file) => file.startsWith(folder)) ? { kind: 'status', status: 403 } : undefined;
}

function check(
  server: Server,
  location: Location | undefined,
  uri: string,
  files: ReadonlySet<string>,
): Outcome | undefined {
  if (uri.endsWith('/')) {
    return checkFolder(server, location, uri, files);
  }
  const path = filePath(server, location, uri);
  return files.has(path) ? { kind: 'file', path } : undefined;
}

/** `try_files`: the first parameter that exists wins; the last one is "=code" or a URI for an internal redirect. */
function tryFiles(
  server: Server,
  location: Location,
  args: readonly string[],
  uri: string,
  files: ReadonlySet<string>,
): Outcome {
  for (const parameter of args.slice(0, -1)) {
    const found = check(server, location, parameter.replaceAll('$uri', uri), files);
    if (found) {
      return found;
    }
  }
  const last = (args.at(-1) ?? '').replaceAll('$uri', uri);
  return last.startsWith('=') ? { kind: 'status', status: Number(last.slice(1)) } : { kind: 'redirect', uri: last };
}

function content(server: Server, location: Location | undefined, uri: string, files: ReadonlySet<string>): Outcome {
  const tryFilesDirective = findDirective(location?.directives ?? [], 'try_files');
  if (location && tryFilesDirective) {
    return tryFiles(server, location, tryFilesDirective.args, uri, files);
  }
  return check(server, location, uri, files) ?? { kind: 'status', status: 404 };
}

/** True when Accept-Encoding lists gzip with a quality above zero. */
export function acceptsGzip(acceptEncoding: string | undefined): boolean {
  return (acceptEncoding ?? '').split(',').some((entry) => {
    const [coding = '', ...params] = entry.split(';').map((part) => part.trim().toLowerCase());
    const quality = params.find((param) => param.startsWith('q='));
    return coding === 'gzip' && (quality === undefined || Number(quality.slice(2)) > 0);
  });
}

/** `gzip_static`: `on` sends file.gz to a client that accepts gzip (with Vary when `gzip_vary on`); `always` to everyone. */
function gzipStatic(
  server: Server,
  location: Location | undefined,
  path: string,
  request: StaticRequest,
  files: ReadonlySet<string>,
): Pick<StaticResponse, 'file' | 'headers'> {
  const mode = setting(server, location, 'gzip_static') ?? 'off';
  const compressed = `${path}.gz`;
  if (mode === 'off' || !files.has(compressed)) {
    return { file: path, headers: [] };
  }
  const vary = mode === 'on' && setting(server, location, 'gzip_vary') === 'on' ? [VARY_ACCEPT_ENCODING] : [];
  const sendCompressed = mode === 'always' || acceptsGzip(request.acceptEncoding);
  return sendCompressed ? { file: compressed, headers: [CONTENT_ENCODING_GZIP, ...vary] } : { file: path, headers: vary };
}

function finish(
  server: Server,
  location: Location | undefined,
  outcome: Outcome,
  request: StaticRequest,
  files: ReadonlySet<string>,
): StaticResponse {
  if (outcome.kind !== 'file') {
    const status = outcome.kind === 'status' ? outcome.status : 500;
    return { status, location, headers: resolveHeaders(server, location, status) };
  }
  const sent = gzipStatic(server, location, outcome.path, request, files);
  return { status: 200, location, file: sent.file, headers: [...resolveHeaders(server, location, 200), ...sent.headers] };
}

/**
 * Answers a GET for a static file: normalizes the URI, selects a location, runs `try_files` (or serves the URI),
 * follows internal redirects by selecting again, then adds that final location's headers and the `gzip_static` choice.
 * `files` holds full file paths, such as `/usr/share/nginx/html/index.html` (see {@link siteFiles}).
 */
export function respond(server: Server, request: StaticRequest, files: ReadonlySet<string>): StaticResponse {
  let uri = normalizeUri(request.uri);
  for (let redirects = 0; redirects <= MAX_INTERNAL_REDIRECTS; redirects += 1) {
    const location = selectLocation(server, uri);
    const outcome = content(server, location, uri, files);
    if (outcome.kind !== 'redirect') {
      return finish(server, location, outcome, request, files);
    }
    uri = normalizeUri(outcome.uri);
  }
  return finish(server, undefined, { kind: 'status', status: 500 }, request, files);
}

/** Full paths for site-relative names under the server's `root`, such as `index.html` or `media/logo-AB12cd_-.png`. */
export function siteFiles(server: Server, names: readonly string[]): ReadonlySet<string> {
  const root = setting(server, undefined, 'root') ?? DEFAULT_ROOT;
  return new Set(names.map((name) => `${root}/${name}`.replace(/\/{2,}/g, '/')));
}

/** Every value of one response header, compared without case, in the order they were added. */
export function headerValues(response: StaticResponse, name: string): readonly string[] {
  return response.headers.filter((header) => header.name.toLowerCase() === name.toLowerCase()).map((header) => header.value);
}

/** A readable name for a location, such as `= /index.html`, `~ ^/x$` or `/`. */
export function describeLocation(location: Location | undefined): string {
  if (!location) {
    return '(none)';
  }
  return location.modifier === '' ? location.pattern : `${location.modifier} ${location.pattern}`;
}
