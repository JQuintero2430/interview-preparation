import { inject, Injectable, InjectionToken, NgModule } from '@angular/core';

// Lets a test count how often the module class is created.
export const CORE_LOG = new InjectionToken<string[]>('lab-m15-core-log');

// Legacy: an app-wide singleton provided through CoreModule.
@Injectable()
export class CoreSession {}

// Legacy: a root-only module that refuses a second import below the first.
@NgModule({ providers: [CoreSession] })
export class CoreModule {
  constructor() {
    const parent = inject(CoreModule, { optional: true, skipSelf: true });
    if (parent) {
      throw new Error('CoreModule is already loaded. Import it only in the root module.');
    }
    inject(CORE_LOG, { optional: true })?.push('CoreModule created');
  }
}
