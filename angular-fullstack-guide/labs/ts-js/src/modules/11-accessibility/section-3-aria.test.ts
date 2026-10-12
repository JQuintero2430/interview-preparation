// @vitest-environment jsdom
// ARIA reflection and the fact that ARIA adds no behavior, as far as jsdom can show it. What assistive technology does with
// these attributes is documented (ARIA 1.2, APG), not observed: jsdom has no accessibility tree.
import { afterEach, describe, expect, it } from 'vitest';
import { key, mount, need, unmount } from './support/dom';

afterEach(unmount);

describe('Module 11 · section 3 · ARIA attributes in jsdom', () => {
  it('Section 3: role, ariaLabel and ariaPressed read and write the attributes', () => {
    const root = mount('<div id="d" role="group" aria-label="Rating"></div>');
    const div = need(root, '#d');
    expect([div.role, div.ariaLabel]).toEqual(['group', 'Rating']);
    div.ariaPressed = 'true';
    div.role = 'toolbar';
    expect([div.getAttribute('aria-pressed'), div.getAttribute('role')]).toEqual(['true', 'toolbar']);
    div.setAttribute('aria-label', 'Stars');
    expect(div.ariaLabel).toBe('Stars');
  });

  it('Section 3: ElementInternals sets a default role and writes no attribute', () => {
    class SwitchElement extends HTMLElement {
      readonly internals = this.attachInternals();
    }
    customElements.define('x-switch-11', SwitchElement);
    const root = mount('<x-switch-11 id="s"></x-switch-11>');
    const element = need<SwitchElement>(root, '#s');
    element.internals.role = 'switch';
    element.internals.ariaChecked = 'true';
    expect([element.internals.role, element.internals.ariaChecked]).toEqual(['switch', 'true']);
    expect([element.hasAttribute('role'), element.hasAttribute('aria-checked')]).toEqual([false, false]);
  });

  it('Section 3: a div with role button is not focusable and a keydown on it does nothing', () => {
    const root = mount('<div id="d" role="button">Place Order</div>');
    const div = need(root, '#d');
    let activations = 0;
    div.addEventListener('click', () => (activations += 1));
    div.focus();
    key(div, 'Enter');
    key(div, ' ');
    expect([div.tabIndex, document.activeElement === div, activations]).toEqual([-1, false, 0]);
  });

  it('Section 3: focus() reaches a native button and not a div with role button', () => {
    const root = mount('<button id="b">B</button><div id="d" role="button">D</div>');
    need(root, '#b').focus();
    expect(document.activeElement?.id).toBe('b');
    need(root, '#d').focus();
    expect(document.activeElement?.id).toBe('b');
  });

  it('Section 3: aria-hidden does not stop focus() in jsdom', () => {
    const root = mount('<div aria-hidden="true"><button id="b">B</button></div>');
    need(root, '#b').focus();
    expect(document.activeElement?.id).toBe('b');
  });
});
