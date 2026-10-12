import { Component, InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';

export interface ApiConfig {
  readonly url: string;
}

export const API_CONFIG = new InjectionToken<ApiConfig>('lab-m15-api-config');

// Legacy: the declarable both doors bring.
@Component({ selector: 'lab-m15-api-status', standalone: false, template: '<span>api</span>' })
export class ApiStatus {}

// Legacy: one module, two doors. forRoot adds the configuration; forChild adds nothing.
@NgModule({ declarations: [ApiStatus], exports: [ApiStatus] })
export class ApiModule {
  static forRoot(config: ApiConfig): ModuleWithProviders<ApiModule> {
    return { ngModule: ApiModule, providers: [{ provide: API_CONFIG, useValue: config }] };
  }

  static forChild(): ModuleWithProviders<ApiModule> {
    return { ngModule: ApiModule };
  }
}
