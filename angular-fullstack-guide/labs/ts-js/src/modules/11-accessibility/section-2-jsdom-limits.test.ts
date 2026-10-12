// @vitest-environment jsdom
// Module 11 runs accessibility code in jsdom, which implements focus, ARIA reflection and constraint validation.
// The `Section 2: jsdom …` pins record what jsdom 30.1.1 does NOT do (or does differently from a browser), so no later
// section can claim an observation jsdom cannot make and a jsdom upgrade that changes one of them is noticed.
import { afterEach, describe, expect, it } from 'vitest';
import { key, mount, need, unmount } from './support/dom';

afterEach(unmount);

describe('Module 11 · section 2 · what jsdom does not do', () => {
  it('Section 2: jsdom has HTMLDialogElement but showModal, show and close are not implemented', () => {
    const root = mount('<dialog id="d"></dialog>');
    const dialog = need<HTMLDialogElement>(root, '#d');
    expect(typeof HTMLDialogElement).toBe('function');
    expect([typeof dialog.showModal, typeof dialog.show, typeof dialog.close]).toEqual(['undefined', 'undefined', 'undefined']);
    dialog.setAttribute('open', '');
    expect(dialog.open).toBe(true);
  });

  it('Section 2: jsdom has no inert: the property is undefined and focus() works inside an [inert] subtree', () => {
    const root = mount('<div inert id="wrap"><button id="b">B</button></div>');
    expect((need(root, '#wrap') as HTMLElement & { inert?: boolean }).inert).toBeUndefined();
    need(root, '#b').focus();
    expect(document.activeElement?.id).toBe('b');
    need(root, '#wrap').setAttribute('inert', '');
    expect(document.activeElement?.id).toBe('b');
  });

  it('Section 2: jsdom focus() ignores rendering: hidden, display none, visibility hidden and aria-hidden buttons take focus', () => {
    const root = mount(
      '<button id="a" hidden>a</button><button id="b" style="display:none">b</button>' +
        '<button id="c" style="visibility:hidden">c</button><div aria-hidden="true"><button id="d">d</button></div>',
    );
    const focused = ['a', 'b', 'c', 'd'].map((id) => {
      need(root, `#${id}`).focus();
      return document.activeElement?.id;
    });
    expect(focused).toEqual(['a', 'b', 'c', 'd']);
  });

  it('Section 2: jsdom has no sequential focus navigation: a Tab keydown moves nothing and delegatesFocus is not honored', () => {
    const root = mount('<button id="a">a</button><button id="b">b</button><div id="host"></div>');
    need(root, '#a').focus();
    key(need(root, '#a'), 'Tab');
    expect(document.activeElement?.id).toBe('a');
    const host = need(root, '#host');
    const shadow = host.attachShadow({ mode: 'open', delegatesFocus: true });
    shadow.innerHTML = '<button id="inner">i</button>';
    host.focus();
    expect(document.activeElement?.id).toBe('a');
  });

  it('Section 2: jsdom has no accessibility tree, innerText, checkVisibility, scrollIntoView or matchMedia', () => {
    const root = mount('<button id="b">B</button>');
    const button = need(root, '#b') as HTMLElement & Record<string, unknown>;
    expect([button['computedRole'], button['ariaLabelledByElements'], button['innerText'], button['checkVisibility']]).toEqual([
      undefined,
      undefined,
      undefined,
      undefined,
    ]);
    expect([typeof button.scrollIntoView, typeof window.matchMedia, button['popover']]).toEqual(['undefined', 'undefined', undefined]);
  });

  it('Section 2: jsdom reports tabIndex 0 for an a without href and for summary (recorded, not relied on)', () => {
    const root = mount('<a id="a">no href</a><details><summary id="s">s</summary></details>');
    expect([need<HTMLAnchorElement>(root, '#a').tabIndex, need(root, '#s').tabIndex]).toEqual([0, 0]);
  });
});
