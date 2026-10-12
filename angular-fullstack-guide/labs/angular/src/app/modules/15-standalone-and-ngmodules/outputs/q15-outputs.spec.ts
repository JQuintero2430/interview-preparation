// labs/angular/src/app/modules/15-standalone-and-ngmodules/outputs/q15-outputs.spec.ts
// Each test reproduces one "Output" question from Module 15 and asserts the exact lines the answer
// prints. If Angular changes behaviour, this file fails first.
import {
  Component,
  createEnvironmentInjector,
  EnvironmentInjector,
  importProvidersFrom,
  inject,
  Injectable,
  isStandalone,
  NgModule,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

// Q15.04: the three ways to write the flag, and an NgModule.
@Component({ selector: 'lab-m15-q04-default', template: 'default' })
class ByDefault {}

// Written out on purpose to show it equals the default (new code omits it).
@Component({ selector: 'lab-m15-q04-explicit', standalone: true, template: 'explicit' })
class Explicit {}

// Legacy: a declared component, so a module in this compilation must declare it.
@Component({ selector: 'lab-m15-q04-declared', standalone: false, template: 'declared' })
class Declared {}

@NgModule({ declarations: [Declared], exports: [Declared] })
class DeclaringModule {}

// Q15.08: a module that imports another, and a service the importing module provides.
const q08Log: string[] = [];
let q08Built = 0;

@Injectable()
class FeatSvc {
  constructor() {
    q08Log.push(`FeatSvc ctor ${++q08Built}`);
  }
}

@NgModule({})
class UtilModule {
  constructor() {
    q08Log.push('UtilModule ctor');
  }
}

@NgModule({ imports: [UtilModule], providers: [FeatSvc] })
class FeatureModule {
  constructor() {
    q08Log.push('FeatureModule ctor');
  }
}

// Q15.13 (legacy anti-pattern): a SharedModule that carries a provider, imported by two feature modules.
let q13Loggers = 0;
let q13Modules = 0;

@Injectable()
class SharedLogger {
  readonly id = ++q13Loggers;
}

@NgModule({ providers: [SharedLogger] })
class SharedModule {
  constructor() {
    q13Modules++;
  }
}

@NgModule({ imports: [SharedModule] })
class OrdersModule {}

@NgModule({ imports: [SharedModule] })
class BillingModule {}

// Q15.17: a standalone component whose imports reach an NgModule with a provider.
let q17Stores = 0;

@Injectable()
class FeatStore {
  readonly id = ++q17Stores;
}

@NgModule({ providers: [FeatStore] })
class FeatModule {}

@Component({ selector: 'lab-m15-q17-panel', imports: [FeatModule], template: 'panel' })
class Panel {
  readonly store = inject(FeatStore);
}

describe('Module 15 output questions', () => {
  it('Q15.04 isStandalone is true for a default and an explicit standalone component, false for standalone false and for an NgModule', () => {
    const lines = [
      `default: ${isStandalone(ByDefault)}`,
      `standalone: true: ${isStandalone(Explicit)}`,
      `standalone: false: ${isStandalone(Declared)}`,
      `NgModule: ${isStandalone(DeclaringModule)}`,
    ];

    expect(lines).toEqual([
      'default: true',
      'standalone: true: true',
      'standalone: false: false',
      'NgModule: false',
    ]);
  });

  it('Q15.08 importProvidersFrom creates the imported module, then the module, when the injector is created, and the service on first get', () => {
    q08Log.length = 0;
    q08Built = 0;
    const root = TestBed.inject(EnvironmentInjector);

    const env = createEnvironmentInjector([importProvidersFrom(FeatureModule)], root);
    q08Log.push('after create');
    const a = env.get(FeatSvc);
    const b = env.get(FeatSvc);
    q08Log.push(`same instance: ${a === b}`);

    expect(q08Log).toEqual([
      'UtilModule ctor',
      'FeatureModule ctor',
      'after create',
      'FeatSvc ctor 1',
      'same instance: true',
    ]);
    env.destroy();
  });

  it('Q15.13 two injectors that import SharedModule get two loggers; one injector importing both features gets one', () => {
    q13Loggers = 0;
    q13Modules = 0;
    const root = TestBed.inject(EnvironmentInjector);
    const lines: string[] = [];

    // What two lazy-loaded feature modules did: one environment injector each.
    const orders = createEnvironmentInjector([importProvidersFrom(OrdersModule)], root);
    const billing = createEnvironmentInjector([importProvidersFrom(BillingModule)], root);
    lines.push(`orders logger: ${orders.get(SharedLogger).id}`);
    lines.push(`billing logger: ${billing.get(SharedLogger).id}`);
    lines.push(`SharedModule instances: ${q13Modules}`);

    // What an eager AppModule importing both features did: one injector.
    const combined = createEnvironmentInjector([importProvidersFrom(OrdersModule, BillingModule)], root);
    lines.push(`combined logger: ${combined.get(SharedLogger).id}`);
    lines.push(`SharedModule instances: ${q13Modules}`);

    expect(lines).toEqual([
      'orders logger: 1',
      'billing logger: 2',
      'SharedModule instances: 2',
      'combined logger: 3',
      'SharedModule instances: 3',
    ]);
    orders.destroy();
    billing.destroy();
    combined.destroy();
  });

  it('Q15.17 two panels created against one environment injector share one store, and the root cannot inject it', () => {
    q17Stores = 0;
    const lines: string[] = [];

    const first = TestBed.createComponent(Panel);
    const second = TestBed.createComponent(Panel);
    lines.push(`first panel store: ${first.componentInstance.store.id}`);
    lines.push(`second panel store: ${second.componentInstance.store.id}`);
    lines.push(`stores created: ${q17Stores}`);
    try {
      TestBed.inject(FeatStore);
    } catch (error) {
      lines.push(`root: ${(error as Error).message.split(':')[0]}`);
    }

    expect(lines).toEqual([
      'first panel store: 1',
      'second panel store: 1',
      'stores created: 1',
      'root: NG0201',
    ]);
  });
});
