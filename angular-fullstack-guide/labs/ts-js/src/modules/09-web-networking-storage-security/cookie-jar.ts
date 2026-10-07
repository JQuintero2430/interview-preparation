// Exercise 09.3: a cookie jar that stores and sends cookies by the rules of RFC 6265bis, without a public-suffix list.

export type SameSite = 'Strict' | 'Lax' | 'None';

export interface Cookie {
  readonly name: string;
  readonly value: string;
  readonly domain: string;
  /** True when the server sent no `Domain`: only the exact host receives the cookie. */
  readonly hostOnly: boolean;
  readonly path: string;
  readonly secure: boolean;
  readonly httpOnly: boolean;
  /** `undefined` when the header had no (valid) `SameSite`: treated as `Lax`. */
  readonly sameSite: SameSite | undefined;
  /** Epoch milliseconds, or `undefined` for a session cookie. */
  readonly expiresAt: number | undefined;
}

export interface RequestContext {
  /** The request starts on another site than its target. Default false. */
  readonly crossSite?: boolean;
  /** The request is a top-level navigation (the address bar changes). Default false. */
  readonly topLevelNavigation?: boolean;
  /** Default `GET`. */
  readonly method?: string;
}

/** The default path of RFC 6265bis §5.1.4: the URL's directory, or `/`. */
const defaultPath = (pathname: string): string => {
  const last = pathname.lastIndexOf('/');
  return pathname.startsWith('/') && last > 0 ? pathname.slice(0, last) : '/';
};

const pathMatches = (cookiePath: string, requestPath: string): boolean =>
  requestPath === cookiePath || (requestPath.startsWith(cookiePath) && (cookiePath.endsWith('/') || requestPath[cookiePath.length] === '/'));

const domainMatches = (host: string, domain: string): boolean => host === domain || host.endsWith(`.${domain}`);

export class CookieJar {
  private cookies: Cookie[] = [];

  constructor(private readonly now: () => number = Date.now) {}

  /** Stores the cookie in a `Set-Cookie` header received from `url`. Returns false when the jar rejects it. */
  set(setCookie: string, url: string): boolean {
    const { hostname, pathname } = new URL(url);
    const [pair = '', ...attributes] = setCookie.split(';').map((part) => part.trim());
    const equals = pair.indexOf('=');
    if (equals < 1) return false;
    const name = pair.slice(0, equals).trim();
    const value = pair.slice(equals + 1).trim();
    const attribute = new Map(attributes.map((part): [string, string] => {
      const at = part.indexOf('=');
      return at < 0 ? [part.toLowerCase(), ''] : [part.slice(0, at).trim().toLowerCase(), part.slice(at + 1).trim()];
    }));

    const domainAttribute = attribute.get('domain')?.replace(/^\./, '').toLowerCase();
    if (domainAttribute && !domainMatches(hostname, domainAttribute)) return false;
    const path = attribute.get('path')?.startsWith('/') ? attribute.get('path')! : defaultPath(pathname);
    const secure = attribute.has('secure');
    const sameSiteText = attribute.get('samesite')?.toLowerCase();
    const sameSite = (['Strict', 'Lax', 'None'] as const).find((option) => option.toLowerCase() === sameSiteText);

    if (name.startsWith('__Secure-') && !secure) return false;
    if (name.startsWith('__Host-') && (!secure || path !== '/' || domainAttribute)) return false;
    if (sameSite === 'None' && !secure) return false;

    const maxAge = attribute.has('max-age') && /^-?\d+$/.test(attribute.get('max-age')!) ? Number(attribute.get('max-age')) : undefined;
    const cookie: Cookie = {
      name, value, path, secure, sameSite,
      domain: domainAttribute ?? hostname,
      hostOnly: !domainAttribute,
      httpOnly: attribute.has('httponly'),
      expiresAt: maxAge === undefined ? undefined : this.now() + maxAge * 1000,
    };
    this.cookies = this.cookies.filter((old) => !(old.name === name && old.domain === cookie.domain && old.path === path && old.hostOnly === cookie.hostOnly));
    if (maxAge === undefined || maxAge > 0) this.cookies.push(cookie);
    return true;
  }

  /** Snapshot of the stored, unexpired cookies. */
  all(): readonly Cookie[] {
    return this.cookies.filter((cookie) => cookie.expiresAt === undefined || cookie.expiresAt > this.now());
  }

  /** The `Cookie` header value the browser would send to `url` in this request context (empty when none). */
  cookieHeader(url: string, context: RequestContext = {}): string {
    return this.matching(url, context).map(({ name, value }) => `${name}=${value}`).join('; ');
  }

  /** What `document.cookie` would show on a page at `url`: everything except `HttpOnly`. */
  scriptView(url: string): string {
    return this.matching(url, {}).filter((cookie) => !cookie.httpOnly).map(({ name, value }) => `${name}=${value}`).join('; ');
  }

  private matching(url: string, { crossSite = false, topLevelNavigation = false, method = 'GET' }: RequestContext): Cookie[] {
    const { protocol, hostname, pathname } = new URL(url);
    const sameSiteAllows = (cookie: Cookie): boolean => {
      if (!crossSite) return true;
      const policy = cookie.sameSite ?? 'Lax';
      return policy === 'None' || (policy === 'Lax' && topLevelNavigation && method.toUpperCase() === 'GET');
    };
    return this.all()
      .filter((cookie) => (cookie.hostOnly ? hostname === cookie.domain : domainMatches(hostname, cookie.domain)))
      .filter((cookie) => pathMatches(cookie.path, pathname) && (!cookie.secure || protocol === 'https:'))
      .filter(sameSiteAllows)
      .sort((a, b) => b.path.length - a.path.length);
  }
}
