import { afterNextRender, ApplicationRef, inject, Signal, signal } from '@angular/core';

/** Becomes `true` in the browser once the application is stable, the moment the HTTP transfer cache switches off. */
export function browserStable(): Signal<boolean> {
  const stable = signal(false);
  const appRef = inject(ApplicationRef);
  afterNextRender(() => void appRef.whenStable().then(() => stable.set(true)));
  return stable.asReadonly();
}
