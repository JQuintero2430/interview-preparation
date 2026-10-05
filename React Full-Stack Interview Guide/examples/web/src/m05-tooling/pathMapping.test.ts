import { describe, expect, it } from 'vitest';
import { resolvePathMapping, type Paths } from './pathMapping';

const paths: Paths = {
  '@/*': ['./src/*'],
  '@ui/*': ['./src/shared/ui/*'],
  '@config': ['./src/config/index.ts'],
  '#lib/*.js': ['./vendor/*.ts', './fallback/*.ts'],
};

describe('resolvePathMapping', () => {
  it('substitutes the captured part for *', () => {
    expect(resolvePathMapping('@/features/cart', paths)).toEqual(['./src/features/cart']);
  });

  it('prefers the longest matching prefix', () => {
    expect(resolvePathMapping('@ui/Button', paths)).toEqual(['./src/shared/ui/Button']);
  });

  it('matches exact patterns', () => {
    expect(resolvePathMapping('@config', paths)).toEqual(['./src/config/index.ts']);
    expect(resolvePathMapping('@configx', paths)).toBeNull();
  });

  it('does not match the bare prefix', () => {
    expect(resolvePathMapping('@', paths)).toBeNull();
  });

  it('keeps fallbacks in order and honours suffixes', () => {
    expect(resolvePathMapping('#lib/math.js', paths)).toEqual(['./vendor/math.ts', './fallback/math.ts']);
    expect(resolvePathMapping('#lib/math.mjs', paths)).toBeNull();
  });

  it('rejects patterns with two wildcards', () => {
    expect(() => resolvePathMapping('x', { 'a*b*': ['./x'] })).toThrow(/at most one/);
  });
});
