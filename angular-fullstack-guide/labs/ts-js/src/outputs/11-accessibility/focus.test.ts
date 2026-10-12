// @vitest-environment jsdom
// Q11.08 (Output question of module 11): tabIndex and focus() as jsdom 30.1.1 implements them. jsdom has no sequential focus
// navigation and its focus() ignores rendering, so this asserts DOM state only, not what a browser's Tab key does.
import { afterEach, describe, expect, it } from 'vitest';
import { captureLogs } from '../capture';
import { mount, unmount } from '../../modules/11-accessibility/support/dom';

afterEach(unmount);

describe('Module 11 · Output questions: focus', () => {
  it('Q11.08 tabIndex is 0 for native controls and -1 for a div, and focus() moves only to what can take it', async () => {
    const lines = await captureLogs(async (log) => {
      const console = { log };
      const root = mount('<button id="b"></button><a id="a" href="#x"></a><div id="d"></div><div id="m" tabindex="-1"></div><input id="off" disabled>');
      for (const element of root.querySelectorAll<HTMLElement>('*')) {
        element.focus();
        console.log(element.id, element.tabIndex, document.activeElement?.id);
      }
    });
    expect(lines).toEqual(['b 0 b', 'a 0 a', 'd -1 a', 'm -1 m', 'off 0 m']);
  });
});
