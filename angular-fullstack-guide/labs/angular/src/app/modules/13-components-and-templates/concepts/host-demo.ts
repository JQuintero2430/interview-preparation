import { Component, HostAttributeToken, HostBinding, HostListener, inject, signal } from '@angular/core';

// One host element, bound through `host` metadata: a static attribute, an attribute, a class,
// a custom property, a property, a listener on the element and one on `document`.
@Component({
  selector: 'lab-host-meta',
  template: `<ng-content />`,
  host: {
    role: 'switch',
    '[attr.aria-checked]': 'on()',
    '[class.on]': 'on()',
    '[style.--lab-tone]': 'tone()',
    '[tabIndex]': '0',
    '(click)': 'toggle()',
    '(document:keydown.escape)': 'turnOff()',
  },
})
export class HostMeta {
  readonly on = signal(false);
  readonly tone = signal('teal');

  toggle(): void {
    this.on.update((value) => !value);
  }

  turnOff(): void {
    this.on.set(false);
  }
}

// The same host through the legacy decorators.
@Component({ selector: 'lab-host-decorators', template: `<ng-content />` })
export class HostDecorators {
  readonly on = signal(false);
  readonly tone = signal('teal');

  @HostBinding('attr.role') readonly role = 'switch';
  @HostBinding('tabIndex') readonly tabIndex = 0;

  @HostBinding('attr.aria-checked')
  get checked(): boolean {
    return this.on();
  }

  @HostBinding('class.on')
  get isOn(): boolean {
    return this.on();
  }

  @HostBinding('style.--lab-tone')
  get toneValue(): string {
    return this.tone();
  }

  @HostListener('click')
  toggle(): void {
    this.on.update((value) => !value);
  }

  @HostListener('document:keydown.escape')
  turnOff(): void {
    this.on.set(false);
  }
}

// A static attribute of the host, read once with `inject()`; the missing one is optional.
@Component({ selector: 'lab-host-variant', template: `{{ variation }}` })
export class HostVariant {
  readonly variation = inject(new HostAttributeToken('variation'));
  readonly size = inject(new HostAttributeToken('size'), { optional: true });
}
