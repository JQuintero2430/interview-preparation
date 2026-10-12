import { Component, HostAttributeToken, inject, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HostDecorators, HostMeta, HostVariant } from './host-demo';

// Host bindings that collide with the bindings the parent puts on the same element.
@Component({
  selector: 'lab-collision-child',
  template: ``,
  host: {
    role: 'presentation',
    '[id]': '"host-id"',
    '[class.ok]': 'true',
    '[style.color]': '"red"',
    '[title]': '"host-title"',
    '[attr.data-k]': '"host"',
    'data-s': 'host-static',
    '[attr.lang]': '"host-lang"',
  },
})
class CollisionChild {}

@Component({
  selector: 'lab-collision-parent',
  imports: [CollisionChild],
  template: `
    <lab-collision-child
      role="group"
      lang="en"
      [attr.data-s]="'instance-dynamic'"
      [id]="otherId()"
      [class.ok]="off()"
      [style.color]="inst()"
      [title]="otherTitle()"
      [attr.data-k]="'instance'"
    />
  `,
})
class CollisionParent {
  readonly otherId = signal('instance-id');
  readonly otherTitle = signal('instance-title');
  readonly off = signal(false);
  readonly inst = signal('blue');
}

// Listeners on global targets, counted.
@Component({
  selector: 'lab-global-listeners',
  template: ``,
  host: {
    '(document:lab-ping)': 'documentHits.update((n) => n + 1)',
    '(window:lab-ping)': 'windowHits.update((n) => n + 1)',
  },
})
class GlobalListeners {
  readonly documentHits = signal(0);
  readonly windowHits = signal(0);
}

// A component asks for host attributes the parent did and did not write.
@Component({
  selector: 'lab-missing-attribute',
  template: ``,
})
class MissingAttribute {
  readonly token = inject(new HostAttributeToken('nope'));
}

@Component({
  selector: 'lab-variant-parent',
  imports: [HostVariant],
  template: `<lab-host-variant variation="primary" />`,
})
class VariantParent {}

function mount<T>(type: new () => T) {
  const fixture = TestBed.createComponent(type);
  fixture.detectChanges();
  return fixture;
}

function first(root: HTMLElement, selector: string): HTMLElement {
  const found = root.querySelector<HTMLElement>(selector);
  if (!found) {
    throw new Error(`no element for ${selector}`);
  }
  return found;
}

function press(key: string): void {
  document.dispatchEvent(new KeyboardEvent('keydown', { key }));
}

function snapshot(host: HTMLElement) {
  return {
    role: host.getAttribute('role'),
    checked: host.getAttribute('aria-checked'),
    on: host.classList.contains('on'),
    tone: host.style.getPropertyValue('--lab-tone'),
    tabIndex: host.tabIndex,
  };
}

describe('Section 7: the host element', () => {
  it('Section 7: host metadata sets static attributes, properties, classes, styles and listeners on the host', () => {
    const fixture = mount(HostMeta);
    const host: HTMLElement = fixture.nativeElement;

    expect(snapshot(host)).toEqual({ role: 'switch', checked: 'false', on: false, tone: 'teal', tabIndex: 0 });

    host.click();
    fixture.detectChanges();
    expect(snapshot(host)).toEqual({ role: 'switch', checked: 'true', on: true, tone: 'teal', tabIndex: 0 });

    fixture.componentInstance.tone.set('coral');
    press('Escape');
    fixture.detectChanges();
    expect(snapshot(host)).toEqual({ role: 'switch', checked: 'false', on: false, tone: 'coral', tabIndex: 0 });
  });

  it('Section 7: HostBinding and HostListener produce the same effect', () => {
    const meta = mount(HostMeta);
    const legacy = mount(HostDecorators);
    const hosts: HTMLElement[] = [meta.nativeElement, legacy.nativeElement];

    const states = hosts.map(snapshot);
    expect(states[1]).toEqual(states[0]);

    hosts.forEach((host) => host.click());
    meta.detectChanges();
    legacy.detectChanges();
    expect(snapshot(hosts[1])).toEqual(snapshot(hosts[0]));
    expect(snapshot(hosts[1]).on).toBe(true);

    press('Escape');
    meta.detectChanges();
    legacy.detectChanges();
    expect(snapshot(hosts[1])).toEqual(snapshot(hosts[0]));
    expect(snapshot(hosts[1]).on).toBe(false);
  });

  it('Section 7: static instance attributes beat host attributes, dynamic host properties beat dynamic instance ones, template class and style bindings beat host ones', () => {
    const fixture = mount(CollisionParent);
    const host = first(fixture.nativeElement, 'lab-collision-child');

    // Two static values: the parent's wins.
    expect(host.getAttribute('role')).toBe('group');
    // Static against dynamic: the dynamic one wins, whichever side it is on.
    expect(host.getAttribute('lang')).toBe('host-lang');
    expect(host.getAttribute('data-s')).toBe('instance-dynamic');
    // Two dynamic properties and attributes: the host binding wins.
    expect(host.id).toBe('host-id');
    expect(host.title).toBe('host-title');
    expect(host.getAttribute('data-k')).toBe('host');
    // Class and style: the template's binding wins, even when it is false.
    expect(host.classList.contains('ok')).toBe(false);
    expect(host.style.color).toBe('blue');

    fixture.componentInstance.off.set(true);
    fixture.componentInstance.inst.set('green');
    fixture.componentInstance.otherId.set('changed-id');
    fixture.detectChanges();
    expect(host.classList.contains('ok')).toBe(true);
    expect(host.style.color).toBe('green');
    // The host's constant never changes, so once the parent's value changes the element shows it.
    expect(host.id).toBe('changed-id');
    expect(host.title).toBe('host-title');
  });

  it('Section 7: a document-level host listener is removed when the component is destroyed', () => {
    const fixture = mount(GlobalListeners);
    const instance = fixture.componentInstance;

    document.dispatchEvent(new Event('lab-ping'));
    window.dispatchEvent(new Event('lab-ping'));
    expect([instance.documentHits(), instance.windowHits()]).toEqual([1, 1]);

    fixture.destroy();
    document.dispatchEvent(new Event('lab-ping'));
    window.dispatchEvent(new Event('lab-ping'));
    expect([instance.documentHits(), instance.windowHits()]).toEqual([1, 1]);
  });

  it('Section 7: HostAttributeToken reads a static attribute and throws when it is missing', () => {
    const fixture = mount(VariantParent);
    const variant = fixture.debugElement.children[0].componentInstance;

    expect(variant).toBeInstanceOf(HostVariant);
    expect(variant.variation).toBe('primary');
    expect(variant.size).toBeNull();
    expect(first(fixture.nativeElement, 'lab-host-variant').textContent).toBe('primary');

    expect(() => TestBed.createComponent(MissingAttribute)).toThrowError(/HostAttributeToken nope/);
  });
});
