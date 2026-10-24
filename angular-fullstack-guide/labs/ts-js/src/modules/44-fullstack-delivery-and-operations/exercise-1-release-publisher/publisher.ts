// Exercise 44.1: the types and helpers both variants share (a: sequential steps, b: a plan, then apply). Our in-memory
// bucket stands in for an object store such as S3; no network, no clock. Compression uses node:zlib at explicit levels.

// A variable specifier keeps node:zlib out of the bundler's static graph (the lab has no @types/node).
const zlibSpecifier = 'node:zlib';
const zlib: {
  gzipSync(input: Uint8Array, options: { level: number }): Uint8Array;
  brotliCompressSync(input: Uint8Array, options: { params: Record<number, number> }): Uint8Array;
  constants: { BROTLI_PARAM_QUALITY: number };
} = await import(zlibSpecifier);

export interface BuildFile {
  /** Relative to the build folder, such as `index.html` or `media/logo-AB12cd_-.png`. */
  readonly path: string;
  readonly body: Uint8Array;
}

export interface Encoded extends BuildFile {
  readonly encoding: 'gzip' | 'br';
}

export type Headers = Readonly<Record<string, string>>;

export interface StoredObject {
  readonly body: Uint8Array;
  readonly headers: Headers;
}

export interface Operation {
  readonly op: 'put' | 'delete';
  readonly key: string;
}

export interface Bucket {
  put(key: string, body: Uint8Array, headers: Headers): void;
  delete(key: string): void;
  get(key: string): StoredObject | undefined;
  list(): readonly string[];
  /** Every put and delete, in the order they happened. */
  readonly log: readonly Operation[];
}

export interface PublishOptions {
  readonly releaseId: string;
  /** How many of the newest releases keep their hashed files, the new one included. */
  readonly keepReleases: number;
  readonly minCompressBytes: number;
  /** Tested against the path without a leading slash. */
  readonly hashedName: RegExp;
}

export interface PublishResult {
  readonly uploaded: readonly string[];
  readonly deleted: readonly string[];
  /** The `.map` files, never uploaded: the error tracker gets them (section 9). */
  readonly sourceMaps: readonly string[];
}

/** One release's hashed keys (variants included), so a later release knows what it may delete. */
export interface ReleaseRecord {
  readonly id: string;
  readonly keys: readonly string[];
}

export class MemoryBucket implements Bucket {
  readonly log: Operation[] = [];
  private readonly objects = new Map<string, StoredObject>();

  put(key: string, body: Uint8Array, headers: Headers): void {
    this.objects.set(key, { body, headers });
    this.log.push({ op: 'put', key });
  }

  delete(key: string): void {
    this.objects.delete(key);
    this.log.push({ op: 'delete', key });
  }

  get(key: string): StoredObject | undefined {
    return this.objects.get(key);
  }

  list(): readonly string[] {
    return [...this.objects.keys()];
  }
}

export const INDEX = 'index.html';
export const MANIFEST = 'releases.json';
export const IMMUTABLE = 'public, max-age=31536000, immutable';
export const NO_CACHE = 'no-cache';
/** Section 3's `gzip_types` plus HTML; images and fonts are already compressed. */
const COMPRESSIBLE = /\.(?:html|js|css|json|svg)$/;
const GZIP_LEVEL = 9;
const BROTLI_QUALITY = 11;

export const isSourceMap = (path: string): boolean => path.endsWith('.map');

export const cacheControl = (path: string, options: PublishOptions): string =>
  options.hashedName.test(path) ? IMMUTABLE : NO_CACHE;

/** The `.gz` and `.br` copies worth uploading: compressible, at least `minCompressBytes`, and smaller than the file. */
export function variants(file: BuildFile, options: PublishOptions): readonly Encoded[] {
  if (!COMPRESSIBLE.test(file.path) || file.body.byteLength < options.minCompressBytes) return [];
  const gzip = zlib.gzipSync(file.body, { level: GZIP_LEVEL });
  const brotli = zlib.brotliCompressSync(file.body, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: BROTLI_QUALITY } });
  const candidates: readonly Encoded[] = [
    { path: `${file.path}.gz`, body: gzip, encoding: 'gzip' },
    { path: `${file.path}.br`, body: brotli, encoding: 'br' },
  ];
  return candidates.filter((variant) => variant.body.byteLength < file.body.byteLength);
}

export function readReleases(bucket: Bucket): readonly ReleaseRecord[] {
  const stored = bucket.get(MANIFEST);
  const parsed: ReleaseRecord[] = stored ? JSON.parse(new TextDecoder().decode(stored.body)) : [];
  return parsed;
}

export const writeReleases = (releases: readonly ReleaseRecord[]): Uint8Array => new TextEncoder().encode(JSON.stringify(releases));

/** Index.html is the last file uploaded and carries the release id, so seeing the id means the upload finished. */
export const alreadyPublished = (bucket: Bucket, options: PublishOptions): boolean =>
  bucket.get(INDEX)?.headers['X-Release'] === options.releaseId;

/** The new release replaces an earlier record of the same id; the newest `keepReleases` are kept. */
export function splitReleases(
  before: readonly ReleaseRecord[],
  current: ReleaseRecord,
  keep: number,
): { readonly kept: readonly ReleaseRecord[]; readonly stale: readonly string[] } {
  const all = [...before.filter((release) => release.id !== current.id), current];
  const count = Math.max(1, keep);
  const kept = all.slice(-count);
  const stillUsed = new Set(kept.flatMap((release) => release.keys));
  const stale = all.slice(0, -count).flatMap((release) => release.keys).filter((key) => !stillUsed.has(key));
  return { kept, stale: [...new Set(stale)] };
}
