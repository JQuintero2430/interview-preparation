// Exercise 44.1, variant b (the alternative): `plan` is a pure function that lists every put and delete in order;
// `apply` runs the list. The same order, so the same criteria hold.
import {
  INDEX, MANIFEST, NO_CACHE, alreadyPublished, cacheControl, isSourceMap, readReleases, splitReleases, variants, writeReleases,
  type Bucket, type BuildFile, type Headers, type PublishOptions, type PublishResult,
} from '../publisher';

export interface Put {
  readonly key: string;
  readonly body: Uint8Array;
  readonly headers: Headers;
}

export interface Plan {
  readonly puts: readonly Put[];
  readonly deletes: readonly string[];
  readonly sourceMaps: readonly string[];
}

export function plan(bucket: Bucket, build: readonly BuildFile[], options: PublishOptions): Plan {
  const sourceMaps = build.filter((file) => isSourceMap(file.path)).map((file) => file.path);
  if (alreadyPublished(bucket, options)) return { puts: [], deletes: [], sourceMaps };
  const files = build.filter((file) => !isSourceMap(file.path));
  const index = files.find((file) => file.path === INDEX);
  if (!index) throw new Error(`the build has no ${INDEX}`);
  const isHashed = (file: BuildFile): boolean => options.hashedName.test(file.path);
  const putsFor = (file: BuildFile, extra: Headers = {}): Put[] => {
    const base = { 'Cache-Control': cacheControl(file.path, options), ...extra };
    const copies = variants(file, options).map((copy) => ({ key: copy.path, body: copy.body, headers: { ...base, 'Content-Encoding': copy.encoding } }));
    return [...copies, { key: file.path, body: file.body, headers: base }];
  };
  const hashed = files.filter(isHashed).flatMap((file) => putsFor(file));
  const others = files.filter((file) => !isHashed(file) && file !== index).flatMap((file) => putsFor(file));
  const { kept, stale } = splitReleases(readReleases(bucket), { id: options.releaseId, keys: hashed.map((put) => put.key) }, options.keepReleases);
  const manifest: Put = { key: MANIFEST, body: writeReleases(kept), headers: { 'Cache-Control': NO_CACHE } };
  return { puts: [...hashed, ...others, manifest, ...putsFor(index, { 'X-Release': options.releaseId })], deletes: stale, sourceMaps };
}

export function apply(bucket: Bucket, { puts, deletes, sourceMaps }: Plan): PublishResult {
  puts.forEach(({ key, body, headers }) => bucket.put(key, body, headers));
  deletes.forEach((key) => bucket.delete(key));
  return { uploaded: puts.map((put) => put.key), deleted: deletes, sourceMaps };
}

export const publish = (bucket: Bucket, build: readonly BuildFile[], options: PublishOptions): PublishResult =>
  apply(bucket, plan(bucket, build, options));
