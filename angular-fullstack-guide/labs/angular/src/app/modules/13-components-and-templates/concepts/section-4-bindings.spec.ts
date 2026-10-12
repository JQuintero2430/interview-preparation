import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

// Property, attribute and interpolation targets receive the same values.
@Component({
  selector: 'lab-target-values',
  template: `
    <p id="prop" [title]="value()"></p>
    <p id="attr" [attr.title]="value()"></p>
    <p id="text" title="{{ value() }}"></p>
    <input id="field" [value]="value() ?? ''" />
    <input id="field-attr" [attr.value]="value()" />
  `,
})
class TargetValues {
  readonly value = signal<string | null | undefined>('first');
}

// A property binding hands the value to the DOM property, which converts it.
@Component({
  selector: 'lab-disabled-values',
  template: `
    <button id="text" type="button" [disabled]="'false'">a</button>
    <button id="flag" type="button" [disabled]="false">b</button>
  `,
})
class DisabledValues {}

// ARIA attributes are written as attributes, and null removes them.
@Component({
  selector: 'lab-aria-values',
  template: `
    <button id="label" type="button" [aria-label]="label()">go</button>
    <button id="pressed" type="button" [attr.aria-pressed]="pressed()">go</button>
  `,
})
class AriaValues {
  readonly label = signal<string | null>('Save');
  readonly pressed = signal<boolean | null>(true);
}

// A static class, a class map and a single class binding on one element.
@Component({
  selector: 'lab-class-forms',
  template: `
    <p id="merge" class="list" [class]="map()" [class.expanded]="expanded()"></p>
    <p id="object" [class]="flags()"></p>
    <p id="spaces" [class]="{ 'a b': true, c: true }"></p>
  `,
})
class ClassForms {
  readonly map = signal<string | string[]>('box');
  readonly expanded = signal(true);
  readonly flags = signal({ on: true, off: false });
}

// A style string, a single style binding, units and custom properties.
@Component({
  selector: 'lab-style-forms',
  template: `
    <p id="mixed" [style]="'display: flex; color: red'" [style.color]="tone()"></p>
    <p id="unit" [style.width.px]="width()"></p>
    <p id="empty" style="color: red" [style.color]="''"></p>
    <p id="custom" [style.--tone]="tone()" [style.--gap.px]="gap()"></p>
  `,
})
class StyleForms {
  readonly tone = signal<string | null>('blue');
  readonly width = signal<number | null>(12);
  readonly gap = signal(4);
}

// A class object and a style object compared with ===: the same reference is not re-applied.
@Component({
  selector: 'lab-identity-values',
  template: `
    <p id="target" [class]="flags()" [style]="style()">{{ tick() }}</p>
  `,
})
class IdentityValues {
  readonly flags = signal<Record<string, boolean>>({ active: false });
  readonly style = signal<Record<string, string>>({ color: 'red' });
  readonly tick = signal(0);
}

// A host binding and a template binding for the same class and style.
@Component({
  selector: 'lab-host-collision',
  host: { '[class.ok]': 'true', '[style.color]': '"red"' },
  template: '',
})
class HostCollision {}

@Component({
  selector: 'lab-collision-host',
  imports: [HostCollision],
  template: `
    <lab-host-collision id="one" [class.ok]="off()" [style.color]="inst()" />
    <lab-host-collision id="two" />
  `,
})
class CollisionHost {
  readonly off = signal(false);
  readonly inst = signal('blue');
}

function mount<T>(type: new () => T) {
  const fixture = TestBed.createComponent(type);
  fixture.detectChanges();
  return { fixture, root: fixture.nativeElement as HTMLElement };
}

function el(root: HTMLElement, selector: string): HTMLElement {
  return root.querySelector(selector) as HTMLElement;
}

describe('Section 4: property, attribute, class and style bindings', () => {
  it('Section 4: a property binding of undefined or null writes the string, an attribute binding removes the attribute', async () => {
    const { fixture, root } = mount(TargetValues);
    const seen = async (value: string | null | undefined) => {
      fixture.componentInstance.value.set(value);
      await fixture.whenStable();
      return {
        prop: el(root, '#prop').getAttribute('title'),
        attr: el(root, '#attr').getAttribute('title'),
        text: el(root, '#text').getAttribute('title'),
      };
    };

    expect(await seen('x')).toEqual({ prop: 'x', attr: 'x', text: 'x' });
    expect(await seen(undefined)).toEqual({ prop: 'undefined', attr: null, text: '' });
    expect(await seen(null)).toEqual({ prop: 'null', attr: null, text: '' });
    expect(await seen('')).toEqual({ prop: '', attr: '', text: '' });
  });

  it('Section 4: a property binding passes the value to the DOM property, so the string false disables a button', () => {
    const { root } = mount(DisabledValues);

    expect((el(root, '#text') as HTMLButtonElement).disabled).toBe(true);
    expect((el(root, '#flag') as HTMLButtonElement).disabled).toBe(false);
  });

  it('Section 4: a property binding does not write the attribute that an attribute binding writes', () => {
    const { root } = mount(TargetValues);

    expect((el(root, '#field') as HTMLInputElement).value).toBe('first');
    expect(el(root, '#field').getAttribute('value')).toBeNull();
    expect(el(root, '#field-attr').getAttribute('value')).toBe('first');
  });

  it('Section 4: aria bindings write attributes and null removes them', async () => {
    const { fixture, root } = mount(AriaValues);

    expect(el(root, '#label').getAttribute('aria-label')).toBe('Save');
    expect(el(root, '#pressed').getAttribute('aria-pressed')).toBe('true');

    fixture.componentInstance.label.set(null);
    fixture.componentInstance.pressed.set(null);
    await fixture.whenStable();

    expect(el(root, '#label').hasAttribute('aria-label')).toBe(false);
    expect(el(root, '#pressed').hasAttribute('aria-pressed')).toBe(false);
  });

  it('Section 4: static class, class binding and class.x binding merge', async () => {
    const { fixture, root } = mount(ClassForms);
    const classes = () => Array.from(el(root, '#merge').classList).sort();

    expect(classes()).toEqual(['box', 'expanded', 'list']);

    fixture.componentInstance.map.set(['q']);
    await fixture.whenStable();
    expect(classes()).toEqual(['expanded', 'list', 'q']);

    fixture.componentInstance.expanded.set(false);
    await fixture.whenStable();
    expect(classes()).toEqual(['list', 'q']);

    expect(Array.from(el(root, '#object').classList)).toEqual(['on']);
  });

  it('Section 4: a class object key with a space is not applied', () => {
    const { root } = mount(ClassForms);

    expect(Array.from(el(root, '#spaces').classList)).toEqual(['c']);
  });

  it('Section 4: class and style object bindings update only when the reference changes', async () => {
    const { fixture, root } = mount(IdentityValues);
    const target = el(root, '#target');
    const view = () => ({ cls: target.className, color: target.style.color });
    const refresh = async () => {
      fixture.componentInstance.tick.update((n) => n + 1);
      await fixture.whenStable();
    };

    expect(view()).toEqual({ cls: '', color: 'red' });

    fixture.componentInstance.flags()['active'] = true;
    fixture.componentInstance.style()['color'] = 'blue';
    await refresh();
    expect(target.textContent).toBe('1');
    expect(view()).toEqual({ cls: '', color: 'red' });

    fixture.componentInstance.flags.update((flags) => ({ ...flags }));
    fixture.componentInstance.style.update((style) => ({ ...style }));
    await refresh();
    expect(view()).toEqual({ cls: 'active', color: 'blue' });
  });

  it('Section 4: style units and custom properties bind', async () => {
    const { fixture, root } = mount(StyleForms);

    expect(el(root, '#unit').style.width).toBe('12px');
    expect(el(root, '#custom').style.getPropertyValue('--tone')).toBe('blue');
    expect(el(root, '#custom').style.getPropertyValue('--gap')).toBe('4px');
    expect(el(root, '#empty').style.color).toBe('');

    fixture.componentInstance.width.set(null);
    fixture.componentInstance.tone.set(null);
    await fixture.whenStable();

    expect(el(root, '#unit').style.width).toBe('');
    expect(el(root, '#custom').style.getPropertyValue('--tone')).toBe('');
  });

  it('Section 4: a style binding beats the style string on the same element', () => {
    const mixed = el(mount(StyleForms).root, '#mixed');

    expect(mixed.style.color).toBe('blue');
    expect(mixed.style.display).toBe('flex');
  });

  it('Section 4: a template binding beats a host binding for class and style', async () => {
    const { fixture, root } = mount(CollisionHost);

    expect(el(root, '#one').classList.contains('ok')).toBe(false);
    expect(el(root, '#one').style.color).toBe('blue');
    expect(el(root, '#two').classList.contains('ok')).toBe(true);
    expect(el(root, '#two').style.color).toBe('red');

    fixture.componentInstance.off.set(true);
    await fixture.whenStable();

    expect(el(root, '#one').classList.contains('ok')).toBe(true);
  });
});
