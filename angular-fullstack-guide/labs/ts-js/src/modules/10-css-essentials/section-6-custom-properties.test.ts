// @vitest-environment jsdom
// jsdom declares, inherits and reads custom properties, but does not resolve var() (pinned in section-1-jsdom-limits.test.ts).
// What a user sees after var() is substituted is the Custom Properties Level 1 account, documented, not observed here.
import { afterEach } from 'vitest';
import { computed, mountStyles, unmount } from './support/dom';

afterEach(unmount);

describe('Module 10 · section 6', () => {
  it('Section 6: a custom property is inherited and a subtree can redefine it', () => {
    const root = mountStyles(
      ':root { --surface: white; } [data-theme="dark"] { --surface: black; }',
      '<div id="light"><p id="a"></p></div><div id="dark" data-theme="dark"><p id="b"></p></div>',
    );
    const read = (id: string) => computed(root.querySelector(`#${id}`) as Element, '--surface');
    expect([read('a'), read('b')]).toEqual(['white', 'black']);
  });

  it('Section 6: setProperty on an element is read back by getPropertyValue and reaches descendants', () => {
    const root = mountStyles('', '<div id="outer"><p id="inner"></p></div>');
    const outer = root.querySelector('#outer') as HTMLElement;
    outer.style.setProperty('--accent', 'green');
    expect([outer.style.getPropertyValue('--accent'), computed(root.querySelector('#inner') as Element, '--accent')]).toEqual(['green', 'green']);
  });

  it('Section 6: a name that nothing declares reads as the empty string and names are case-sensitive', () => {
    const root = mountStyles(':root { --Gap: 4px; }', '<p id="t"></p>');
    const p = root.querySelector('#t') as Element;
    expect([computed(p, '--Gap'), computed(p, '--gap'), computed(p, '--missing')]).toEqual(['4px', '', '']);
  });

  it('Section 6: color-scheme is read as declared', () => {
    const root = mountStyles(':root { color-scheme: light dark; } .force { color-scheme: dark; }', '<p id="a"></p><p id="b" class="force"></p>');
    const [a, b] = [root.querySelector('#a'), root.querySelector('#b')] as Element[];
    expect([computed(a as Element, 'color-scheme'), computed(b as Element, 'color-scheme')]).toEqual(['light dark', 'dark']);
  });
});
