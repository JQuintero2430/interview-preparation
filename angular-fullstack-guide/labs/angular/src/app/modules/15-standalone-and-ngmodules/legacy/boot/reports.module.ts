import { inject, Injectable, InjectionToken, ModuleWithProviders, NgModule } from '@angular/core';

// Lets a test observe when module classes and services are instantiated.
export const REPORTS_LOG = new InjectionToken<string[]>('lab-m15-reports-log');

export interface ReportsConfig {
  readonly title: string;
}

export const REPORTS_CONFIG = new InjectionToken<ReportsConfig>('lab-m15-reports-config');

function record(event: string): void {
  inject(REPORTS_LOG, { optional: true })?.push(event);
}

// Legacy: a service that only exists through ChartsModule's `providers`.
@Injectable()
export class ChartSvc {
  constructor() {
    record('ChartSvc created');
  }
}

// Legacy: an NgModule that carries providers and no declarations.
@NgModule({ providers: [ChartSvc] })
export class ChartsModule {
  constructor() {
    record('ChartsModule created');
  }
}

// Legacy: a library-style module that imports another module and offers forRoot(config).
@NgModule({ imports: [ChartsModule] })
export class ReportsModule {
  constructor() {
    record('ReportsModule created');
  }

  static forRoot(config: ReportsConfig): ModuleWithProviders<ReportsModule> {
    return { ngModule: ReportsModule, providers: [{ provide: REPORTS_CONFIG, useValue: config }] };
  }
}
