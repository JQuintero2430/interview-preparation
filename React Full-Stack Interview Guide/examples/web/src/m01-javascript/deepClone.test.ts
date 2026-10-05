import { deepClone } from './deepClone';

test('clones nested plain data without sharing references', () => {
  const original = { a: 1, nested: { list: [1, { deep: true }] } };
  const copy = deepClone(original);
  expect(copy).toEqual(original);
  expect(copy.nested).not.toBe(original.nested);
  expect(copy.nested.list).not.toBe(original.nested.list);
  copy.nested.list.push(3);
  expect(original.nested.list).toHaveLength(2);
});

test('clones Date, RegExp, Map and Set', () => {
  const original = {
    when: new Date(0),
    pattern: /ab+c/gi,
    map: new Map([['k', { v: 1 }]]),
    set: new Set([1, 2]),
  };
  const copy = deepClone(original);
  expect(copy.when).not.toBe(original.when);
  expect(copy.when.getTime()).toBe(0);
  expect(copy.pattern.source).toBe('ab+c');
  expect(copy.pattern.flags).toBe('gi');
  expect(copy.map.get('k')).toEqual({ v: 1 });
  expect(copy.map.get('k')).not.toBe(original.map.get('k'));
  expect([...copy.set]).toEqual([1, 2]);
});

test('handles cycles and preserves shared references inside the graph', () => {
  interface Node {
    name: string;
    self?: Node;
    twin?: Node;
  }
  const shared: Node = { name: 'shared' };
  const root: Node = { name: 'root', twin: shared };
  root.self = root;
  const copy = deepClone(root);
  expect(copy.self).toBe(copy);
  expect(copy).not.toBe(root);
  expect(copy.twin).not.toBe(shared);
  expect(copy.twin?.name).toBe('shared');
});

test('keeps the prototype and symbol keys; functions stay shared', () => {
  class Point {
    constructor(
      public x: number,
      public y: number,
    ) {}
    sum() {
      return this.x + this.y;
    }
  }
  const sym = Symbol('tag');
  const fn = () => 1;
  const original = { p: new Point(1, 2), [sym]: 'secret', fn };
  const copy = deepClone(original);
  expect(copy.p).toBeInstanceOf(Point);
  expect(copy.p.sum()).toBe(3);
  expect(copy[sym]).toBe('secret');
  expect(copy.fn).toBe(fn);
});

test('primitives pass through', () => {
  expect(deepClone(5)).toBe(5);
  expect(deepClone(null)).toBeNull();
  expect(deepClone('s')).toBe('s');
});
