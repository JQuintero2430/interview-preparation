// Exercise 44.1: six criteria, each run over both variants (a: sequential steps; b: a plan, then apply). The bucket is
// in memory, so the test reads the operation log; compression is node:zlib on committed input; nothing touches a network
// or a clock. `concepts/nginx-model.ts` (our section 3 model) and the committed Nginx config are only the oracle: the
// publisher must send the Cache-Control that this config answers for every key it uploads.
import { describeLocation, headerValues, readServer, respond, siteFiles } from '../concepts/nginx-model';
import { publish as publishA } from './a/publisher';
import { publish as publishB } from './b/publisher';
import { MemoryBucket, type BuildFile, type PublishOptions, type PublishResult } from './publisher';

// A variable specifier keeps node:fs and node:zlib out of the bundler's static graph (the lab has no @types/node).
const fsSpecifier = 'node:fs';
const zlibSpecifier = 'node:zlib';
const fs: { readFileSync(path: URL, encoding: 'utf8'): string } = await import(fsSpecifier);
const zlib: {
  gzipSync(input: Uint8Array, options: { level: number }): Uint8Array;
  gunzipSync(input: Uint8Array): Uint8Array;
  brotliDecompressSync(input: Uint8Array): Uint8Array;
} = await import(zlibSpecifier);

const committed = readServer(
  fs.readFileSync(new URL('../../../../../angular/deploy/nginx/default.conf.template', import.meta.url), 'utf8'),
);
const encoder = new TextEncoder();
const MIN_BYTES = 1024;
/** Section 3's regex, without the leading slash: root .js and .css files and anything under media/. */
const HASHED = /^(?:[^/]+-[A-Za-z0-9_-]{8}\.(?:js|css)|media\/[^/]+-[A-Za-z0-9_-]{8}\.[A-Za-z0-9]+)$/;
const IMMUTABLE = 'public, max-age=31536000, immutable';
const isVariant = (key: string): boolean => /\.(?:gz|br)$/.test(key);

const text = (bytes: number): Uint8Array => encoder.encode('export const answer = 42;\n'.repeat(Math.ceil(bytes / 26)).slice(0, bytes));
/** Bytes from a fixed-seed generator: they do not compress, and the same run gives the same bytes. */
function noise(bytes: number): Uint8Array {
  let state = 12345;
  return Uint8Array.from({ length: bytes }, () => {
    state = (Math.imul(state, 1103515245) + 12345) >>> 0;
    return (state >>> 16) & 255;
  });
}
const file = (path: string, body: Uint8Array): BuildFile => ({ path, body });
const options = (releaseId: string, keepReleases = 2): PublishOptions => ({
  releaseId, keepReleases, minCompressBytes: MIN_BYTES, hashedName: HASHED,
});
/** A build whose main bundle is named by `hash`; the chunk, the stylesheet and the logo keep their names. */
const build = (hash: string): BuildFile[] => [
  file('index.html', text(2000)),
  file(`main-${hash}.js`, text(6000)),
  file('styles-5INURTSO.css', text(3000)),
  file('chunk-rwm7wPz-.js', noise(2000)),
  file('media/logo-AB12cd_-.png', noise(1500)),
  file('favicon.ico', noise(1200)),
  file(`main-${hash}.js.map`, text(500)),
];

describe.each(['a', 'b'])('Exercise 44.1, variant %s', (variant) => {
  const publish = (bucket: MemoryBucket, files: BuildFile[], opts: PublishOptions): PublishResult =>
    (variant === 'a' ? publishA : publishB)(bucket, files, opts);
  const puts = (bucket: MemoryBucket, from = 0): string[] =>
    bucket.log.slice(from).filter((operation) => operation.op === 'put').map((operation) => operation.key);

  it('uploads every hashed file before `index.html`, and `index.html` last', () => {
    const bucket = new MemoryBucket();
    publish(bucket, build('XL67N4B2'), options('r1'));
    const order = puts(bucket);
    const hashed = order.filter((key) => HASHED.test(key.replace(/\.(?:gz|br)$/, '')));
    expect(hashed).toContain('main-XL67N4B2.js.gz');
    expect(hashed).toContain('chunk-rwm7wPz-.js');
    expect(order.at(-1)).toBe('index.html');
    for (const key of hashed) expect(order.indexOf(key)).toBeLessThan(order.indexOf('index.html'));
  });

  it('sets `public, max-age=31536000, immutable` on hashed files and `no-cache` on `index.html` and every unhashed file', () => {
    const bucket = new MemoryBucket();
    publish(bucket, build('XL67N4B2'), options('r1'));
    const site = siteFiles(committed, bucket.list());
    for (const key of bucket.list().filter((name) => !isVariant(name))) {
      const answer = respond(committed, { uri: `/${key}` }, site);
      expect(bucket.get(key)?.headers['Cache-Control'], key).toBe(headerValues(answer, 'Cache-Control')[0]);
      // The publisher's pattern and the config's regex location pick out the same files.
      expect(describeLocation(answer.location).startsWith('~'), key).toBe(HASHED.test(key));
    }
    expect(bucket.get('media/logo-AB12cd_-.png')?.headers['Cache-Control']).toBe(IMMUTABLE);
    expect(bucket.get('index.html')?.headers['Cache-Control']).toBe('no-cache');
    expect(bucket.get('favicon.ico')?.headers['Cache-Control']).toBe('no-cache');
    expect(bucket.get('main-XL67N4B2.js.gz')?.headers).toMatchObject({ 'Cache-Control': IMMUTABLE, 'Content-Encoding': 'gzip' });
  });

  it('writes `.gz` and `.br` variants only for compressible types at or above the minimum size, and only when the variant is smaller', () => {
    const bucket = new MemoryBucket();
    const sample = noise(4096);
    expect(zlib.gzipSync(sample, { level: 9 }).byteLength).toBeGreaterThan(sample.byteLength);
    publish(bucket, [
      file('index.html', text(MIN_BYTES)),
      file('below.css', text(MIN_BYTES - 1)),
      file('photo.png', text(5000)),
      file('random.js', sample),
    ], options('r1'));
    const keys = bucket.list();
    expect(keys.filter((key) => key.startsWith('index.html')).sort()).toEqual(['index.html', 'index.html.br', 'index.html.gz']);
    expect(keys.filter((key) => !key.startsWith('index.html') && key !== 'releases.json').sort()).toEqual([
      'below.css', 'photo.png', 'random.js',
    ]);
    const original = bucket.get('index.html')?.body ?? new Uint8Array();
    expect(new Uint8Array(zlib.gunzipSync(bucket.get('index.html.gz')?.body ?? new Uint8Array()))).toEqual(original);
    expect(new Uint8Array(zlib.brotliDecompressSync(bucket.get('index.html.br')?.body ?? new Uint8Array()))).toEqual(original);
    // Nginx's gzip_static choice (our model) picks the uploaded .gz for a client that accepts gzip.
    const served = respond(committed, { uri: '/index.html', acceptEncoding: 'gzip' }, siteFiles(committed, keys));
    expect(served.file).toBe('/usr/share/nginx/html/index.html.gz');
  });

  it('keeps the hashed files of the previous `keepReleases` releases and deletes older ones only after the new `index.html` is uploaded', () => {
    const bucket = new MemoryBucket();
    publish(bucket, build('AAAAAAA1'), options('r1'));
    publish(bucket, build('BBBBBBB2'), options('r2'));
    // Two releases kept: a tab opened on r1 still finds its bundle after r2 is live.
    expect(bucket.list()).toContain('main-AAAAAAA1.js');
    const before = bucket.log.length;
    const result = publish(bucket, build('CCCCCCC3'), options('r3'));
    expect(result.deleted).toEqual(['main-AAAAAAA1.js.gz', 'main-AAAAAAA1.js.br', 'main-AAAAAAA1.js']);
    // The unchanged chunk, stylesheet and logo belong to the kept releases too, so they stay.
    expect(bucket.list()).toEqual(expect.arrayContaining(['main-BBBBBBB2.js', 'main-CCCCCCC3.js', 'chunk-rwm7wPz-.js', 'styles-5INURTSO.css']));
    const run = bucket.log.slice(before);
    const switched = run.findIndex((operation) => operation.key === 'index.html');
    const firstDelete = run.findIndex((operation) => operation.op === 'delete');
    expect(switched).toBeGreaterThanOrEqual(0);
    expect(firstDelete).toBeGreaterThan(switched);
  });

  it('never uploads `.map` files and returns them for the tracker upload', () => {
    const bucket = new MemoryBucket();
    const result = publish(bucket, build('XL67N4B2'), options('r1'));
    expect(result.sourceMaps).toEqual(['main-XL67N4B2.js.map']);
    expect(bucket.list().some((key) => key.endsWith('.map'))).toBe(false);
    expect(result.uploaded.some((key) => key.endsWith('.map'))).toBe(false);
  });

  it('publishing the same release twice uploads nothing the second time', () => {
    const bucket = new MemoryBucket();
    const first = publish(bucket, build('XL67N4B2'), options('r1'));
    const operations = bucket.log.length;
    const second = publish(bucket, build('XL67N4B2'), options('r1'));
    expect(first.uploaded.length).toBeGreaterThan(0);
    expect(second.uploaded).toEqual([]);
    expect(second.deleted).toEqual([]);
    expect(bucket.log).toHaveLength(operations);
    expect(second.sourceMaps).toEqual(first.sourceMaps);
  });
});
