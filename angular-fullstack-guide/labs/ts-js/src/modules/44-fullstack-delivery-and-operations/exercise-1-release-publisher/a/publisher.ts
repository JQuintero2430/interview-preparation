// Exercise 44.1, variant a (the solution): sequential steps, each one acting on the bucket straight away.
import {
  INDEX, MANIFEST, NO_CACHE, alreadyPublished, cacheControl, isSourceMap, readReleases, splitReleases, variants, writeReleases,
  type Bucket, type BuildFile, type Headers, type PublishOptions, type PublishResult,
} from '../publisher';

export function publish(bucket: Bucket, build: readonly BuildFile[], options: PublishOptions): PublishResult {
  const sourceMaps = build.filter((file) => isSourceMap(file.path)).map((file) => file.path);
  if (alreadyPublished(bucket, options)) return { uploaded: [], deleted: [], sourceMaps };
  const files = build.filter((file) => !isSourceMap(file.path));
  const index = files.find((file) => file.path === INDEX);
  if (!index) throw new Error(`the build has no ${INDEX}`);
  const isHashed = (file: BuildFile): boolean => options.hashedName.test(file.path);
  const uploaded: string[] = [];
  const hashedKeys: string[] = [];
  // A compressed copy goes up before its original, so a .gz never sits next to a newer file.
  const upload = (file: BuildFile, extra: Headers = {}): void => {
    const base = { 'Cache-Control': cacheControl(file.path, options), ...extra };
    const copies = variants(file, options).map((copy) => ({ ...copy, headers: { ...base, 'Content-Encoding': copy.encoding } }));
    for (const { path, body, headers } of [...copies, { ...file, headers: base }]) {
      bucket.put(path, body, headers);
      uploaded.push(path);
      if (isHashed(file)) hashedKeys.push(path);
    }
  };

  // 1. Hashed files first: the old index.html may still be served, and it names none of them.
  files.filter(isHashed).forEach((file) => upload(file));
  // 2. Everything else except the page that names the hashed files.
  files.filter((file) => !isHashed(file) && file !== index).forEach((file) => upload(file));
  // 3. The record of which release owns which hashed keys, written before the switch so that a retry sees it.
  const { kept, stale } = splitReleases(readReleases(bucket), { id: options.releaseId, keys: hashedKeys }, options.keepReleases);
  bucket.put(MANIFEST, writeReleases(kept), { 'Cache-Control': NO_CACHE });
  uploaded.push(MANIFEST);
  // 4. index.html last: its put is the switch to the new release, and it carries the id a repeat run looks for.
  upload(index, { 'X-Release': options.releaseId });
  // 5. Old chunks go only now: tabs opened before the switch still request them.
  stale.forEach((key) => bucket.delete(key));
  return { uploaded, deleted: stale, sourceMaps };
}
