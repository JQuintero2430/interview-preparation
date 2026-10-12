// Exercise 16.6 tests: a model of the lookup behavior asserted in module 16 sections 5 and 8, not Angular's injector.
import { describe, expect, it } from 'vitest';
import { createInjector, type Get, Token } from './injector-model';

const NAME = new Token<string>('NAME');
const COUNTER = new Token<{ id: number }>('COUNTER');
const ALIAS = new Token<{ id: number }>('ALIAS');
const GREETER = new Token<{ text: string }>('GREETER');
const A = new Token<{ b: unknown }>('A');
const B = new Token<{ a: unknown }>('B');

function counterProvider() {
  let id = 0;
  return { token: COUNTER, useFactory: () => ({ id: ++id }) };
}

describe('E16.6 a model of the injector tree', () => {
  it('the nearest provider wins and parents are consulted when missing', () => {
    const root = createInjector({
      providers: [{ token: NAME, useValue: 'root' }],
    });
    const child = createInjector({
      parent: root,
      providers: [{ token: NAME, useValue: 'child' }],
    });
    const empty = createInjector({ parent: child, providers: [] });
    expect(child.get(NAME)).toBe('child');
    expect(empty.get(NAME)).toBe('child');
    expect(root.get(NAME)).toBe('root');
  });

  it('a class provider reads its dependencies from the injector that holds it', () => {
    class Greeter {
      readonly text: string;
      constructor(get: Get) {
        this.text = `hi ${get(NAME)}`;
      }
    }
    const root = createInjector({
      providers: [
        { token: NAME, useValue: 'root' },
        { token: GREETER, useClass: Greeter },
      ],
    });
    const child = createInjector({
      parent: root,
      providers: [{ token: NAME, useValue: 'child' }],
    });
    expect(child.get(GREETER).text).toBe('hi root');
  });

  it('each injector caches its own instance and children do not share it', () => {
    const root = createInjector({ providers: [counterProvider()] });
    const child = createInjector({
      parent: root,
      providers: [counterProvider()],
    });
    const grandchild = createInjector({ parent: root, providers: [] });
    expect(root.get(COUNTER)).toBe(root.get(COUNTER));
    expect(grandchild.get(COUNTER)).toBe(root.get(COUNTER));
    expect(child.get(COUNTER)).toBe(child.get(COUNTER));
    expect(child.get(COUNTER)).not.toBe(root.get(COUNTER));
  });

  it('self fails (or returns null with optional) when only a parent provides', () => {
    const root = createInjector({
      providers: [{ token: NAME, useValue: 'root' }],
    });
    const child = createInjector({ parent: root, providers: [] });
    expect(() => child.get(NAME, { self: true })).toThrowError('No provider found for NAME');
    expect(child.get(NAME, { self: true, optional: true })).toBeNull();
    expect(root.get(NAME, { self: true })).toBe('root');
  });

  it('skipSelf starts at the parent', () => {
    const root = createInjector({
      providers: [{ token: NAME, useValue: 'root' }],
    });
    const child = createInjector({
      parent: root,
      providers: [{ token: NAME, useValue: 'child' }],
    });
    expect(child.get(NAME, { skipSelf: true })).toBe('root');
    expect(root.get(NAME, { skipSelf: true, optional: true })).toBeNull();
  });

  it('a missing token is an error naming the token, and optional returns null', () => {
    const child = createInjector({
      parent: createInjector({ providers: [] }),
      providers: [],
    });
    expect(() => child.get(NAME)).toThrowError('No provider found for NAME');
    expect(child.get(NAME, { optional: true })).toBeNull();
  });

  it('useExisting returns the target instance', () => {
    const root = createInjector({
      providers: [counterProvider(), { token: ALIAS, useExisting: COUNTER }],
    });
    expect(root.get(ALIAS)).toBe(root.get(COUNTER));
    expect(root.get(COUNTER).id).toBe(1);
  });

  it('a cycle is detected with a path', () => {
    const root = createInjector({
      providers: [
        { token: A, useFactory: (get) => ({ b: get(B) }) },
        { token: B, useFactory: (get) => ({ a: get(A) }) },
      ],
    });
    expect(() => root.get(A)).toThrowError('Circular dependency detected for A. Path: A -> B -> A');
    expect(() => root.get(B)).toThrowError('Circular dependency detected for B. Path: B -> A -> B');
  });

  it('destroy() runs cleanups once and later get throws', () => {
    const root = createInjector({
      providers: [{ token: NAME, useValue: 'root' }],
    });
    const calls: string[] = [];
    root.onDestroy(() => calls.push('first'));
    const removed = root.onDestroy(() => calls.push('removed'));
    removed();
    root.destroy();
    root.destroy();
    expect(calls).toEqual(['first']);
    expect(root.destroyed).toBe(true);
    expect(() => root.get(NAME)).toThrowError('Injector has already been destroyed');
  });
});
