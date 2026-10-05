import { browserFreshnessSeconds, isImmutableAsset, parseCacheControl } from './cacheControl';

test('parses valued and flag directives, case-insensitively', () => {
  expect(parseCacheControl('Public, Max-Age=60, stale-while-revalidate="30"')).toEqual({
    public: true,
    'max-age': '60',
    'stale-while-revalidate': '30',
  });
});

test('no-cache and no-store both mean zero reusable seconds, but only no-store avoids storing', () => {
  expect(browserFreshnessSeconds('no-cache, max-age=600')).toBe(0);
  expect(browserFreshnessSeconds('no-store')).toBe(0);
  expect(browserFreshnessSeconds('max-age=600')).toBe(600);
  expect(browserFreshnessSeconds('max-age=abc')).toBe(0);
});

test('fingerprinted assets: a year plus immutable', () => {
  expect(isImmutableAsset('public, max-age=31536000, immutable')).toBe(true);
  expect(isImmutableAsset('public, max-age=31536000')).toBe(false);
  expect(isImmutableAsset('max-age=60, immutable')).toBe(false);
});
