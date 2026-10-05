/** Parse a Cache-Control header into directives: `max-age=60, public` -> { 'max-age': '60', public: true }. */
export function parseCacheControl(header: string): Record<string, string | true> {
  const out: Record<string, string | true> = {};
  for (const part of header.split(',')) {
    const [rawKey, ...rest] = part.trim().split('=');
    const key = rawKey?.toLowerCase();
    if (!key) continue;
    out[key] = rest.length > 0 ? rest.join('=').replace(/^"|"$/g, '') : true;
  }
  return out;
}

/** Seconds the BROWSER may reuse the response without asking. `no-cache` means "store, but revalidate every time". */
export function browserFreshnessSeconds(header: string): number {
  const d = parseCacheControl(header);
  if ('no-store' in d || 'no-cache' in d) return 0;
  const maxAge = d['max-age'];
  const seconds = typeof maxAge === 'string' ? Number(maxAge) : 0;
  return Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
}

/** The fingerprinted-asset policy: `public, max-age=31536000, immutable`. */
export function isImmutableAsset(header: string): boolean {
  const d = parseCacheControl(header);
  return 'immutable' in d && browserFreshnessSeconds(header) >= 31536000;
}
