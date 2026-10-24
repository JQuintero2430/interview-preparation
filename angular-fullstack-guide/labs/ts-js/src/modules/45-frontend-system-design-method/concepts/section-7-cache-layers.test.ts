// Section 7 claims, about our model (cache-layers.ts), not a browser's or Angular's cache: layers are asked nearest
// first, the first fresh entry answers, and invalidating one layer leaves the others. Time is a passed number.
import { describe, expect, it } from 'vitest';
import { createLayer, invalidate, lookup, type Layer } from './cache-layers';

const names = ['component', 'memory', 'service worker', 'http', 'cdn'] as const;
const layersWith = (maxAgeMs: number): Layer[] => names.map((name) => createLayer(name, maxAgeMs));
const origin = (version: string) => () => version;

describe('Section 7: cache layers', () => {
  it('Section 7: the first layer with a fresh entry answers and deeper layers are not asked', () => {
    const layers = layersWith(1000);
    lookup(layers, 'card/7', 0, origin('v1'));
    const result = lookup(layers, 'card/7', 500, origin('v2'));
    expect(result).toEqual({ layer: 'component', value: 'v1', asked: ['component'] });
  });

  it('Section 7: invalidating the in-memory layer alone lets the service-worker layer answer with the old value', () => {
    const layers = layersWith(1000);
    lookup(layers, 'card/7', 0, origin('v1'));
    invalidate(layers, 'card/7', 'component');
    invalidate(layers, 'card/7', 'memory');
    const result = lookup(layers, 'card/7', 10, origin('v2'));
    expect(result).toEqual({ layer: 'service worker', value: 'v1', asked: ['component', 'memory', 'service worker'] });
  });

  it('Section 7: a miss everywhere reaches the origin and fills the layers on the way back', () => {
    const layers = layersWith(1000);
    const first = lookup(layers, 'card/7', 0, origin('v1'));
    expect(first).toEqual({ layer: 'origin', value: 'v1', asked: [...names] });
    expect(layers.map((layer) => layer.entries.get('card/7')?.value)).toEqual(['v1', 'v1', 'v1', 'v1', 'v1']);
  });

  it('Section 7: an entry past its maximum age is skipped', () => {
    const layers = [createLayer('memory', 100), createLayer('http', 1000)];
    lookup(layers, 'card/7', 0, origin('v1'));
    const result = lookup(layers, 'card/7', 100, origin('v2'));
    expect(result).toEqual({ layer: 'http', value: 'v1', asked: ['memory', 'http'] });
    expect(layers[0]?.entries.get('card/7')).toEqual({ value: 'v1', storedAt: 100, maxAgeMs: 100 });
  });
});
