// @vitest-environment jsdom
// Section 7 (jsdom 30.1.1 and Node 24): Web Storage coercion, JSON versus structured clone, and quota errors.
// IndexedDB, Cache Storage, real browser quotas and eviction do not exist in jsdom; the module cites MDN for them.

/** Stores a value and reports whether the browser accepted it: storage can throw (quota, blocked storage). */
const trySet = (key: string, value: string): boolean => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
};

afterEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

describe('Module 09 · section 7', () => {
  it('Section 7: Web Storage keeps strings only, so other values are coerced', () => {
    localStorage.setItem('n', 1 as unknown as string);
    localStorage.setItem('o', { a: 1 } as unknown as string);
    localStorage.setItem('u', undefined as unknown as string);
    expect([localStorage.getItem('n'), localStorage.getItem('o'), localStorage.getItem('u')]).toEqual(['1', '[object Object]', 'undefined']);
    expect(localStorage.getItem('missing')).toBeNull();
  });

  it('Section 7: a JSON round trip drops undefined and functions and turns a Date into a string; structuredClone keeps Date and Map', () => {
    const value = { when: new Date(0), gone: undefined, fn: () => 1, tags: new Map([['a', 1]]) };
    const viaJson = JSON.parse(JSON.stringify(value)) as Record<string, unknown>;
    expect(viaJson).toEqual({ when: '1970-01-01T00:00:00.000Z', tags: {} });
    const { fn: _fn, ...cloneable } = value;
    const cloned = structuredClone(cloneable);
    expect(cloned.when).toBeInstanceOf(Date);
    expect(cloned.tags).toEqual(new Map([['a', 1]]));
    expect(() => structuredClone(value)).toThrow();
  });

  it('Section 7: sessionStorage is a separate store from localStorage', () => {
    localStorage.setItem('k', 'local');
    sessionStorage.setItem('k', 'session');
    expect([localStorage.getItem('k'), sessionStorage.getItem('k')]).toEqual(['local', 'session']);
    sessionStorage.clear();
    expect(localStorage.getItem('k')).toBe('local');
  });

  it("Section 7: jsdom's quota throws QuotaExceededError, and a guarded write reports it (a browser's quota differs)", () => {
    const megabyte = 'x'.repeat(1024 * 1024);
    let accepted = 0;
    while (trySet(`big${accepted}`, megabyte) && accepted < 64) accepted++;
    expect(accepted).toBeLessThan(64);
    expect(accepted).toBeGreaterThan(0);
    let error: unknown;
    try {
      localStorage.setItem('one-more', megabyte);
    } catch (caught) {
      error = caught;
    }
    expect((error as DOMException).name).toBe('QuotaExceededError');
  });
});
