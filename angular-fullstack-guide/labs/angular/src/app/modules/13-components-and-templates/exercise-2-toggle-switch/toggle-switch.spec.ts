import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ToggleSwitch } from './toggle-switch';

@Component({
  selector: 'lab-toggle-switch-host',
  imports: [ToggleSwitch],
  template: `<lab-toggle-switch [(checked)]="on" [disabled]="disabled()">Wi-Fi</lab-toggle-switch>`,
})
class SwitchHost {
  readonly on = signal(false);
  readonly disabled = signal(false);
}

@Component({
  selector: 'lab-toggle-switch-plain-host',
  imports: [ToggleSwitch],
  template: `<lab-toggle-switch [(checked)]="on" />`,
})
class PlainSwitchHost {
  on = false;
}

@Component({
  selector: 'lab-toggle-switch-role-host',
  imports: [ToggleSwitch],
  template: `<lab-toggle-switch role="presentation" />`,
})
class RoleHost {}

function setup() {
  const fixture = TestBed.createComponent(SwitchHost);
  fixture.detectChanges();
  const element = fixture.nativeElement.querySelector('lab-toggle-switch') as HTMLElement;
  return { fixture, host: fixture.componentInstance, element };
}

function press(element: HTMLElement, init: KeyboardEventInit): void {
  element.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, ...init }));
}

describe('E13.2 A toggle switch driven by its host', () => {
  it('the host has `role="switch"`, `aria-checked` and a `tabindex` of 0, or -1 when disabled', () => {
    const { fixture, host, element } = setup();
    expect(element.getAttribute('role')).toBe('switch');
    expect(element.getAttribute('aria-checked')).toBe('false');
    expect(element.getAttribute('tabindex')).toBe('0');

    host.disabled.set(true);
    fixture.detectChanges();
    expect(element.getAttribute('tabindex')).toBe('-1');
  });

  it('a click or Space or Enter toggles `checked` and the parent signal bound with `[(checked)]` follows', () => {
    const { fixture, host, element } = setup();
    const seen: boolean[] = [];

    for (const act of [
      () => element.click(),
      () => press(element, { key: ' ' }),
      () => press(element, { key: 'Enter' }),
    ]) {
      act();
      fixture.detectChanges();
      seen.push(host.on());
    }
    expect(seen).toEqual([true, false, true]);
    expect(element.getAttribute('aria-checked')).toBe('true');

    const plain = TestBed.createComponent(PlainSwitchHost);
    plain.detectChanges();
    plain.nativeElement.querySelector('lab-toggle-switch').click();
    expect(plain.componentInstance.on).toBe(true);
  });

  it('Shift+Enter does nothing', () => {
    const { fixture, host, element } = setup();
    press(element, { key: 'Enter', shiftKey: true });
    fixture.detectChanges();
    expect(host.on()).toBe(false);
  });

  it('a disabled switch ignores clicks and keys and renders `aria-disabled="true"`', () => {
    const { fixture, host, element } = setup();
    host.disabled.set(true);
    fixture.detectChanges();

    element.click();
    press(element, { key: ' ' });
    press(element, { key: 'Enter' });
    fixture.detectChanges();
    expect(host.on()).toBe(false);
    expect(element.getAttribute('aria-disabled')).toBe('true');
  });

  it('the parent\'s static `role="presentation"` wins over the component\'s static `role`, as the collision rules say', () => {
    const fixture = TestBed.createComponent(RoleHost);
    fixture.detectChanges();
    const element = fixture.nativeElement.querySelector('lab-toggle-switch') as HTMLElement;
    expect(element.getAttribute('role')).toBe('presentation');
  });

  it('destroying the component leaves no listener behind: its `document` Escape handler is not called afterwards', () => {
    const fixture = TestBed.createComponent(ToggleSwitch);
    fixture.detectChanges();
    const escape = () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    escape();
    expect(fixture.componentInstance.escapes()).toBe(1);

    fixture.destroy();
    escape();
    expect(fixture.componentInstance.escapes()).toBe(1);
  });
});
