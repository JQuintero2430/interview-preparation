import { expectTypeOf } from 'vitest';
import { applyPatch, type DeepPartial } from './DeepPartial';

type Config = {
  server: { host: string; port: number };
  tags: string[];
  createdAt: Date;
  onChange: (value: string) => void;
};

describe('DeepPartial (compile-time, checked by tsc)', () => {
  it('makes nested properties optional', () => {
    expectTypeOf<DeepPartial<{ a: { b: number } }>>().toEqualTypeOf<{ a?: { b?: number } }>();
  });

  it('keeps Date and functions as leaves', () => {
    expectTypeOf<DeepPartial<Config>['createdAt']>().toEqualTypeOf<Date | undefined>();
    expectTypeOf<DeepPartial<Config>['onChange']>().toEqualTypeOf<((value: string) => void) | undefined>();
  });

  it('keeps arrays as arrays', () => {
    expectTypeOf<DeepPartial<{ tags: string[] }>['tags']>().toEqualTypeOf<string[] | undefined>();
  });

  it('plain Partial is shallow', () => {
    const shallow: Partial<Config> = {};
    // @ts-expect-error - Partial is shallow: server needs host AND port
    const bad: Partial<Config> = { server: { host: 'x' } };
    const deep: DeepPartial<Config> = { server: { host: 'x' } };
    expect([shallow, bad, deep]).toHaveLength(3);
  });
});

describe('applyPatch (runtime)', () => {
  const base = { server: { host: 'a', port: 80 }, tags: ['x', 'y'], note: 'n' };

  it('merges nested objects and leaves the rest alone', () => {
    expect(applyPatch(base, { server: { port: 8080 } })).toEqual({
      server: { host: 'a', port: 8080 },
      tags: ['x', 'y'],
      note: 'n',
    });
  });

  it('does not mutate the input', () => {
    applyPatch(base, { server: { port: 1 } });
    expect(base.server.port).toBe(80);
  });

  it('replaces arrays wholesale instead of merging them', () => {
    expect(applyPatch(base, { tags: ['z'] }).tags).toEqual(['z']);
  });

  it('skips undefined patch values', () => {
    expect(applyPatch(base, { note: undefined }).note).toBe('n');
  });

  it('rejects a patch with a wrong nested type', () => {
    // @ts-expect-error - port must be a number
    applyPatch(base, { server: { port: '80' } });
  });
});
