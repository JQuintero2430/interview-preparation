import { ApplicationRef, Component, EnvironmentProviders, Provider, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  RouteReuseStrategy,
  Router,
  RouterOutlet,
  RouterPreloader,
  provideRouter,
  withAutoCleanupInjectors,
  withPreloading,
} from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { LabM24LoaderCounts, previewRoutes } from './app.routes';
import { LabM24Connection } from './connection';
import { LabM24FlagPreloading } from './flag-preloading';
import { LabM24KeepAliveReuse } from './keep-alive-reuse';
import { LabM24ListPage, LabM24ListState } from './list-page';

@Component({ selector: 'lab-m24-preview-root', imports: [RouterOutlet], template: '<router-outlet />' })
class LabM24PreviewRoot {}

/** A keep-alive strategy that does not report its stored handles to `withAutoCleanupInjectors()`. */
class LabM24SilentKeepAlive extends LabM24KeepAliveReuse {
  override retrieveStoredRouteHandles(): never[] {
    return [];
  }
}

/** A fake of the Network Information API: jsdom has no `navigator.connection`. */
function fakeConnection(saveData: boolean, effectiveType: string): LabM24Connection {
  const connection = new LabM24Connection();
  connection.saveData.set(saveData);
  connection.effectiveType.set(effectiveType);
  return connection;
}

/** Bootstraps `LabM24PreviewRoot` for real, which starts the router's preloader, and always cleans up. */
async function withBootstrappedApp(providers: (Provider | EnvironmentProviders)[], body: (router: Router) => Promise<void>): Promise<void> {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers });
  const host = document.createElement('div');
  document.body.appendChild(host);
  const appRef = TestBed.inject(ApplicationRef);
  const ref = appRef.bootstrap(LabM24PreviewRoot, host);
  try {
    await appRef.whenStable();
    await body(TestBed.inject(Router));
  } finally {
    ref.destroy();
    host.remove();
  }
}

const settle = () => new Promise<void>((resolve) => setTimeout(resolve));

/** Starts the router on the harness with a reuse strategy (or the default) and fresh counters. */
async function startReuse(strategy: Type<RouteReuseStrategy> | null, ...features: ReturnType<typeof withAutoCleanupInjectors>[]) {
  TestBed.resetTestingModule();
  const providers: (Provider | EnvironmentProviders)[] = [provideRouter(previewRoutes({ reports: 0, settings: 0 }), ...features)];
  if (strategy) {
    providers.push({ provide: RouteReuseStrategy, useClass: strategy });
  }
  TestBed.configureTestingModule({ providers });
  LabM24ListPage.built = LabM24ListPage.destroyed = 0;
  LabM24ListState.built = LabM24ListState.destroyed = 0;
  return { harness: await RouterTestingHarness.create(), strategy: TestBed.inject(RouteReuseStrategy) };
}

describe('E24.6 write a preloading strategy and a keep-alive route reuse strategy', () => {
  it('after bootstrap, flagged lazy routes load without a visit and unflagged ones do not', async () => {
    const counts: LabM24LoaderCounts = { reports: 0, settings: 0 };
    await withBootstrappedApp([provideRouter(previewRoutes(counts), withPreloading(LabM24FlagPreloading))], async (router) => {
      await vi.waitFor(() => expect(counts.reports).toBe(1));
      await settle();
      expect(counts.settings).toBe(0);
      expect(router.url).toBe('/');
    });
  });

  it('with `saveData` on or a `2g` connection, nothing preloads', async () => {
    for (const [saveData, effectiveType] of [[true, '4g'], [false, '2g']] as const) {
      const counts: LabM24LoaderCounts = { reports: 0, settings: 0 };
      const connection = fakeConnection(saveData, effectiveType);
      const providers = [
        provideRouter(previewRoutes(counts), withPreloading(LabM24FlagPreloading)),
        { provide: LabM24Connection, useValue: connection },
      ];
      await withBootstrappedApp(providers, async () => {
        await settle();
        expect(counts).toEqual({ reports: 0, settings: 0 });
        // The strategy reads the connection at each preload: relaxed, the same router now loads the flagged route.
        connection.saveData.set(false);
        connection.effectiveType.set('4g');
        await new Promise<void>((resolve) => TestBed.inject(RouterPreloader).preload().subscribe({ complete: resolve }));
        expect(counts).toEqual({ reports: 1, settings: 0 });
      });
    }
  });

  it('opening a detail and returning reattaches the same list instance', async () => {
    const { harness } = await startReuse(LabM24KeepAliveReuse);
    const first = await harness.navigateByUrl('/list', LabM24ListPage);
    await harness.navigateByUrl('/detail/1');
    expect(LabM24ListPage.destroyed).toBe(0);
    const again = await harness.navigateByUrl('/list', LabM24ListPage);
    expect(again).toBe(first);
    expect(LabM24ListPage.built).toBe(1);
  });

  it('a second keep-alive route replaces the first stored handle, and the first list is destroyed', async () => {
    const { harness, strategy } = await startReuse(LabM24KeepAliveReuse);
    await harness.navigateByUrl('/list', LabM24ListPage);
    await harness.navigateByUrl('/archive', LabM24ListPage);
    expect(LabM24ListPage.destroyed).toBe(0);
    await harness.navigateByUrl('/detail/1');
    expect(LabM24ListPage.built).toBe(2);
    expect(LabM24ListPage.destroyed).toBe(1);
    expect((strategy as LabM24KeepAliveReuse).retrieveStoredRouteHandles()).toHaveLength(1);
  });

  it('routes without `keepAlive` are recreated as with the default strategy', async () => {
    const counters: number[][] = [];
    for (const strategy of [LabM24KeepAliveReuse, null]) {
      const { harness } = await startReuse(strategy);
      const first = await harness.navigateByUrl('/recent', LabM24ListPage);
      await harness.navigateByUrl('/detail/1');
      expect(LabM24ListPage.destroyed).toBe(1);
      const again = await harness.navigateByUrl('/recent', LabM24ListPage);
      expect(again).not.toBe(first);
      counters.push([LabM24ListPage.built, LabM24ListPage.destroyed]);
    }
    expect(counters).toEqual([[2, 1], [2, 1]]);
  });

  it('with `withAutoCleanupInjectors()`, the route injector of a stored list survives while its handle is stored', async () => {
    // Probe, 2026-10-10: the state survives while the handle is stored and dies once the handle is replaced;
    // without `retrieveStoredRouteHandles` it dies while its list is still stored; without the feature it never dies.
    const { harness } = await startReuse(LabM24KeepAliveReuse, withAutoCleanupInjectors());
    const first = await harness.navigateByUrl('/list', LabM24ListPage);
    await harness.navigateByUrl('/detail/1');
    expect(LabM24ListState.destroyed).toBe(0);
    const again = await harness.navigateByUrl('/list', LabM24ListPage);
    expect(again).toBe(first);
    expect(LabM24ListState.destroyed).toBe(0);
    await harness.navigateByUrl('/archive', LabM24ListPage);
    await harness.navigateByUrl('/detail/1');
    expect(LabM24ListState.destroyed).toBe(1);

    const silent = await startReuse(LabM24SilentKeepAlive, withAutoCleanupInjectors());
    await silent.harness.navigateByUrl('/list', LabM24ListPage);
    await silent.harness.navigateByUrl('/detail/1');
    expect(LabM24ListState.destroyed).toBe(1);
    expect(LabM24ListPage.destroyed).toBe(0);

    const plain = await startReuse(LabM24KeepAliveReuse);
    await plain.harness.navigateByUrl('/list', LabM24ListPage);
    await plain.harness.navigateByUrl('/archive', LabM24ListPage);
    await plain.harness.navigateByUrl('/detail/1');
    expect(LabM24ListState.destroyed).toBe(0);
  });
});
