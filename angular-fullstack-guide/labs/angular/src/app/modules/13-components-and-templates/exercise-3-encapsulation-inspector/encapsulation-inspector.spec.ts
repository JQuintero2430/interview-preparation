import { Component, ViewEncapsulation } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { inspectEncapsulation, leaksInto } from './encapsulation-inspector';

// The same declarations in three modes, so only the mode explains a difference.
const STYLES = `
  h2 {
    color: red;
    background-color: yellow;
  }
`;

@Component({ selector: 'lab-inspect-emulated', template: `<h2>Title</h2>`, styles: STYLES })
class EmulatedBox {}

@Component({
  selector: 'lab-inspect-none',
  template: `<h2>Title</h2>`,
  encapsulation: ViewEncapsulation.None,
  styles: STYLES,
})
class NoneBox {}

@Component({
  selector: 'lab-inspect-shadow',
  template: `<h2>Title</h2>`,
  encapsulation: ViewEncapsulation.ShadowDom,
  styles: STYLES,
})
class ShadowBox {}

@Component({ selector: 'lab-inspect-unstyled', template: `<h2>Title</h2>` })
class UnstyledBox {}

// Emulated, with a rule of its own that never touches the heading.
@Component({ selector: 'lab-inspect-bystander', template: `<h2>Bystander</h2>`, styles: `p { margin: 0; }` })
class Bystander {}

function mount(type: new () => unknown): { fixture: ComponentFixture<unknown>; host: HTMLElement } {
  const fixture = TestBed.createComponent(type);
  fixture.detectChanges();
  return { fixture, host: fixture.nativeElement as HTMLElement };
}

function heading(host: HTMLElement): HTMLElement {
  return (host.shadowRoot ?? host).querySelector('h2') as HTMLElement;
}

describe('E13.3 An encapsulation inspector', () => {
  it('an Emulated component reports `emulated` with `_nghost-…` and `_ngcontent-…` attributes sharing one suffix', () => {
    const { host } = mount(EmulatedBox);
    const report = inspectEncapsulation(host);

    expect(report.mode).toBe('emulated');
    expect(report.hostAttribute).toMatch(/^_nghost-/);
    expect(report.contentAttribute).toMatch(/^_ngcontent-/);
    expect(report.hostAttribute?.replace('_nghost-', '')).toBe(report.contentAttribute?.replace('_ngcontent-', ''));
    expect(report.stylesIn).toBe('head');
  });

  it("a ShadowDom component reports `shadow-dom` and `stylesIn: 'shadow-root'`", () => {
    const { host } = mount(ShadowBox);
    expect(inspectEncapsulation(host)).toEqual({
      mode: 'shadow-dom',
      hostAttribute: null,
      contentAttribute: null,
      stylesIn: 'shadow-root',
    });
  });

  it("a None component reports `none` with no attributes and `stylesIn: 'head'`", () => {
    const { host } = mount(NoneBox);
    expect(inspectEncapsulation(host)).toEqual({
      mode: 'none',
      hostAttribute: null,
      contentAttribute: null,
      stylesIn: 'head',
    });
  });

  it('a component with no styles reports `none` (the Emulated switch)', () => {
    const { host } = mount(UnstyledBox);
    expect(inspectEncapsulation(host)).toEqual({
      mode: 'none',
      hostAttribute: null,
      contentAttribute: null,
      stylesIn: 'none',
    });
  });

  it('`leaksInto` is true for a None style into an unrelated Emulated component and false for an Emulated style, after normalizing the property', () => {
    const none = mount(NoneBox);
    const bystander = mount(Bystander);
    const target = heading(bystander.host);

    expect(leaksInto(heading(none.host), target, 'color')).toBe(true);
    expect(leaksInto(heading(none.host), target, 'backgroundColor')).toBe(true);
    expect(leaksInto(heading(none.host), target, 'background-color')).toBe(true);
    // Switching the leak off again leaves the style in place.
    expect(getComputedStyle(target).color).toBe('rgb(255, 0, 0)');
    none.fixture.destroy();

    const emulated = mount(EmulatedBox);
    expect(leaksInto(heading(emulated.host), target, 'color')).toBe(false);
    expect(leaksInto(heading(mount(ShadowBox).host), target, 'color')).toBe(false);
  });

  it('two instances of one Emulated component report the same suffix, and destroying both removes the style from the head', () => {
    const first = mount(EmulatedBox);
    const second = mount(EmulatedBox);
    const report = inspectEncapsulation(first.host);

    expect(inspectEncapsulation(second.host).hostAttribute).toBe(report.hostAttribute);
    expect(inspectEncapsulation(second.host).contentAttribute).toBe(report.contentAttribute);
    expect(headStylesMentioning(report.contentAttribute)).toBe(1);

    first.fixture.destroy();
    expect(headStylesMentioning(report.contentAttribute)).toBe(1);
    second.fixture.destroy();
    expect(headStylesMentioning(report.contentAttribute)).toBe(0);
  });
});

function headStylesMentioning(attribute: string | null): number {
  const styles = Array.from(document.head.querySelectorAll('style'));
  return styles.filter((style) => (style.textContent ?? '').includes(`[${attribute}]`)).length;
}
