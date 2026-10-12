import {
  assertInInjectionContext,
  computed,
  inject,
  InjectionToken,
  Injector,
  runInInjectionContext,
  type Signal,
} from '@angular/core';

// The app lists a signal of flags; the helper reads it, so a flag change reaches every reader.
export const FEATURE_FLAGS = new InjectionToken<Signal<Record<string, boolean>>>('lab-e2-flags');

// An injectX() helper: it calls inject(), so it is valid only where inject() is.
export function injectFeatureFlag(name: string): Signal<boolean> {
  // Fails first, and by name, when called outside an injection context.
  assertInInjectionContext(injectFeatureFlag);
  const flags = inject(FEATURE_FLAGS);
  return computed(() => flags()[name] ?? false);
}

// Outside a context, hand the helper the injector captured earlier.
export function readFlagLater(injector: Injector, name: string): boolean {
  return runInInjectionContext(injector, () => injectFeatureFlag(name)());
}
