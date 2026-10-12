// @vitest-environment jsdom
// Q10.04 and Q10.05 (Output questions of module 10): the colours jsdom 30.1.1 computes from the cascade.
// jsdom does no layout and ignores @layer, so these are cascade results, not statements about painting.
import { afterEach } from 'vitest';
import { captureLogs } from '../capture';
import { computed, mountStyles, unmount } from '../../modules/10-css-essentials/support/dom';

afterEach(unmount);

describe('Module 10 · Output questions: the cascade', () => {
  it('Q10.04 an id beats a class beats a later type rule, an inline style beats a class, and an !important sheet rule beats an inline style', async () => {
    const lines = await captureLogs(async (log) => {
      const console = { log };
      const colorOf = (element: Element) => getComputedStyle(element).color;
      const root = mountStyles(
        '#a { color: red; } .b { color: blue; } p { color: green; } .c { color: red !important; }',
        '<p id="a" class="b"></p><p class="b"></p><p class="b" style="color: purple"></p><p class="c" style="color: purple"></p>',
      );
      for (const p of root.querySelectorAll('p')) console.log(colorOf(p));
    });
    expect(lines).toEqual(['rgb(255, 0, 0)', 'rgb(0, 0, 255)', 'rgb(128, 0, 128)', 'rgb(255, 0, 0)']);
  });

  it('Q10.05 :where weighs zero, :is and :not weigh their most specific argument, and :has matches the ancestor', async () => {
    const lines = await captureLogs(async (log) => {
      const console = { log };
      const html = '<div id="t" class="x"><p class="q"></p></div>';
      const colorOfT = (css: string) => {
        unmount();
        return computed(mountStyles(css, html).querySelector('#t') as Element, 'color');
      };
      console.log(colorOfT(':where(#t) { color: red; } .x { color: blue; }'));
      console.log(colorOfT(':is(#t, .z) { color: red; } .x { color: blue; }'));
      console.log(colorOfT(':not(#other) { color: red; } .x { color: blue; }'));
      console.log(colorOfT('div:has(.q) { color: red; } .x { color: blue; }'));
      console.log(mountStyles('', html).querySelector(':has(.q)')?.id);
    });
    expect(lines).toEqual(['rgb(0, 0, 255)', 'rgb(255, 0, 0)', 'rgb(255, 0, 0)', 'rgb(255, 0, 0)', 't']);
  });
});
