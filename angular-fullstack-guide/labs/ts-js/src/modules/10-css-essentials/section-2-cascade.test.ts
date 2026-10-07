// @vitest-environment jsdom
// What jsdom 30.1.1 computes of the cascade: matching, specificity, source order, inline styles, !important, inheritance.
// Layers are NOT computed (see section-1-jsdom-limits.test.ts); they are documented from CSS Cascade Level 5 only.
import { afterEach } from 'vitest';
import { computed, mountStyles, unmount } from './support/dom';

afterEach(unmount);

const RED = 'rgb(255, 0, 0)';
const BLUE = 'rgb(0, 0, 255)';
const GREEN = 'rgb(0, 128, 0)';

function colorOf(css: string, html: string, selector = '#t'): string {
  unmount();
  const root = mountStyles(css, html);
  return computed(root.querySelector(selector) as Element, 'color');
}

describe('Module 10 · section 2', () => {
  it('Section 2: an id selector beats a class beats a type selector, whatever the order', () => {
    const html = '<p id="t" class="c"></p>';
    expect(colorOf('#t { color: red; } .c { color: blue; } p { color: green; }', html)).toBe(RED);
    expect(colorOf('p { color: green; } .c { color: blue; }', html)).toBe(BLUE);
    expect(colorOf('#t { color: red; } p { color: green; }', html)).toBe(RED);
  });

  it('Section 2: the later rule wins on equal specificity, and a class beats a later type rule', () => {
    expect(colorOf('.a { color: red; } .b { color: blue; }', '<p id="t" class="a b"></p>')).toBe(BLUE);
    expect(colorOf('.b { color: blue; } p { color: red; }', '<p id="t" class="b"></p>')).toBe(BLUE);
  });

  it('Section 2: an inline style beats an id rule and an !important sheet rule beats an inline style', () => {
    expect(colorOf('#t { color: red; }', '<p id="t" style="color: blue"></p>')).toBe(BLUE);
    expect(colorOf('#t { color: red; }', '<p id="t" style="color: blue !important"></p>')).toBe(BLUE);
    expect(colorOf('p { color: red !important; }', '<p id="t" style="color: blue"></p>')).toBe(RED);
    expect(colorOf('p { color: blue !important; } #t { color: red; }', '<p id="t"></p>')).toBe(BLUE);
  });

  it('Section 2: :where adds no specificity and :is takes its most specific argument', () => {
    const html = '<p id="t" class="b"></p>';
    expect(colorOf('.b { color: blue; } :where(#t) { color: red; }', html)).toBe(BLUE);
    expect(colorOf(':where(#t) { color: red; } .b { color: blue; }', html)).toBe(BLUE);
    expect(colorOf('p { color: green; } :where(.b) { color: red; }', html)).toBe(GREEN);
    expect(colorOf(':is(#t, .z) { color: red; } .b { color: blue; }', html)).toBe(RED);
    expect(colorOf('.b { color: blue; } :is(#t, .z) { color: red; }', html)).toBe(RED);
  });

  it('Section 2: :not counts like its most specific argument', () => {
    const html = '<p id="t" class="b"></p>';
    expect(colorOf(':not(#other) { color: red; } .b { color: blue; }', html)).toBe(RED);
    expect(colorOf(':not(.z) { color: red; } .b { color: blue; }', html)).toBe(BLUE);
  });

  it('Section 2: :has matches by structure and counts like its argument', () => {
    const root = mountStyles('', '<div><p></p></div><div><i></i></div><h2></h2><p></p>');
    expect([root.querySelectorAll('div:has(p)').length, root.querySelectorAll('h2:has(+ p)').length]).toEqual([1, 1]);
    const html = '<div id="t" class="x"><p class="q"></p></div>';
    expect(colorOf('div:has(p) { color: red; } .x { color: blue; }', html)).toBe(BLUE);
    expect(colorOf('div:has(.q) { color: red; } .x { color: blue; }', html)).toBe(RED);
  });

  it('Section 2: color inherits and border-width does not', () => {
    const root = mountStyles('div { color: red; border: 3px solid black; }', '<div><p id="t"></p></div>');
    const p = root.querySelector('#t') as Element;
    expect([computed(p, 'color'), computed(p, 'border-top-width')]).toEqual([RED, '0px']);
  });

  it('Section 2: inherit, initial and unset resolve by property kind', () => {
    const root = mountStyles(
      'div { color: red; background-color: yellow; } p { color: initial; background-color: inherit; } i { color: unset; background-color: unset; }',
      '<div><p id="p"></p><i id="i"></i></div>',
    );
    const [p, i] = [root.querySelector('#p'), root.querySelector('#i')] as Element[];
    expect([computed(p as Element, 'color'), computed(p as Element, 'background-color')]).toEqual(['rgb(0, 0, 0)', 'rgb(255, 255, 0)']);
    expect([computed(i as Element, 'color'), computed(i as Element, 'background-color')]).toEqual([RED, 'rgba(0, 0, 0, 0)']);
  });
});
