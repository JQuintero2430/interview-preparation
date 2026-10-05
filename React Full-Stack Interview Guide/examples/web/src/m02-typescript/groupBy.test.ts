import { expectTypeOf } from 'vitest';
import { groupBy } from './groupBy';

type User = { name: string; role: 'admin' | 'user' };

const users: User[] = [
  { name: 'Ada', role: 'admin' },
  { name: 'Bob', role: 'user' },
  { name: 'Cy', role: 'user' },
];

describe('groupBy (runtime)', () => {
  it('groups items under the key the callback returns, keeping input order', () => {
    expect(groupBy(users, (u) => u.role)).toEqual({
      admin: [users[0]],
      user: [users[1], users[2]],
    });
  });

  it('returns an empty object for an empty list', () => {
    expect(groupBy([], () => 'x')).toEqual({});
  });

  it('passes the index to the key function', () => {
    expect(groupBy(['a', 'b', 'c', 'd'], (_, i) => (i % 2 === 0 ? 'even' : 'odd'))).toEqual({
      even: ['a', 'c'],
      odd: ['b', 'd'],
    });
  });

  it('supports number and symbol keys', () => {
    const byLength = groupBy(['a', 'bb', 'cc'], (s) => s.length);
    expect(byLength[2]).toEqual(['bb', 'cc']);
  });
});

describe('groupBy (compile-time, checked by tsc)', () => {
  it('infers the key union from the callback', () => {
    const grouped = groupBy(users, (u) => u.role);
    expectTypeOf(grouped).toEqualTypeOf<Partial<Record<'admin' | 'user', User[]>>>();
    // A missing group is `undefined`, so callers must handle it.
    expectTypeOf(grouped.admin).toEqualTypeOf<User[] | undefined>();
  });

  it('rejects keys that are not property keys', () => {
    const notCalled = () =>
      // @ts-expect-error - boolean is not a PropertyKey (string | number | symbol)
      groupBy(users, (u) => u.name.length > 2);
    expect(notCalled).toBeTypeOf('function');
  });
});
