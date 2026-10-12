// @vitest-environment jsdom
import { afterEach } from 'vitest';
import { compareSpecificity, specificity } from './specificity';
import { computed, mountStyles, unmount } from './support/dom';

afterEach(unmount);

describe('E10.1 A specificity calculator', () => {
  it('ids, classes, attribute selectors and pseudo-classes, and types and pseudo-elements are counted into their own column', () => {
    expect(specificity('#a.b[c]:hover p::before')).toEqual([1, 3, 2]);
    expect(specificity('ul li:nth-child(2n+1) a[href="x"]')).toEqual([0, 2, 3]);
  });

  it('`*`, combinators and `:where()` (whatever its argument) add nothing', () => {
    expect(specificity('* > .a ~ *')).toEqual([0, 1, 0]);
    expect(specificity(':where(#a .b p)')).toEqual([0, 0, 0]);
    expect(specificity('.x:where(#id, .y)')).toEqual([0, 1, 0]);
  });

  it('`:is()`, `:not()` and `:has()` add the specificity of their most specific argument', () => {
    expect(specificity(':is(#a, .b)')).toEqual([1, 0, 0]);
    expect(specificity(':is(.a, #b .c)')).toEqual([1, 1, 0]);
    expect(specificity(':not(.a, p)')).toEqual([0, 1, 0]);
    expect(specificity('div:has(> .x, + p)')).toEqual([0, 1, 1]);
  });

  it('compareSpecificity orders by column left to right, so [1,0,0] beats [0,20,0]', () => {
    expect(compareSpecificity([1, 0, 0], [0, 20, 0])).toBe(1);
    expect(compareSpecificity([0, 20, 0], [1, 0, 0])).toBe(-1);
    expect(compareSpecificity([0, 1, 2], [0, 1, 1])).toBe(1);
    expect(compareSpecificity([0, 1, 1], [0, 1, 1])).toBe(0);
  });

  it('for a shared table of selector pairs, the calculator winner equals the colour jsdom computes', () => {
    const RED = 'rgb(255, 0, 0)';
    const BLUE = 'rgb(0, 0, 255)';
    // `first` is written before `second`; on a tie the later rule (second) wins.
    const pairs: ReadonlyArray<readonly [first: string, second: string]> = [
      ['#t', '.c.x'],
      ['.c', 'div'],
      ['div', '.c'],
      ['.c', '.x'],
      [':is(#t, .z)', '.c.x'],
      [':where(#t)', 'div'],
      [':not(.z)', '.x'],
      ['div:has(.q)', '.c'],
      ['[id]', 'div.c'],
      ['*', 'div'],
      [':nth-child(1)', 'div'],
    ];
    for (const [first, second] of pairs) {
      unmount();
      const root = mountStyles(`${first} { color: red; } ${second} { color: blue; }`, '<div id="t" class="c x"><p class="q"></p></div>');
      const winner = compareSpecificity(specificity(first), specificity(second)) > 0 ? RED : BLUE;
      expect([first, second, computed(root.querySelector('#t') as Element, 'color')]).toEqual([first, second, winner]);
    }
  });
});
