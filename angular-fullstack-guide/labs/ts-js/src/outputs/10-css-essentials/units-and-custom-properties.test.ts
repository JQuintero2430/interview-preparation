// @vitest-environment jsdom
// Q10.13 and Q10.16 (Output questions of module 10): computed font sizes and custom property values as jsdom 30.1.1 reports them.
// jsdom resolves em, rem and percentages against font sizes and inherits custom properties; it does not resolve var() or lay out boxes.
import { afterEach } from 'vitest';
import { captureLogs } from '../capture';
import { mountStyles, unmount } from '../../modules/10-css-essentials/support/dom';

afterEach(unmount);

describe('Module 10 · Output questions: units and custom properties', () => {
  it('Q10.13 em and a percentage on font-size compound through the parent, rem follows the root', async () => {
    const lines = await captureLogs(async (log) => {
      const console = { log };
      const root = mountStyles(
        'html { font-size: 20px; } .outer { font-size: 2em; } .inner { font-size: 2em; } .r { font-size: 2rem; } .half { font-size: 50%; }',
        '<div class="outer" id="outer"><div class="inner" id="inner"></div><div class="r" id="r"></div><div class="half" id="half"></div></div>',
      );
      for (const id of ['outer', 'inner', 'r', 'half']) console.log(getComputedStyle(root.querySelector(`#${id}`) as Element).fontSize);
    });
    expect(lines).toEqual(['40px', '80px', '40px', '20px']);
  });

  it('Q10.16 a custom property is inherited, a subtree redefinition replaces it for its descendants', async () => {
    const lines = await captureLogs(async (log) => {
      const console = { log };
      const root = mountStyles(
        ':root { --surface: white; } [data-theme="dark"] { --surface: black; } .x { --surface: gray; }',
        '<div id="a"><p id="b"></p></div><div id="c" data-theme="dark"><p id="d"></p><p id="e" class="x"></p></div>',
      );
      for (const id of ['a', 'b', 'c', 'd', 'e']) console.log(getComputedStyle(root.querySelector(`#${id}`) as Element).getPropertyValue('--surface'));
    });
    expect(lines).toEqual(['white', 'white', 'black', 'black', 'gray']);
  });
});
