// @vitest-environment jsdom
// Section 1 has no run-time claims: the rendering path needs a real browser. This file proves the jsdom environment
// that sections 3–5 and 7 rely on, and states what it does not do (layout).

describe('Module 08 · section 1', () => {
  it('Section 1: the jsdom environment parses HTML into a DOM tree', () => {
    const parsed = new DOMParser().parseFromString('<main><h1>Orders</h1><p hidden>loading</p></main>', 'text/html');
    expect([typeof document, parsed.querySelector('main')?.children.length, parsed.querySelector('p')?.hidden]).toEqual(['object', 2, true]);
  });

  it('Section 1: jsdom does no layout, so geometry reads are 0 and cannot stand in for a browser', () => {
    const box = document.createElement('div');
    box.style.width = '100px';
    document.body.append(box);
    expect([box.offsetWidth, box.getBoundingClientRect().width]).toEqual([0, 0]);
  });
});
