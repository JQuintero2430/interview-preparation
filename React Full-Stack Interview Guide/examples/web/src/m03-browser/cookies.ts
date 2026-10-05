export interface CookieOptions {
  maxAgeSeconds?: number;
  domain?: string;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
  partitioned?: boolean;
}

const TOKEN = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;

/** Build a Set-Cookie header value, enforcing the rules browsers enforce (so mistakes fail loudly here, not silently there). */
export function serializeCookie(name: string, value: string, o: CookieOptions = {}): string {
  if (!TOKEN.test(name)) throw new Error(`Invalid cookie name: ${name}`);
  if (name.startsWith('__Secure-') && !o.secure) throw new Error('__Secure- requires Secure');
  if (name.startsWith('__Host-') && (!o.secure || o.domain !== undefined || o.path !== '/')) {
    throw new Error('__Host- requires Secure, Path=/ and no Domain');
  }
  if (o.sameSite === 'None' && !o.secure) throw new Error('SameSite=None requires Secure');
  if (o.partitioned && !o.secure) throw new Error('Partitioned requires Secure');

  const parts = [`${name}=${encodeURIComponent(value)}`];
  if (o.maxAgeSeconds !== undefined) parts.push(`Max-Age=${Math.floor(o.maxAgeSeconds)}`);
  if (o.domain !== undefined) parts.push(`Domain=${o.domain}`);
  if (o.path !== undefined) parts.push(`Path=${o.path}`);
  if (o.secure) parts.push('Secure');
  if (o.httpOnly) parts.push('HttpOnly');
  if (o.sameSite) parts.push(`SameSite=${o.sameSite}`);
  if (o.partitioned) parts.push('Partitioned');
  return parts.join('; ');
}
