import {
  createEnvironmentInjector,
  DestroyRef,
  EnvironmentInjector,
  forwardRef,
  inject,
  InjectionToken,
  ProviderToken,
  Provider,
  Service,
} from '@angular/core';

// Counts how often each cleanup path ran, so a test can read it.
export const cleanups = { ngOnDestroy: 0, callback: 0 };

export const FEATURE_NAME = new InjectionToken<string>('lab-e5-feature-name');

// Lives only in the injector that lists it; that injector's DestroyRef is the one injected.
@Service({ autoProvided: false })
export class FeatureSession {
  readonly name = inject(FEATURE_NAME);
  // onDestroy returns the function that unregisters the callback.
  readonly cancelCallback = inject(DestroyRef).onDestroy(() => {
    cleanups.callback++;
  });

  ngOnDestroy(): void {
    cleanups.ngOnDestroy++;
  }
}

export interface OpenFeature {
  readonly session: FeatureSession;
  get<T>(token: ProviderToken<T>): T;
  close(): void;
}

export function openFeature(parent: EnvironmentInjector): OpenFeature {
  const injector = createEnvironmentInjector([FeatureSession], parent);
  return {
    session: injector.get(FeatureSession),
    get: (token) => injector.get(token),
    close: () => injector.destroy(),
  };
}

// The cycle: each class needs the other, so no order can build either.
@Service({ autoProvided: false })
export class Alpha {
  readonly beta = inject(Beta);
}

@Service({ autoProvided: false })
export class Beta {
  readonly alpha = inject(Alpha);
}

// The fix: what both needed moves to a third service, and both depend on it.
@Service({ autoProvided: false })
export class Shared {
  readonly note = 'held once';
}

@Service({ autoProvided: false })
export class AlphaOk {
  readonly shared = inject(Shared);
}

@Service({ autoProvided: false })
export class BetaOk {
  readonly shared = inject(Shared);
}

// Names a class declared further down: without forwardRef this is TS2449.
export const LATE_PROVIDERS: Provider[] = [forwardRef(() => Late)];

@Service({ autoProvided: false })
export class Late {
  readonly text = 'declared after its use';
}
