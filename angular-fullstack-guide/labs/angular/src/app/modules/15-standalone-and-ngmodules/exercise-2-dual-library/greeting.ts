import {
  Component,
  EnvironmentProviders,
  inject,
  InjectionToken,
  makeEnvironmentProviders,
  ModuleWithProviders,
  NgModule,
} from '@angular/core';

export interface GreetingConfig {
  readonly text: string;
}

export const GREETING_CONFIG = new InjectionToken<GreetingConfig>('lab-m15-e2-greeting-config');

const DEFAULT_GREETING: GreetingConfig = { text: 'Hello' };

// The standalone piece: both kinds of app render this one class.
@Component({
  selector: 'lab-m15-e2-greeting-banner',
  template: '<p>{{ config.text }}</p>',
})
export class GreetingBanner {
  protected readonly config = inject(GREETING_CONFIG, { optional: true }) ?? DEFAULT_GREETING;
}

// The standalone entry point: environment-only, like provideRouter.
export function provideGreeting(config: GreetingConfig): EnvironmentProviders {
  return makeEnvironmentProviders([{ provide: GREETING_CONFIG, useValue: config }]);
}

// Legacy wrapper for NgModule apps: re-exports the banner and delegates to provideGreeting.
@NgModule({ imports: [GreetingBanner], exports: [GreetingBanner] })
export class GreetingModule {
  constructor() {
    const here = inject(GREETING_CONFIG, { self: true, optional: true });
    const above = inject(GREETING_CONFIG, { skipSelf: true, optional: true });
    if (here && above) {
      throw new Error('GreetingModule.forRoot() was called twice. Use forChild() below the root.');
    }
  }

  static forRoot(config: GreetingConfig): ModuleWithProviders<GreetingModule> {
    return { ngModule: GreetingModule, providers: [provideGreeting(config)] };
  }

  static forChild(): ModuleWithProviders<GreetingModule> {
    return { ngModule: GreetingModule };
  }
}
