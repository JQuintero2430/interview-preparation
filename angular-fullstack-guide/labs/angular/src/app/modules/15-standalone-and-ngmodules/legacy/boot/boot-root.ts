import { Component, inject, Injectable, InjectionToken } from '@angular/core';

// Lets a test pass a value through bootstrapModule's applicationProviders.
export const BOOT_GREETING = new InjectionToken<string>('lab-m15-boot-greeting');

// Legacy: provided by BootModule's `providers`.
@Injectable()
export class BootSvc {
  readonly name = 'boot-svc';
}

// Legacy: the root component of an NgModule app, declared and bootstrapped by BootModule.
@Component({
  selector: 'lab-m15-boot-root',
  standalone: false,
  template: '<p>{{ greeting }} {{ svc.name }}</p>',
})
export class BootRoot {
  protected readonly svc = inject(BootSvc);
  protected readonly greeting = inject(BOOT_GREETING, { optional: true }) ?? 'hello';
}
