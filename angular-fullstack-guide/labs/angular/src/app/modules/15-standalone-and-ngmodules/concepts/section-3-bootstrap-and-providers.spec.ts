import {
  ApplicationConfig,
  ApplicationRef,
  Component,
  createEnvironmentInjector,
  EnvironmentInjector,
  importProvidersFrom,
  inject,
  NgModuleRef,
} from '@angular/core';
import { bootstrapApplication, platformBrowser } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';
import { BOOT_GREETING } from '../legacy/boot/boot-root';
import { BootModule } from '../legacy/boot/boot.module';
import {
  ChartsModule,
  ChartSvc,
  REPORTS_CONFIG,
  REPORTS_LOG,
  ReportsModule,
} from '../legacy/boot/reports.module';

// A standalone root that uses what the NgModule library provides.
@Component({
  selector: 'lab-m15-report-title',
  template: '<h1>{{ config.title }} ({{ charts ? "charts ready" : "no charts" }})</h1>',
})
class ReportTitle {
  protected readonly config = inject(REPORTS_CONFIG);
  protected readonly charts = inject(ChartSvc);
}

// The standalone way: the library module is unwrapped into the application's providers.
const appConfig: ApplicationConfig = {
  providers: [importProvidersFrom(ReportsModule.forRoot({ title: 'Q3 report' }))],
};

@Component({ selector: 'lab-m15-not-a-module', template: '' })
class NotAModule {}

function addHost(tag: string): HTMLElement {
  const host = document.createElement(tag);
  document.body.appendChild(host);
  return host;
}

function childOfRoot(log: string[], ...sources: Parameters<typeof importProvidersFrom>) {
  TestBed.configureTestingModule({ providers: [{ provide: REPORTS_LOG, useValue: log }] });
  const root = TestBed.inject(EnvironmentInjector);
  return { root, child: createEnvironmentInjector([importProvidersFrom(...sources)], root) };
}

describe('Section 3: bootstrapping and providers without modules', () => {
  let moduleRef: NgModuleRef<BootModule> | undefined;
  let appRef: ApplicationRef | undefined;

  afterEach(() => {
    moduleRef?.destroy();
    appRef?.destroy();
    moduleRef = undefined;
    appRef = undefined;
    document.querySelectorAll('lab-m15-boot-root, lab-m15-report-title').forEach((host) => host.remove());
  });

  it('Section 3: bootstrapModule renders the bootstrap component of an NgModule', async () => {
    const host = addHost('lab-m15-boot-root');

    moduleRef = await platformBrowser().bootstrapModule(BootModule);

    expect(host.textContent).toBe('hello boot-svc');
    expect(moduleRef.instance).toBeInstanceOf(BootModule);
    // The module's injector is the application's root injector: ApplicationRef lives in it.
    expect(moduleRef.injector.get(ApplicationRef).components.length).toBe(1);
  });

  it('Section 3: bootstrapModule accepts applicationProviders', async () => {
    const host = addHost('lab-m15-boot-root');

    moduleRef = await platformBrowser().bootstrapModule(BootModule, {
      applicationProviders: [{ provide: BOOT_GREETING, useValue: 'hi' }],
    });

    expect(host.textContent).toBe('hi boot-svc');
    expect(moduleRef.injector.get(BOOT_GREETING)).toBe('hi');
  });

  it("Section 3: bootstrapApplication takes an NgModule library's providers through importProvidersFrom", async () => {
    const host = addHost('lab-m15-report-title');

    appRef = await bootstrapApplication(ReportTitle, appConfig);

    expect(host.textContent).toBe('Q3 report (charts ready)');
    expect(appRef.injector.get(ChartSvc)).toBeInstanceOf(ChartSvc);
  });

  it("Section 3: importProvidersFrom makes a module's providers available in an environment injector", () => {
    const { root, child } = childOfRoot([], ReportsModule.forRoot({ title: 'Q3 report' }));

    // forRoot's extra provider and the provider of the transitively imported ChartsModule.
    expect(child.get(REPORTS_CONFIG)).toEqual({ title: 'Q3 report' });
    expect(child.get(ChartSvc)).toBeInstanceOf(ChartSvc);
    expect(() => root.get(ChartSvc)).toThrowError(/NG0201/);
    child.destroy();
  });

  it('Section 3: importProvidersFrom creates the module instance when the injector is created and the service on first use', () => {
    const log: string[] = [];
    const { child } = childOfRoot(log, ReportsModule);

    log.push('injector created');
    const first = child.get(ChartSvc);
    const second = child.get(ChartSvc);

    expect(log).toEqual(['ChartsModule created', 'ReportsModule created', 'injector created', 'ChartSvc created']);
    expect(second).toBe(first);
    child.destroy();
  });

  it('Section 3: importProvidersFrom deduplicates a module imported twice in one call', () => {
    const log: string[] = [];
    // ChartsModule arrives directly and again through ReportsModule's imports.
    const { child } = childOfRoot(log, ReportsModule, ChartsModule);

    expect(log).toEqual(['ChartsModule created', 'ReportsModule created']);
    child.destroy();
  });

  it('Section 3: importProvidersFrom rejects a standalone component with NG0800', () => {
    expect(() => importProvidersFrom(NotAModule)).toThrowError(
      /NG0800: Importing providers supports NgModule or ModuleWithProviders but got a standalone component "_?NotAModule"/,
    );
  });
});
