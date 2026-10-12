import { Location } from '@angular/common';
import { Component, Injectable, OnDestroy, Provider, effect, inject, input, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  ActivationEnd,
  ActivationStart,
  BaseRouteReuseStrategy,
  CanActivateChildFn,
  CanActivateFn,
  CanDeactivateFn,
  CanMatchFn,
  ChildActivationEnd,
  ChildActivationStart,
  DetachedRouteHandle,
  GuardsCheckEnd,
  GuardsCheckStart,
  NavigationCancel,
  NavigationCancellationCode,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  RedirectCommand,
  ResolveEnd,
  ResolveFn,
  ResolveStart,
  Route,
  RouteConfigLoadEnd,
  RouteConfigLoadStart,
  RouteReuseStrategy,
  RouterStateSnapshot,
  TitleStrategy,
  RoutesRecognized,
  Router,
  RouterOutlet,
  Routes,
  UrlSegment,
  provideRouter,
  withAutoCleanupInjectors,
  withComponentInputBinding,
  withNavigationErrorHandler,
  withRouterConfig,
} from '@angular/router';
import { By, Title } from '@angular/platform-browser';
import { RouterTestingHarness } from '@angular/router/testing';
import { EMPTY, filter, firstValueFrom, map, of, throwError, timer } from 'rxjs';

@Component({ selector: 'lab-m24-home', template: 'home' })
class LabM24Home {}

@Component({ selector: 'lab-m24-not-found', template: 'not-found' })
class LabM24NotFound {}

@Component({ selector: 'lab-m24-manual', template: 'manual' })
class LabM24Manual {}

@Component({ selector: 'lab-m24-team', template: 'team' })
class LabM24Team {}

@Component({ selector: 'lab-m24-inputs', template: 'inputs' })
class LabM24Inputs {
  readonly id = input<string>();
  readonly q = input<string>();
  readonly kind = input<string>();
  readonly user = input<string>();
  readonly withDefault = input<string>('default');
}

@Component({ selector: 'lab-m24-page', template: 'page' })
class LabM24Page {}

@Component({ selector: 'lab-m24-shell', imports: [RouterOutlet], template: '<router-outlet />' })
class LabM24Shell {}

@Component({ selector: 'lab-m24-inbox', template: 'inbox' })
class LabM24Inbox {}

@Component({ selector: 'lab-m24-sent', template: 'sent' })
class LabM24Sent {}

@Component({ selector: 'lab-m24-compose', template: 'compose' })
class LabM24Compose {}

@Component({
  selector: 'lab-m24-mail-shell',
  imports: [RouterOutlet],
  template: '<main><router-outlet /></main><aside><router-outlet name="popup" /></aside>',
})
class LabM24MailShell {}

@Component({ selector: 'lab-m24-draft', template: 'draft' })
class LabM24Draft {
  readonly dirty = signal(false);

  constructor() {
    // The listener exists only while the form is dirty; the cleanup removes it.
    effect((onCleanup) => {
      if (this.dirty()) {
        const warn = (event: BeforeUnloadEvent) => event.preventDefault();
        window.addEventListener('beforeunload', warn);
        onCleanup(() => window.removeEventListener('beforeunload', warn));
      }
    });
  }
}

@Component({ selector: 'lab-m24-lazy-page', template: 'lazy' })
class LabM24LazyPage {}

/** A route-level service that counts its builds and destroys. */
@Injectable()
class LabM24RouteService implements OnDestroy {
  static built = 0;
  static destroyed = 0;
  constructor() {
    LabM24RouteService.built++;
  }
  ngOnDestroy(): void {
    LabM24RouteService.destroyed++;
  }
}

@Component({ selector: 'lab-m24-uses-service', template: 'feature' })
class LabM24UsesService {
  protected readonly service = inject(LabM24RouteService);
}

@Component({ selector: 'lab-m24-other', template: 'other' })
class LabM24Other {}

/** A routed component that numbers its instances and counts the ones destroyed. */
@Component({ selector: 'lab-m24-counted', template: 'counted' })
class LabM24Counted implements OnDestroy {
  static built = 0;
  static destroyed = 0;
  readonly id = ++LabM24Counted.built;

  ngOnDestroy(): void {
    LabM24Counted.destroyed++;
  }
}

/** Keeps the routes flagged `data: { keep: true }` in a map while the user is away. */
@Injectable()
class LabM24KeepAlive extends BaseRouteReuseStrategy {
  readonly stored = new Map<Route, DetachedRouteHandle>();

  override shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return route.data['keep'] === true;
  }

  override store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
    if (!route.routeConfig) {
      return;
    }
    if (handle) {
      this.stored.set(route.routeConfig, handle);
    } else {
      this.stored.delete(route.routeConfig);
    }
  }

  override shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return !!route.routeConfig && this.stored.has(route.routeConfig);
  }

  override retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    return (route.routeConfig && this.stored.get(route.routeConfig)) || null;
  }
}

/** A `loadChildren` loader that counts its calls. */
function countingChildren(counter: { calls: number }): () => Promise<Routes> {
  return async () => {
    counter.calls++;
    return [{ path: '', component: LabM24LazyPage }];
  };
}

const eventNames: [abstract new (...args: never[]) => unknown, string][] = [
  [NavigationStart, 'NavigationStart'],
  [RouteConfigLoadStart, 'RouteConfigLoadStart'],
  [RouteConfigLoadEnd, 'RouteConfigLoadEnd'],
  [RoutesRecognized, 'RoutesRecognized'],
  [GuardsCheckStart, 'GuardsCheckStart'],
  [ChildActivationStart, 'ChildActivationStart'],
  [ActivationStart, 'ActivationStart'],
  [GuardsCheckEnd, 'GuardsCheckEnd'],
  [ResolveStart, 'ResolveStart'],
  [ResolveEnd, 'ResolveEnd'],
  [ActivationEnd, 'ActivationEnd'],
  [ChildActivationEnd, 'ChildActivationEnd'],
  [NavigationEnd, 'NavigationEnd'],
];

/** The names of the recorded router events, by class. */
function names(events: unknown[]): string[] {
  return events.map((e) => eventNames.find(([type]) => e instanceof type)?.[1] ?? 'other');
}

/** A fresh router with its events recorded. */
async function record(routes: Routes, ...features: Parameters<typeof provideRouter>[1][]) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: [provideRouter(routes, ...features)] });
  const harness = await RouterTestingHarness.create();
  const router = TestBed.inject(Router);
  const events: unknown[] = [];
  router.events.subscribe((e) => events.push(e));
  return { harness, router, events };
}

/** Navigates to each URL in turn and returns the inputs of the one routed component after each. */
async function bindAcross(routes: Routes, urls: string[], ...features: Parameters<typeof provideRouter>[1][]) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: [provideRouter(routes, ...features)] });
  const harness = await RouterTestingHarness.create();
  const seen: Record<string, string | undefined>[] = [];
  let first: LabM24Inputs | undefined;
  for (const url of urls) {
    const component = await harness.navigateByUrl(url, LabM24Inputs);
    await harness.fixture.whenStable();
    first ??= component;
    seen.push({
      id: component.id(),
      q: component.q(),
      kind: component.kind(),
      user: component.user(),
      withDefault: component.withDefault(),
      sameInstance: String(component === first),
    });
  }
  return seen;
}

/** The params and data of the deepest activated route after navigating to `url`. */
async function leafAt(routes: Routes, url: string, ...features: Parameters<typeof provideRouter>[1][]) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: [provideRouter(routes, ...features)] });
  const harness = await RouterTestingHarness.create();
  await harness.navigateByUrl(url);
  let snapshot: ActivatedRouteSnapshot = TestBed.inject(Router).routerState.snapshot.root;
  while (snapshot.firstChild) {
    snapshot = snapshot.firstChild;
  }
  return { params: snapshot.params, data: snapshot.data };
}

/** Opens each URL on a fresh router and returns the final URL and the routed text. */
async function open(routes: Routes, url: string): Promise<{ url: string; text: string }> {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
  const harness = await RouterTestingHarness.create();
  await harness.navigateByUrl(url);
  harness.detectChanges();
  return { url: TestBed.inject(Router).url, text: harness.routeNativeElement?.textContent ?? '' };
}

/** Formats every title as `Shop | <title>`, and falls back to `Shop` when the branch has none (Q24.31). */
@Injectable({ providedIn: 'root' })
class LabM24ShopTitle extends TitleStrategy {
  private readonly title = inject(Title);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const built = this.buildTitle(snapshot);
    this.title.setTitle(built ? `Shop | ${built}` : 'Shop');
  }
}

const titledRoutes: Routes = [
  { path: 'home', title: 'Home', component: LabM24Page },
  { path: 'u/:id', title: (route: ActivatedRouteSnapshot) => `User ${route.params['id']}`, component: LabM24Page },
  {
    path: 'p',
    title: 'Parent',
    children: [
      { path: 'c', title: 'Child', component: LabM24Page },
      { path: 'n', component: LabM24Page },
    ],
  },
  { path: 'plain', component: LabM24Page },
];

async function titlesAfter(urls: string[], ...extra: Provider[]): Promise<string[]> {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: [provideRouter(titledRoutes), ...extra] });
  const harness = await RouterTestingHarness.create();
  const seen: string[] = [];
  for (const url of urls) {
    await harness.navigateByUrl(url);
    seen.push(TestBed.inject(Title).getTitle());
  }
  return seen;
}

describe('Q24 outputs', () => {
  it('Q24.02 with pathMatch full the table sends / to /home and renders not-found for /home/extra', async () => {
    const routes: Routes = [
      { path: '', pathMatch: 'full', redirectTo: 'home' },
      { path: 'home', component: LabM24Home },
      { path: '**', component: LabM24NotFound },
    ];
    expect(await open(routes, '/')).toEqual({ url: '/home', text: 'home' });
    expect(await open(routes, '/home/extra')).toEqual({ url: '/home/extra', text: 'not-found' });
  });

  it('Q24.02 an empty-path redirect without pathMatch throws NG04014 when the router is created', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: '', redirectTo: 'home' }, { path: '**', component: LabM24NotFound }])],
    });
    let message = '';
    try {
      TestBed.inject(Router);
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toContain('NG04014');
    expect(message).toContain(`Invalid configuration of route '{path: "", redirectTo: "home"}'`);
    expect(message).toContain(`please provide 'pathMatch'`);
  });

  it('Q24.02 without a wildcard an unknown URL rejects with NG04002', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [provideRouter([{ path: 'home', component: LabM24Home }])] });
    const harness = await RouterTestingHarness.create();
    let message = '';
    try {
      await harness.navigateByUrl('/nope');
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toContain('NG04002');
  });

  it('Q24.03 prefix keeps the rest of the URL and full refuses it; a string redirect keeps query and fragment, a function result does not', async () => {
    const prefix: Routes = [
      { path: 'docs', redirectTo: 'manual' },
      { path: 'manual', component: LabM24Manual },
      { path: '**', component: LabM24NotFound },
    ];
    const full: Routes = [{ ...prefix[0], pathMatch: 'full' }, prefix[1], prefix[2]];
    expect(await open(prefix, '/docs/intro')).toEqual({ url: '/manual/intro', text: 'not-found' });
    expect(await open(full, '/docs/intro')).toEqual({ url: '/docs/intro', text: 'not-found' });
    expect((await open(full, '/docs')).url).toBe('/manual');

    const team: Routes = [{ path: 'team', component: LabM24Team }];
    const asString: Routes = [{ path: 'old', redirectTo: 'team' }, ...team];
    const asFunction: Routes = [{ path: 'old', redirectTo: () => '/team' }, ...team];
    const asTree: Routes = [
      { path: 'old', redirectTo: ({ queryParams }) => inject(Router).createUrlTree(['/team'], { queryParams }) },
      ...team,
    ];
    expect((await open(asString, '/old?x=1#top')).url).toBe('/team?x=1#top');
    expect((await open(asFunction, '/old?x=1#top')).url).toBe('/team');
    expect((await open(asTree, '/old?x=1#top')).url).toBe('/team?x=1');
  });

  it('Q24.06 one key in the path, matrix, query, data and a resolver binds the data value; a vanished key binds undefined over the default', async () => {
    const withData: Routes = [
      {
        path: 'u/:id',
        component: LabM24Inputs,
        data: { kind: 'static', id: 'fromData' },
        resolve: { user: () => 'resolved-user' },
      },
    ];
    const [all] = await bindAcross(withData, ['/u/42;id=matrix?q=hello&id=query'], withComponentInputBinding());
    expect(all).toMatchObject({ id: 'fromData', q: 'hello', kind: 'static', user: 'resolved-user' });

    const plain: Routes = [{ path: 'u/:id', component: LabM24Inputs }];
    const [matrix] = await bindAcross(plain, ['/u/42;id=matrix?id=query&q=hello'], withComponentInputBinding());
    expect(matrix).toMatchObject({ id: 'matrix', q: 'hello' });

    const [first, second] = await bindAcross(plain, ['/u/42?q=hello', '/u/43'], withComponentInputBinding());
    expect(first).toMatchObject({ id: '42', q: 'hello', withDefault: undefined, sameInstance: 'true' });
    expect(second).toMatchObject({ id: '43', q: undefined, withDefault: undefined, sameInstance: 'true' });

    const [options] = await bindAcross(
      plain,
      ['/u/1?q=hello'],
      withComponentInputBinding({ queryParams: false, unmatchedInputBehavior: 'undefinedIfStale' }),
    );
    expect(options).toMatchObject({ id: '1', q: undefined, withDefault: 'default' });
  });

  it('Q24.07 a component parent passes params and data under always and not under emptyOnly; a componentless parent passes them under both', async () => {
    const team = (parentComponent: boolean): Routes => [
      {
        path: 'team/:id',
        ...(parentComponent ? { component: LabM24Shell } : {}),
        data: { d: 'parent' },
        children: [{ path: 'member/:mid', component: LabM24Page }],
      },
    ];
    const emptyOnly = withRouterConfig({ paramsInheritanceStrategy: 'emptyOnly' });
    expect(await leafAt(team(true), '/team/5/member/9')).toEqual({
      params: { id: '5', mid: '9' },
      data: { d: 'parent' },
    });
    expect(await leafAt(team(true), '/team/5/member/9', emptyOnly)).toEqual({ params: { mid: '9' }, data: {} });
    for (const features of [[], [emptyOnly]]) {
      expect(await leafAt(team(false), '/team/5/member/9', ...features)).toEqual({
        params: { id: '5', mid: '9' },
        data: { d: 'parent' },
      });
    }
  });

  it('Q24.10 an outlets command opens the popup as (popup:compose), null closes it, and a primary navigation keeps it', async () => {
    TestBed.resetTestingModule();
    const routes: Routes = [
      {
        path: '',
        component: LabM24MailShell,
        children: [
          { path: 'inbox', component: LabM24Inbox },
          { path: 'sent', component: LabM24Sent },
          { path: 'compose', component: LabM24Compose, outlet: 'popup' },
        ],
      },
    ];
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    const harness = await RouterTestingHarness.create();
    const router = TestBed.inject(Router);
    const shown = () => {
      harness.detectChanges();
      return harness.routeNativeElement?.textContent;
    };
    await harness.navigateByUrl('/inbox');
    expect([router.url, shown()]).toEqual(['/inbox', 'inbox']);
    expect(await router.navigate([{ outlets: { popup: ['compose'] } }])).toBe(true);
    expect([router.url, shown()]).toEqual(['/inbox(popup:compose)', 'inboxcompose']);
    await harness.navigateByUrl('/sent(popup:compose)');
    expect(router.url).toBe('/sent(popup:compose)');
    expect(await router.navigate([{ outlets: { popup: null } }])).toBe(true);
    expect([router.url, shown()]).toEqual(['/sent', 'sent']);
  });
  it('Q24.11 the compose panel is one component instance while the primary outlet navigates, a deep link opens both, and a plain primary URL closes it', async () => {
    TestBed.resetTestingModule();
    const routes: Routes = [
      {
        path: '',
        component: LabM24MailShell,
        children: [
          { path: 'inbox', component: LabM24Inbox },
          { path: 'sent', component: LabM24Sent },
          { path: 'compose', component: LabM24Compose, outlet: 'popup' },
        ],
      },
    ];
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    const harness = await RouterTestingHarness.create();
    const router = TestBed.inject(Router);
    const panel = () => {
      harness.detectChanges();
      return harness.fixture.debugElement.query(By.directive(LabM24Compose))?.componentInstance as LabM24Compose | undefined;
    };
    const text = (selector: string) => harness.routeNativeElement?.querySelector(selector)?.textContent;
    await harness.navigateByUrl('/inbox(popup:compose)');
    const opened = panel();
    expect([router.url, text('main'), text('aside')]).toEqual(['/inbox(popup:compose)', 'inbox', 'compose']);
    await router.navigate([{ outlets: { primary: ['sent'] } }]);
    expect([router.url, text('main'), text('aside')]).toEqual(['/sent(popup:compose)', 'sent', 'compose']);
    expect(opened).toBeDefined();
    expect(panel()).toBe(opened);
    await harness.navigateByUrl('/inbox');
    expect([router.url, text('main'), text('aside'), panel()]).toEqual(['/inbox', 'inbox', '', undefined]);
  });

  it('Q24.12 a loadChildren loader runs once across three visits; a refusing canMatch keeps it at zero and lands on the wildcard', async () => {
    const counter = { calls: 0 };
    const { harness, events } = await record([
      { path: '', component: LabM24Home },
      { path: 'lazy', loadChildren: countingChildren(counter) },
    ]);
    expect(counter.calls).toBe(0);
    await harness.navigateByUrl('/lazy');
    expect(counter.calls).toBe(1);
    expect(names(events)).toEqual([
      'NavigationStart',
      'RouteConfigLoadStart',
      'RouteConfigLoadEnd',
      'RoutesRecognized',
      'GuardsCheckStart',
      'ChildActivationStart',
      'ActivationStart',
      'ChildActivationStart',
      'ActivationStart',
      'GuardsCheckEnd',
      'ResolveStart',
      'ResolveEnd',
      'ActivationEnd',
      'ChildActivationEnd',
      'ActivationEnd',
      'ChildActivationEnd',
      'NavigationEnd',
    ]);
    await harness.navigateByUrl('/');
    events.length = 0;
    await harness.navigateByUrl('/lazy');
    expect(counter.calls).toBe(1);
    expect(names(events)).not.toContain('RouteConfigLoadStart');

    const refused = { calls: 0 };
    const deny: CanMatchFn = () => false;
    const blocked = await record([
      { path: '', component: LabM24Home },
      { path: 'admin', canMatch: [deny], loadChildren: countingChildren(refused) },
      { path: '**', component: LabM24NotFound },
    ]);
    await blocked.harness.navigateByUrl('/admin');
    expect(refused.calls).toBe(0);
    expect(blocked.router.url).toBe('/admin');
    expect(blocked.harness.routeNativeElement?.textContent).toBe('not-found');
    expect(names(blocked.events)).not.toContain('RouteConfigLoadStart');
  });

  it('Q24.13 a route-provided service outlives its route by default and is destroyed after leaving with withAutoCleanupInjectors', async () => {
    const routes: Routes = [
      { path: '', component: LabM24Home },
      { path: 'f', providers: [LabM24RouteService], component: LabM24UsesService },
    ];
    const counts = () => `built ${LabM24RouteService.built}, destroyed ${LabM24RouteService.destroyed}`;
    const instances = new Set<LabM24UsesService>();

    LabM24RouteService.built = 0;
    LabM24RouteService.destroyed = 0;
    const plain = await record(routes);
    instances.add(await plain.harness.navigateByUrl('/f', LabM24UsesService));
    await plain.harness.navigateByUrl('/');
    expect(counts()).toBe('built 1, destroyed 0');
    instances.add(await plain.harness.navigateByUrl('/f', LabM24UsesService));
    expect(counts()).toBe('built 1, destroyed 0');
    const sameService = (a: LabM24UsesService, b: LabM24UsesService) =>
      (a as unknown as { service: unknown }).service === (b as unknown as { service: unknown }).service;
    const [first, second] = [...instances];
    expect(sameService(first, second)).toBe(true);

    LabM24RouteService.built = 0;
    LabM24RouteService.destroyed = 0;
    const cleaned = await record(routes, withAutoCleanupInjectors());
    await cleaned.harness.navigateByUrl('/f');
    await cleaned.harness.navigateByUrl('/');
    expect(counts()).toBe('built 1, destroyed 1');
    await cleaned.harness.navigateByUrl('/f');
    expect(counts()).toBe('built 2, destroyed 1');
  });

  it('Q24.15 two canMatch routes, parent and child guards and resolvers run in a fixed order, and canDeactivate runs before the next canActivate', async () => {
    const log: string[] = [];
    let matched: string[] = [];
    const matchNo: CanMatchFn = () => {
      log.push('canMatch:admin-a');
      return false;
    };
    const matchYes: CanMatchFn = (_route, segments: UrlSegment[]) => {
      log.push('canMatch:admin-b');
      matched = segments.map((s) => s.path);
      return true;
    };
    const activate =
      (name: string): CanActivateFn =>
      () => {
        log.push(name);
        return true;
      };
    const activateChild: CanActivateChildFn = () => {
      log.push('canActivateChild');
      return true;
    };
    const leave: CanDeactivateFn<LabM24Page> = () => {
      log.push('canDeactivate:child');
      return true;
    };
    const resolver =
      (name: string): ResolveFn<string> =>
      () => {
        log.push(name);
        return name;
      };
    const { harness } = await record([
      { path: 'admin', canMatch: [matchNo], component: LabM24Page },
      {
        path: 'admin',
        canMatch: [matchYes],
        canActivate: [activate('canActivate:parent')],
        canActivateChild: [activateChild],
        resolve: { parent: resolver('resolve:parent') },
        children: [
          {
            path: ':id',
            canActivate: [activate('canActivate:child')],
            canDeactivate: [leave],
            resolve: { child: resolver('resolve:child') },
            component: LabM24Page,
          },
        ],
      },
      { path: 'other', canActivate: [activate('canActivate:other')], component: LabM24Page },
    ]);
    await harness.navigateByUrl('/admin/3');
    expect(log).toEqual([
      'canMatch:admin-a',
      'canMatch:admin-b',
      'canActivate:parent',
      'canActivateChild',
      'canActivate:child',
      'resolve:parent',
      'resolve:child',
    ]);
    expect(matched).toEqual(['admin', '3']);
    log.length = 0;
    await harness.navigateByUrl('/other');
    expect(log).toEqual(['canDeactivate:child', 'canActivate:other']);
  });

  it('Q24.16 false cancels with code 3 and resolves false; a UrlTree, a RedirectCommand and a thrown RedirectCommand cancel with code 0 and resolve true after a second navigation', async () => {
    const kinds = (events: unknown[]) =>
      events.flatMap((e) =>
        e instanceof NavigationStart ? ['start'] : e instanceof NavigationCancel ? [`cancel:${e.code}`] : e instanceof NavigationEnd ? ['end'] : [],
      );
    const login = (query: string) => inject(Router).parseUrl(`/login?r=${query}`);
    const { harness, router, events } = await record([
      { path: '', component: LabM24Home },
      { path: 'login', component: LabM24Manual },
      { path: 'no', canActivate: [() => false], component: LabM24Page },
      { path: 'tree', canActivate: [() => login('tree')], component: LabM24Page },
      { path: 'command', canActivate: [() => new RedirectCommand(login('cmd'), { skipLocationChange: true })], component: LabM24Page },
      {
        path: 'thrown',
        canActivate: [
          () => {
            throw new RedirectCommand(login('thrown'));
          },
        ],
        component: LabM24Page,
      },
    ]);
    await harness.navigateByUrl('/');
    const run = async (url: string) => {
      events.length = 0;
      const resolved = await router.navigateByUrl(url);
      return [resolved, router.url, kinds(events)];
    };
    expect(await run('/no')).toEqual([false, '/', ['start', 'cancel:3']]);
    const redirected = ['start', 'cancel:0', 'start', 'end'];
    expect(await run('/tree')).toEqual([true, '/login?r=tree', redirected]);
    expect(await run('/command')).toEqual([true, '/login?r=cmd', redirected]);
    expect(await run('/thrown')).toEqual([true, '/login?r=thrown', redirected]);
  });

  it('Q24.18 in one canActivate array the first non-true result in array order wins, whichever guard is faster', async () => {
    const slow =
      (value: boolean): CanActivateFn =>
      () =>
        timer(30).pipe(map(() => value));
    const toLogin: CanActivateFn = () => inject(Router).parseUrl('/login');
    const { harness, router } = await record([
      { path: '', component: LabM24Home },
      { path: 'login', component: LabM24Manual },
      { path: 'slow-no-first', canActivate: [slow(false), toLogin], component: LabM24Page },
      { path: 'slow-yes-first', canActivate: [slow(true), toLogin], component: LabM24Page },
      { path: 'redirect-first', canActivate: [toLogin, slow(false)], component: LabM24Page },
    ]);
    const run = async (url: string) => {
      await harness.navigateByUrl('/');
      return [await router.navigateByUrl(url), router.url];
    };
    expect(await run('/slow-no-first')).toEqual([false, '/']);
    expect(await run('/slow-yes-first')).toEqual([true, '/login']);
    expect(await run('/redirect-first')).toEqual([true, '/login']);
  });

  it('Q24.19 a guard that reads localStorage admits whoever writes the value there', async () => {
    const isAdmin: CanActivateFn = () => localStorage.getItem('role') === 'admin';
    const { harness, router } = await record([
      { path: '', component: LabM24Home },
      { path: 'admin', canActivate: [isAdmin], component: LabM24Page },
    ]);
    try {
      await harness.navigateByUrl('/');
      expect([await router.navigateByUrl('/admin'), router.url]).toEqual([false, '/']);
      localStorage.setItem('role', 'admin');
      expect([await router.navigateByUrl('/admin'), router.url]).toEqual([true, '/admin']);
    } finally {
      localStorage.removeItem('role');
    }
  });

  it('Q24.20 canDeactivate refuses an in-app link and a history back with GuardRejected and keeps the URL, until the form is clean', async () => {
    const unsaved: CanDeactivateFn<LabM24Draft> = (draft) => !draft.dirty();
    const { harness, router, events } = await record([
      { path: '', component: LabM24Home },
      { path: 'edit', canDeactivate: [unsaved], component: LabM24Draft },
    ]);
    const location = TestBed.inject(Location);
    router.initialNavigation(); // starts the listener that turns a popstate into a navigation
    await harness.navigateByUrl('/');
    const draft = await harness.navigateByUrl('/edit', LabM24Draft);
    draft.dirty.set(true);
    expect(await router.navigateByUrl('/')).toBe(false);
    expect([router.url, location.path()]).toEqual(['/edit', '/edit']);

    events.length = 0;
    const cancelled = firstValueFrom(router.events.pipe(filter((e) => e instanceof NavigationCancel)));
    location.back();
    await cancelled;
    expect(events.filter((e) => e instanceof NavigationCancel).map((e) => (e as NavigationCancel).code)).toEqual([
      NavigationCancellationCode.GuardRejected,
    ]);
    expect([router.url, location.path()]).toEqual(['/edit', '/edit']);

    draft.dirty.set(false);
    expect(await router.navigateByUrl('/')).toBe(true);
    expect(router.url).toBe('/');
  });

  it('Q24.20 a beforeunload listener that exists only while the form is dirty prevents the default of that event', async () => {
    const { harness } = await record([{ path: 'edit', component: LabM24Draft }]);
    const draft = await harness.navigateByUrl('/edit', LabM24Draft);
    const fire = () => {
      const event = new Event('beforeunload', { cancelable: true });
      window.dispatchEvent(event);
      return event.defaultPrevented;
    };
    const seen: boolean[] = [];
    harness.detectChanges();
    seen.push(fire());
    draft.dirty.set(true);
    harness.detectChanges();
    seen.push(fire());
    draft.dirty.set(false);
    harness.detectChanges();
    seen.push(fire());
    draft.dirty.set(true);
    harness.detectChanges();
    TestBed.resetTestingModule();
    seen.push(fire());
    expect(seen).toEqual([false, true, false, false]);
  });

  it('Q24.21 a resolver that completes empty cancels with code 2, one that throws rejects, of(1, 2, 3) keeps the first value and a RedirectCommand redirects; an error handler turns the throw into a redirect', async () => {
    const kinds = (events: unknown[]) =>
      events.flatMap((e) =>
        e instanceof NavigationStart
          ? ['start']
          : e instanceof NavigationCancel
            ? [`cancel:${e.code}`]
            : e instanceof NavigationError
              ? ['error']
              : e instanceof NavigationEnd
                ? ['end']
                : [],
      );
    const routes: Routes = [
      { path: '', component: LabM24Home },
      { path: 'login', component: LabM24Manual },
      { path: 'error', component: LabM24NotFound },
      { path: 'empty', resolve: { x: () => EMPTY }, component: LabM24Page },
      { path: 'boom', resolve: { x: () => throwError(() => new Error('boom')) }, component: LabM24Page },
      { path: 'many', resolve: { x: () => of(1, 2, 3) }, component: LabM24Page },
      { path: 'redirect', resolve: { x: () => new RedirectCommand(inject(Router).parseUrl('/login')) }, component: LabM24Page },
    ];
    const { harness, router, events } = await record(routes);
    await harness.navigateByUrl('/');
    const run = async (url: string) => {
      events.length = 0;
      const outcome = await router.navigateByUrl(url).then(
        (resolved) => resolved,
        (error: Error) => `rejected: ${error.message}`,
      );
      return [outcome, router.url, kinds(events)];
    };
    expect(await run('/empty')).toEqual([false, '/', ['start', 'cancel:2']]);
    const reason = events.find((e) => e instanceof NavigationCancel) as NavigationCancel;
    expect(reason.code).toBe(NavigationCancellationCode.NoDataFromResolver);
    expect(await run('/boom')).toEqual(['rejected: boom', '/', ['start', 'error']]);
    expect(await run('/many')).toEqual([true, '/many', ['start', 'end']]);
    expect(router.routerState.snapshot.root.firstChild?.data).toEqual({ x: 1 });
    expect(await run('/redirect')).toEqual([true, '/login', ['start', 'cancel:0', 'start', 'end']]);

    const handled = await record(routes, withNavigationErrorHandler(() => new RedirectCommand(inject(Router).parseUrl('/error'))));
    await handled.harness.navigateByUrl('/');
    handled.events.length = 0;
    const resolved = await handled.router.navigateByUrl('/boom');
    expect([resolved, handled.router.url, kinds(handled.events)]).toEqual([true, '/error', ['start', 'cancel:0', 'start', 'end']]);
  });

  it('Q24.24 one successful navigation to /admin/3 emits fifteen events, the activation pairs once per route', async () => {
    const { router, events } = await record([
      { path: 'admin', component: LabM24Shell, children: [{ path: ':id', component: LabM24Page }] },
    ]);
    expect(await router.navigateByUrl('/admin/3')).toBe(true);
    expect(names(events)).toEqual([
      'NavigationStart',
      'RoutesRecognized',
      'GuardsCheckStart',
      'ChildActivationStart',
      'ActivationStart',
      'ChildActivationStart',
      'ActivationStart',
      'GuardsCheckEnd',
      'ResolveStart',
      'ResolveEnd',
      'ActivationEnd',
      'ChildActivationEnd',
      'ActivationEnd',
      'ChildActivationEnd',
      'NavigationEnd',
    ]);
    expect(events).toHaveLength(15);
  });

  it('Q24.25 a second navigation supersedes the first (false, then true, code 1), abort() cancels with code 4, and currentNavigation is null afterwards', async () => {
    const slowGuard: CanActivateFn = () => timer(30).pipe(map(() => true));
    const kinds = (events: unknown[]) =>
      events.flatMap((e) =>
        e instanceof NavigationStart ? ['start'] : e instanceof NavigationCancel ? [`cancel:${e.code}`] : e instanceof NavigationEnd ? ['end'] : [],
      );
    let open!: (value: boolean) => void;
    const gate = new Promise<boolean>((resolve) => (open = resolve));
    const { router, events } = await record([
      { path: 'slow', canActivate: [slowGuard], component: LabM24Page },
      { path: 'fast', component: LabM24Home },
      { path: 'held', canActivate: [() => gate], component: LabM24Page },
    ]);

    const results = await Promise.all([router.navigateByUrl('/slow'), router.navigateByUrl('/fast')]);
    expect(results).toEqual([false, true]);
    expect(router.url).toBe('/fast');
    expect(kinds(events)).toEqual(['start', 'cancel:1', 'start', 'end']);
    const superseded = events.find((e) => e instanceof NavigationCancel) as NavigationCancel;
    expect(superseded.reason).toBe('Navigation ID 1 is not equal to the current navigation id 2');

    events.length = 0;
    const held = router.navigateByUrl('/held');
    expect(router.currentNavigation()?.extractedUrl.toString()).toBe('/held');
    router.currentNavigation()?.abort();
    expect(await held).toBe(false);
    open(true);
    expect(router.url).toBe('/fast');
    expect(kinds(events)).toEqual(['start', 'cancel:4']);
    const aborted = events.find((e) => e instanceof NavigationCancel) as NavigationCancel;
    expect(aborted.reason).toBe('AbortError: This operation was aborted');
    expect(router.currentNavigation()).toBeNull();
  });

  it('Q24.29 by default /c/1, /c/2, /x, /c/1 renders instances 1, 1, 2 and destroys one; a detaching strategy renders 1, 1, 1, the same instance, and destroys none', async () => {
    const visit = async (...extra: Provider[]) => {
      TestBed.resetTestingModule();
      LabM24Counted.built = 0;
      LabM24Counted.destroyed = 0;
      TestBed.configureTestingModule({
        providers: [
          provideRouter([
            { path: 'c/:id', data: { keep: true }, component: LabM24Counted },
            { path: 'x', component: LabM24Other },
          ]),
          ...extra,
        ],
      });
      const harness = await RouterTestingHarness.create();
      const first = await harness.navigateByUrl('/c/1', LabM24Counted);
      const second = await harness.navigateByUrl('/c/2', LabM24Counted);
      await harness.navigateByUrl('/x', LabM24Other);
      const third = await harness.navigateByUrl('/c/1', LabM24Counted);
      return { ids: [first.id, second.id, third.id], sameAsFirst: third === first, destroyed: LabM24Counted.destroyed };
    };

    expect(await visit()).toEqual({ ids: [1, 1, 2], sameAsFirst: false, destroyed: 1 });
    expect(await visit({ provide: RouteReuseStrategy, useClass: LabM24KeepAlive })).toEqual({
      ids: [1, 1, 1],
      sameAsFirst: true,
      destroyed: 0,
    });
  });

  it('Q24.31 the default strategy gives Home, User 9, Child, Parent and keeps Parent on an untitled route; a custom TitleStrategy gives Shop | Home, then Shop', async () => {
    expect(await titlesAfter(['/home', '/u/9', '/p/c', '/p/n', '/plain'])).toEqual(['Home', 'User 9', 'Child', 'Parent', 'Parent']);
    const shop = { provide: TitleStrategy, useExisting: LabM24ShopTitle };
    expect(await titlesAfter(['/home', '/plain'], shop)).toEqual(['Shop | Home', 'Shop']);
  });
});
