import { Component, createEnvironmentInjector, EnvironmentInjector, importProvidersFrom, NgModule, NgModuleRef } from '@angular/core';
import { BrowserModule, platformBrowser } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';
import { API_CONFIG, ApiModule } from '../legacy/shared/api.module';
import { CORE_LOG, CoreModule } from '../legacy/shared/core.module';
import { SHARED_LOG, SharedLogger, SharedModule } from '../legacy/shared/shared.module';

// Legacy: two feature modules that both import SharedModule.
@NgModule({ imports: [SharedModule] })
class OrdersModule {}

@NgModule({ imports: [SharedModule] })
class BillingModule {}

// Legacy: a declared component whose template uses what SharedModule re-exports.
@Component({
  selector: 'lab-m15-orders-banner',
  standalone: false,
  template: `<p *ngIf="open">{{ 'orders' | m15Shout }}</p>`,
})
class OrdersBanner {
  protected readonly open = true;
}

@NgModule({ declarations: [OrdersBanner], imports: [SharedModule] })
class OrdersViewModule {}

// Legacy: a root listed only in `bootstrap`, declared nowhere (C6 in the module plan).
@Component({ selector: 'lab-m15-bare-root', standalone: false, template: '<p>bare</p>' })
class BareRoot {}

@NgModule({ imports: [BrowserModule], bootstrap: [BareRoot] })
class BareModule {}

function rootWith(token: typeof SHARED_LOG, log: string[]): EnvironmentInjector {
  TestBed.configureTestingModule({ providers: [{ provide: token, useValue: log }] });
  return TestBed.inject(EnvironmentInjector);
}

describe('Section 5: legacy NgModule patterns', () => {
  it('Section 5: forRoot provides the configuration and forChild does not', () => {
    const root = TestBed.inject(EnvironmentInjector);
    const app = createEnvironmentInjector([importProvidersFrom(ApiModule.forRoot({ url: '/api' }))], root);
    const lazy = createEnvironmentInjector([importProvidersFrom(ApiModule.forChild())], root);

    expect(app.get(API_CONFIG)).toEqual({ url: '/api' });
    expect(() => lazy.get(API_CONFIG)).toThrowError(/NG0201/);
    // Both doors open the same module, so both bring its declarations.
    expect(ApiModule.forChild().ngModule).toBe(ApiModule.forRoot({ url: '/api' }).ngModule);
    app.destroy();
    lazy.destroy();
  });

  it('Section 5: a provider in a shared module gives each lazy injector its own instance', () => {
    const log: string[] = [];
    const root = rootWith(SHARED_LOG, log);
    // What two lazy-loaded modules did: each import builds its own environment injector.
    const orders = createEnvironmentInjector([importProvidersFrom(OrdersModule)], root);
    const billing = createEnvironmentInjector([importProvidersFrom(BillingModule)], root);

    const ordersLogger = orders.get(SharedLogger);
    const billingLogger = billing.get(SharedLogger);

    expect(billingLogger).not.toBe(ordersLogger);
    expect(orders.get(SharedLogger)).toBe(ordersLogger);
    expect(log.filter((e) => e === 'SharedLogger created').length).toBe(2);
    expect(log.filter((e) => e === 'SharedModule created').length).toBe(2);
    orders.destroy();
    billing.destroy();
  });

  it('Section 5: a module imported twice into one injector is created once', () => {
    const log: string[] = [];
    const root = rootWith(SHARED_LOG, log);
    // What an eager AppModule importing both features did: one injector.
    const app = createEnvironmentInjector([importProvidersFrom(OrdersModule, BillingModule)], root);

    app.get(SharedLogger);
    app.get(SharedLogger);

    expect(log).toEqual(['SharedModule created', 'SharedLogger created']);
    app.destroy();
  });

  it('Section 5: the CoreModule guard throws on a second import', () => {
    const log: string[] = [];
    const root = rootWith(CORE_LOG, log);
    const app = createEnvironmentInjector([importProvidersFrom(CoreModule)], root);

    expect(() => createEnvironmentInjector([importProvidersFrom(CoreModule)], app)).toThrowError(
      'CoreModule is already loaded. Import it only in the root module.',
    );
    expect(log).toEqual(['CoreModule created']);
    app.destroy();
  });

  it("Section 5: a re-exported module's declarations are usable by the importer", () => {
    TestBed.configureTestingModule({ imports: [OrdersViewModule] });
    const fixture = TestBed.createComponent(OrdersBanner);
    fixture.detectChanges();

    // *ngIf comes from CommonModule, which SharedModule re-exports; m15Shout is SharedModule's own.
    expect((fixture.nativeElement as HTMLElement).textContent?.trim()).toBe('ORDERS!');
  });

  describe('bootstrap-only root', () => {
    let moduleRef: NgModuleRef<BareModule> | undefined;

    afterEach(() => {
      moduleRef?.destroy();
      moduleRef = undefined;
      document.querySelectorAll('lab-m15-bare-root').forEach((host) => host.remove());
    });

    it('Section 5: a component listed only in bootstrap renders under bootstrapModule', async () => {
      const host = document.createElement('lab-m15-bare-root');
      document.body.appendChild(host);

      moduleRef = await platformBrowser().bootstrapModule(BareModule);

      expect(host.textContent).toBe('bare');
    });
  });
});
