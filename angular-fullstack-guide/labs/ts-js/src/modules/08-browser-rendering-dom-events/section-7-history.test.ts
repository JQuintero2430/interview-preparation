// @vitest-environment jsdom
// Section 7 (jsdom 30.1, served from Vitest's http://localhost:3000/). jsdom has no Navigation API; §7 cites MDN for it.

describe('Module 08 · section 7', () => {
  it('Section 7: pushState changes the URL synchronously and fires no popstate', () => {
    const fired: string[] = [];
    const onPop = () => fired.push('popstate');
    window.addEventListener('popstate', onPop);
    history.pushState({ page: 2 }, '', '/orders/2');
    window.removeEventListener('popstate', onPop);
    expect([location.pathname, history.state, fired]).toEqual(['/orders/2', { page: 2 }, []]);
  });

  it('Section 7: back() returns before the traversal; popstate then fires with the earlier entry state', async () => {
    history.replaceState({ page: 'list' }, '', '/orders');
    history.pushState({ page: 'detail' }, '', '/orders/7');
    const popped = new Promise<unknown>((resolve) => window.addEventListener('popstate', (event) => resolve(event.state), { once: true }));
    history.back();
    const pathAfterCall = location.pathname;
    expect([pathAfterCall, await popped, location.pathname]).toEqual(['/orders/7', { page: 'list' }, '/orders']);
  });

  it('Section 7: a fragment navigation fires popstate, then hashchange, with no traversal (jsdom follows the spec algorithm; not observed in a real browser)', async () => {
    const fired: string[] = [];
    const hashChanged = new Promise<void>((resolve) =>
      window.addEventListener('hashchange', () => (fired.push('hashchange'), resolve()), { once: true }),
    );
    window.addEventListener('popstate', () => fired.push('popstate'), { once: true });
    location.hash = '#y';
    await hashChanged;
    expect(fired).toEqual(['popstate', 'hashchange']);
  });

  it('Section 7: jsdom does not structured-clone history state (a browser throws DataCloneError for a function, per the HTML Standard)', () => {
    const state = { onBack: () => 0 };
    history.pushState(state, '', '/x');
    expect(history.state).toBe(state);
  });

  it('Section 7: jsdom has no Navigation API', () => {
    expect('navigation' in window).toBe(false);
  });
});
