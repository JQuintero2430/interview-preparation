// @vitest-environment jsdom
// What jsdom implements about native semantics: focusability, labels, the alt attribute. Role mapping and the accessibility
// tree are NOT available here (see section-2-jsdom-limits.test.ts), so those are documented from the specifications.
import { afterEach, describe, expect, it } from 'vitest';
import { mount, need, unmount } from './support/dom';

afterEach(unmount);

describe('Module 11 · section 2 · native semantics in jsdom', () => {
  it('Section 2: a button and an input are focusable and a div is not until it has a tabindex', () => {
    const root = mount('<button id="b">B</button><input id="i"><div id="plain">p</div><div id="t" tabindex="0">t</div><div id="m" tabindex="-1">m</div>');
    const tabIndexes = ['b', 'i', 'plain', 't', 'm'].map((id) => need(root, `#${id}`).tabIndex);
    expect(tabIndexes).toEqual([0, 0, -1, 0, -1]);
    need(root, '#plain').focus();
    expect(document.activeElement).toBe(document.body);
    need(root, '#b').focus();
    expect(document.activeElement?.id).toBe('b');
    need(root, '#t').focus();
    expect(document.activeElement?.id).toBe('t');
  });

  it('Section 2: input.labels follows a for attribute and a wrapping label', () => {
    const root = mount(
      '<label for="a">Name</label><input id="a"><label>Email <input id="b"></label><input id="c" placeholder="Phone">',
    );
    const [a, b, c] = ['a', 'b', 'c'].map((id) => need<HTMLInputElement>(root, `#${id}`));
    expect([a?.labels?.length, a?.labels?.[0]?.textContent]).toEqual([1, 'Name']);
    expect([b?.labels?.length, b?.labels?.[0]?.textContent?.trim()]).toEqual([1, 'Email']);
    expect(c?.labels?.length).toBe(0);
  });

  it("Section 2: a missing alt and an empty alt differ only by the attribute's presence", () => {
    const root = mount('<img id="none" src="a.png"><img id="empty" src="a.png" alt=""><img id="text" src="a.png" alt="Logo">');
    const [none, empty, text] = ['none', 'empty', 'text'].map((id) => need<HTMLImageElement>(root, `#${id}`));
    expect([none?.alt, empty?.alt, text?.alt]).toEqual(['', '', 'Logo']);
    expect([none?.hasAttribute('alt'), empty?.hasAttribute('alt'), text?.hasAttribute('alt')]).toEqual([false, true, true]);
  });
});
