import { InjectionToken } from '@angular/core';

/** Internal: the shape `provideUiStatus` accepts, and the token the pill reads. */
export interface UiStatusConfig {
  readonly labels: Readonly<Record<string, string>>;
}

export const UI_STATUS_CONFIG = new InjectionToken<UiStatusConfig>('UI_STATUS_CONFIG', {
  factory: () => ({ labels: {} }),
});
