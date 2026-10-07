import { observable } from './observable';

interface Change {
  readonly path: string;
  readonly value: unknown;
}

function recorder(): { readonly changes: Change[]; readonly listener: (path: string, value: unknown) => void } {
  const changes: Change[] = [];
  return { changes, listener: (path, value) => changes.push({ path, value }) };
}

describe('E03.2 observable', () => {
  it('reports a top-level write with its path and value', () => {
    const { changes, listener } = recorder();
    const state = observable({ count: 0 }, listener);
    state.count = 1;
    expect(changes).toEqual([{ path: 'count', value: 1 }]);
  });

  it('reports a nested write with a dotted path', () => {
    const { changes, listener } = recorder();
    const state = observable({ user: { address: { city: 'Lima' } } }, listener);
    state.user.address.city = 'Quito';
    expect(changes).toEqual([{ path: 'user.address.city', value: 'Quito' }]);
  });

  it('reports Array.prototype.push once, as the new index', () => {
    const { changes, listener } = recorder();
    const state = observable({ items: [] as string[] }, listener);
    state.items.push('x');
    expect(changes).toEqual([{ path: 'items.0', value: 'x' }]);
  });

  it('does not report a write of an identical value', () => {
    const { changes, listener } = recorder();
    const state = observable({ count: 1, label: 'a' }, listener);
    state.count = 1;
    state.label = 'a';
    expect(changes).toEqual([]);
  });

  it('reports deletes of existing keys only', () => {
    const { changes, listener } = recorder();
    const state: { a?: number; b?: number } = observable<{ a?: number; b?: number }>({ a: 1 }, listener);
    delete state.a;
    delete state.b;
    expect(changes).toEqual([{ path: 'a', value: undefined }]);
  });

  it('returns the same proxy for repeated reads of a nested object', () => {
    const state = observable({ user: { name: 'Ada' } }, () => undefined);
    expect(state.user).toBe(state.user);
  });

  it('runs setters against the proxy, so their inner writes are reported', () => {
    const { changes, listener } = recorder();
    const person = {
      first: 'Ada',
      last: 'Lovelace',
      get full(): string {
        return `${this.first} ${this.last}`;
      },
      set full(value: string) {
        const [first = '', last = ''] = value.split(' ');
        this.first = first;
        this.last = last;
      },
    };
    const state = observable(person, listener);
    state.full = 'Grace Hopper';
    expect(changes.map((c) => c.path)).toEqual(['first', 'last', 'full']);
  });

  it('respects proxy invariants when reading frozen nested objects', () => {
    const settings = Object.freeze({ palette: { primary: 'blue' } });
    const state = observable({ settings }, () => undefined);
    expect(() => state.settings.palette).not.toThrow();
    expect(state.settings.palette).toBe(settings.palette);
  });

  it('stores plain data, never a proxy, when a proxy is assigned', () => {
    const raw: { a: { n: number }; b: { n: number } } = { a: { n: 1 }, b: { n: 2 } };
    const state = observable(raw, () => undefined);
    state.a = state.b;
    expect(raw.a).toBe(raw.b);
  });
});
