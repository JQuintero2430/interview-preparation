// @vitest-environment jsdom
// Form facts jsdom implements: labels, constraint validation and ARIA attributes as plain DOM. It computes no accessible name
// (no accessibility tree), so how a name is chosen is documented from AccName and HTML-AAM and modelled in Exercise 11.2.
import { afterEach, describe, expect, it } from 'vitest';
import { mount, need, unmount } from './support/dom';

afterEach(unmount);

describe('Module 11 · section 6 · forms in jsdom', () => {
  it('Section 6: a placeholder does not create a label', () => {
    const root = mount('<input id="a" placeholder="Email"><label for="b">Email</label><input id="b" placeholder="name@example.com">');
    const [a, b] = ['a', 'b'].map((id) => need<HTMLInputElement>(root, `#${id}`));
    expect([a?.labels?.length, a?.placeholder]).toEqual([0, 'Email']);
    expect([b?.labels?.length, b?.labels?.[0]?.textContent]).toEqual([1, 'Email']);
  });

  it('Section 6: validity.valueMissing, setCustomValidity and the invalid event', () => {
    const root = mount('<form id="f"><input id="name" name="name" required></form>');
    const form = need<HTMLFormElement>(root, '#f');
    const input = need<HTMLInputElement>(root, '#name');
    let invalidEvents = 0;
    input.addEventListener('invalid', () => (invalidEvents += 1));
    expect([input.validity.valueMissing, input.checkValidity()]).toEqual([true, false]);
    expect(form.reportValidity()).toBe(false);
    expect(invalidEvents).toBeGreaterThan(0);
    input.value = 'Ada';
    expect([input.validity.valueMissing, input.checkValidity()]).toEqual([false, true]);
    input.setCustomValidity('Name taken');
    expect([input.validity.customError, input.validationMessage, input.checkValidity()]).toEqual([true, 'Name taken', false]);
    input.setCustomValidity('');
    expect(input.checkValidity()).toBe(true);
  });

  it('Section 6: aria-describedby ids resolve to the error element and aria-invalid is a plain attribute', () => {
    const root = mount('<label for="e">Email</label><input id="e" aria-describedby="e-hint e-error" aria-invalid="true"><p id="e-hint">We never share it.</p><p id="e-error">Enter an email like name@example.com.</p>');
    const input = need<HTMLInputElement>(root, '#e');
    const described = (input.getAttribute('aria-describedby') ?? '').split(' ').map((id) => document.getElementById(id)?.textContent);
    expect(described).toEqual(['We never share it.', 'Enter an email like name@example.com.']);
    expect([input.getAttribute('aria-invalid'), input.ariaInvalid]).toEqual(['true', 'true']);
    expect(input.checkValidity()).toBe(true);
  });
});
