import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { UI_STATUS_CONFIG, UiStatusConfig } from '../internal/status-config';

export function provideUiStatus(config: UiStatusConfig): EnvironmentProviders {
  return makeEnvironmentProviders([{ provide: UI_STATUS_CONFIG, useValue: config }]);
}
