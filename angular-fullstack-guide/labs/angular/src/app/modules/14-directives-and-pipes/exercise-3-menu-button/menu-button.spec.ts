import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FocusRing, Hint, MenuButton, recorder } from './menu-button';

@Component({
  selector: 'lab-e3-order-host',
  imports: [MenuButton],
  template: `<lab-menu-button hint="Open">Menu</lab-menu-button>`,
})
class OrderHost {}

@Component({
  selector: 'lab-e3-exposure-host',
  imports: [MenuButton],
  template: `
    <lab-menu-button id="aliased" hint="Open" />
    <lab-menu-button id="unexposed" text="x" />
  `,
})
class ExposureHost {}

// `Hint` is imported here only so that `labHint` in the template matches it as well.
@Component({
  selector: 'lab-e3-match-host',
  imports: [MenuButton, Hint],
  template: `<lab-menu-button labHint text="Both" />`,
})
class MatchHost {}

function mount<T>(host: new () => T) {
  recorder.length = 0;
  const fixture = TestBed.createComponent(host);
  fixture.detectChanges();
  const root: HTMLElement = fixture.nativeElement;
  return { fixture, root, button: (selector: string) => root.querySelector(selector) as HTMLElement };
}

describe('E14.3 A menu button from host directives', () => {
  it('the host directives\' constructors run before the component\'s and the recorder shows `focus-ring`, `hint`, `menu-button`', () => {
    mount(OrderHost);
    expect(recorder).toEqual(['focus-ring', 'hint', 'menu-button']);
  });

  it('only `hint` is exposed: `hint="Open"` sets the title, while `text="x"` stays a plain attribute and sets nothing', () => {
    const { button } = mount(ExposureHost);
    expect(button('#aliased').getAttribute('title')).toBe('Open');
    expect(button('#unexposed').getAttribute('text')).toBe('x');
    expect(button('#unexposed').hasAttribute('title')).toBe(false);
  });

  it('the host element keeps the component\'s `role` and `tabindex` and the directive\'s class binding after focus and blur', () => {
    const { fixture, button } = mount(OrderHost);
    const el = button('lab-menu-button');
    expect(el.getAttribute('role')).toBe('button');
    expect(el.getAttribute('tabindex')).toBe('0');
    el.dispatchEvent(new Event('focus'));
    fixture.detectChanges();
    expect(el.classList.contains('focus-ring')).toBe(true);
    expect(el.getAttribute('role')).toBe('button');
    expect(el.getAttribute('tabindex')).toBe('0');
    el.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    expect(el.classList.contains('focus-ring')).toBe(false);
    expect(el.getAttribute('role')).toBe('button');
  });

  it('`inject(Hint)` in the component returns the instance that owns the title', () => {
    const { fixture, button } = mount(OrderHost);
    const menu = fixture.debugElement.query(By.directive(MenuButton));
    const hint = menu.injector.get(Hint);
    expect(menu.componentInstance.hint).toBe(hint);
    expect(hint.text()).toBe('Open');
    expect(button('lab-menu-button').getAttribute('title')).toBe(hint.text());
    expect(menu.injector.get(FocusRing)).toBeInstanceOf(FocusRing);
  });

  it('the same directive written in the template is **one** instance: the recorder shows one `hint` constructor line and the template\'s input wins', () => {
    const { button } = mount(MatchHost);
    expect(recorder.filter((line) => line === 'hint')).toHaveLength(1);
    expect(recorder).toEqual(['focus-ring', 'hint', 'menu-button']);
    expect(button('lab-menu-button').getAttribute('title')).toBe('Both');
  });
});
