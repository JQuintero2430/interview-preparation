// @vitest-environment jsdom
// Focus mechanics as jsdom implements them (focus(), tabIndex, focus event order) and a model of a modal focus trap.
// jsdom does not move focus on a real Tab press (pinned in section-2-jsdom-limits.test.ts), so the trap tests dispatch the
// keydown themselves and assert DOM state: the keys' preventDefault and document.activeElement, never what a browser does.
import { afterEach, describe, expect, it } from 'vitest';
import { tabbables, trapFocus } from './focus-trap';
import { key, mount, need, unmount } from './support/dom';

afterEach(unmount);

const DIALOG = '<button id="open">Open</button><div id="dlg"><button id="first">One</button><input id="mid"><button id="last">Two</button></div>';

describe('Module 11 · section 4 · focus and a focus trap in jsdom', () => {
  it('Section 4: tabIndex is 0 for native controls and -1 for a div, and focus() skips a disabled input', () => {
    const root = mount('<button id="b">B</button><a id="a" href="#x">A</a><div id="d">D</div><input id="off" disabled>');
    expect(['b', 'a', 'd'].map((id) => need(root, `#${id}`).tabIndex)).toEqual([0, 0, -1]);
    need(root, '#b').focus();
    need(root, '#off').focus();
    expect(document.activeElement?.id).toBe('b');
  });

  it('Section 4: focus and blur fire as focus, focusin, blur, focusout between two elements', () => {
    const root = mount('<button id="a">A</button><button id="b">B</button>');
    const events: string[] = [];
    for (const id of ['a', 'b']) {
      for (const type of ['focus', 'focusin', 'blur', 'focusout']) {
        need(root, `#${id}`).addEventListener(type, () => events.push(`${id}:${type}`));
      }
    }
    need(root, '#a').focus();
    need(root, '#b').focus();
    expect(events).toEqual(['a:focus', 'a:focusin', 'a:blur', 'a:focusout', 'b:focus', 'b:focusin']);
  });

  it('Section 4: the trap wraps Tab from the last element to the first and Shift+Tab from the first to the last, and ignores other keys', () => {
    const root = mount(DIALOG);
    need(root, '#open').focus();
    trapFocus(need(root, '#dlg'));
    expect(document.activeElement?.id).toBe('first');
    expect(key(need(root, '#first'), 'Tab', { shiftKey: true }).defaultPrevented).toBe(true);
    expect(document.activeElement?.id).toBe('last');
    expect(key(need(root, '#last'), 'Tab').defaultPrevented).toBe(true);
    expect(document.activeElement?.id).toBe('first');
    need(root, '#mid').focus();
    expect(key(need(root, '#mid'), 'Tab').defaultPrevented).toBe(false);
    expect(key(need(root, '#first'), 'ArrowDown').defaultPrevented).toBe(false);
    expect(document.activeElement?.id).toBe('mid');
  });

  it('Section 4: closing the trap returns focus to the opener', () => {
    const root = mount(DIALOG);
    need(root, '#open').focus();
    let escapes = 0;
    const trap = trapFocus(need(root, '#dlg'), { onEscape: () => (escapes += 1) });
    key(need(root, '#first'), 'Escape');
    expect(escapes).toBe(1);
    trap.release();
    expect(document.activeElement?.id).toBe('open');
    key(need(root, '#last'), 'Tab');
    expect(document.activeElement?.id).toBe('open');
  });

  it('Section 4: the tabbables query includes elements a browser would skip', () => {
    const root = mount('<div id="c"><button id="shown">a</button><button id="gone" style="display:none">b</button><button id="off" disabled>c</button><div tabindex="-1">d</div></div>');
    expect(tabbables(need(root, '#c')).map((element) => element.id)).toEqual(['shown', 'gone']);
  });
});
