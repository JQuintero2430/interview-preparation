import { Component, inject, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  CanActivateFn,
  CanDeactivateFn,
  CanMatchFn,
  GuardsCheckEnd,
  NavigationCancel,
  NavigationCancellationCode,
  NavigationEnd,
  NavigationStart,
  PartialMatchRouteSnapshot,
  RedirectCommand,
  Route,
  Router,
  Routes,
  UrlSegment,
  provideRouter,
} from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Observable, map, timer } from 'rxjs';
import {
  LabM24LegacyAuthGuard,
  legacyCanLoadRoute,
  legacyLoaderCalls,
  legacyMappedGuards,
  legacyTokenGuards,
} from '../legacy/deprecated-forms';

@Component({ selector: 'lab-m24-guard-page', template: 'page' })
class LabM24GuardPage {}

@Component({ selector: 'lab-m24-login', template: 'login' })
class LabM24Login {}

@Component({ selector: 'lab-m24-editor', template: 'editor' })
class LabM24Editor {
  readonly dirty = signal(true);
}

class LabM24Roles {
  readonly granted = new Set(['editor']);
  has(role: string): boolean {
    return this.granted.has(role);
  }
}

type Log = string[];

/** A `CanActivateFn` that records its name and answers with `result`. */
const trace =
  (log: Log, name: string, result = true): CanActivateFn =>
  () => {
    log.push(name);
    return result;
  };

/** A `CanMatchFn` that records its name and answers with `result`. */
const traceMatch =
  (log: Log, name: string, result: boolean): CanMatchFn =>
  () => {
    log.push(name);
    return result;
  };

/** A resolver that records its name. */
const traceResolve = (log: Log, name: string) => () => {
  log.push(name);
  return name;
};

/** A guard factory: the returned function closes over `role` and runs in the injection context. */
const requireRole =
  (role: string): CanActivateFn =>
  () =>
    inject(LabM24Roles).has(role) || inject(Router).parseUrl(`/login?need=${role}`);

/** The navigation events this section cares about, with the cancellation code. */
function kinds(events: unknown[]): string[] {
  return events.flatMap((e) => {
    if (e instanceof NavigationStart) return ['start'];
    if (e instanceof NavigationEnd) return ['end'];
    if (e instanceof NavigationCancel) return [`cancel:${e.code}`];
    return [];
  });
}

async function create(routes: Routes) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: [provideRouter(routes), LabM24Roles] });
  const harness = await RouterTestingHarness.create();
  const router = TestBed.inject(Router);
  const events: unknown[] = [];
  router.events.subscribe((e) => events.push(e));
  return { harness, router, events };
}

describe('Section 5: functional guards', () => {
  it('Section 5: canMatch, canActivate, canActivateChild and resolvers run in this order', async () => {
    const log: Log = [];
    const { harness } = await create([
      { path: 'admin', canMatch: [traceMatch(log, 'canMatch:admin-a', false)], component: LabM24GuardPage },
      {
        path: 'admin',
        canMatch: [traceMatch(log, 'canMatch:admin-b', true)],
        canActivate: [trace(log, 'canActivate:parent')],
        canActivateChild: [trace(log, 'canActivateChild')],
        resolve: { parent: traceResolve(log, 'resolve:parent') },
        children: [
          {
            path: ':id',
            canActivate: [trace(log, 'canActivate:child')],
            resolve: { child: traceResolve(log, 'resolve:child') },
            component: LabM24GuardPage,
          },
        ],
      },
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
  });

  it('Section 5: canDeactivate of the current route runs before canActivate of the next', async () => {
    const log: Log = [];
    const leave: CanDeactivateFn<LabM24GuardPage> = () => {
      log.push('canDeactivate:edit');
      return true;
    };
    const { harness } = await create([
      { path: 'edit', canDeactivate: [leave], component: LabM24GuardPage },
      { path: 'other', canActivate: [trace(log, 'canActivate:other')], component: LabM24GuardPage },
    ]);
    await harness.navigateByUrl('/edit');
    expect(log).toEqual([]);
    await harness.navigateByUrl('/other');
    expect(log).toEqual(['canDeactivate:edit', 'canActivate:other']);
  });

  it('Section 5: a false guard cancels with GuardRejected', async () => {
    const { harness, router, events } = await create([
      { path: '', component: LabM24GuardPage },
      { path: 'secret', canActivate: [() => false], component: LabM24GuardPage },
    ]);
    await harness.navigateByUrl('/');
    events.length = 0;
    expect(await router.navigateByUrl('/secret')).toBe(false);
    expect(router.url).toBe('/');
    expect(kinds(events)).toEqual(['start', `cancel:${NavigationCancellationCode.GuardRejected}`]);
  });

  it('Section 5: a UrlTree and a RedirectCommand cancel with Redirect and navigate again', async () => {
    const { harness, router, events } = await create([
      { path: '', component: LabM24GuardPage },
      { path: 'login', component: LabM24Login },
      { path: 'tree', canActivate: [() => inject(Router).parseUrl('/login?r=tree')], component: LabM24GuardPage },
      {
        path: 'command',
        canActivate: [() => new RedirectCommand(inject(Router).parseUrl('/login?r=cmd'), { skipLocationChange: true })],
        component: LabM24GuardPage,
      },
    ]);
    await harness.navigateByUrl('/');
    const expected = ['start', `cancel:${NavigationCancellationCode.Redirect}`, 'start', 'end'];

    events.length = 0;
    expect(await router.navigateByUrl('/tree')).toBe(true);
    expect(router.url).toBe('/login?r=tree');
    expect(kinds(events)).toEqual(expected);

    events.length = 0;
    expect(await router.navigateByUrl('/command')).toBe(true);
    expect(router.url).toBe('/login?r=cmd');
    expect(kinds(events)).toEqual(expected);
  });

  it('Section 5: a thrown RedirectCommand redirects', async () => {
    const throwing: CanActivateFn = () => {
      throw new RedirectCommand(inject(Router).parseUrl('/login?r=thrown'));
    };
    const { harness, router, events } = await create([
      { path: '', component: LabM24GuardPage },
      { path: 'login', component: LabM24Login },
      { path: 'thrown', canActivate: [throwing], component: LabM24GuardPage },
    ]);
    await harness.navigateByUrl('/');
    events.length = 0;
    expect(await router.navigateByUrl('/thrown')).toBe(true);
    expect(router.url).toBe('/login?r=thrown');
    expect(kinds(events)).toEqual(['start', `cancel:${NavigationCancellationCode.Redirect}`, 'start', 'end']);
  });

  it('Section 5: in one array the first non-true result in array order wins', async () => {
    const slow =
      (value: boolean): CanActivateFn =>
      () =>
        timer(30).pipe(map(() => value));
    const toLogin: CanActivateFn = () => inject(Router).parseUrl('/login');
    const { harness, router } = await create([
      { path: '', component: LabM24GuardPage },
      { path: 'login', component: LabM24Login },
      { path: 'slow-false', canActivate: [slow(false), toLogin], component: LabM24GuardPage },
      { path: 'slow-true', canActivate: [slow(true), toLogin], component: LabM24GuardPage },
    ]);
    await harness.navigateByUrl('/');
    expect(await router.navigateByUrl('/slow-false')).toBe(false);
    expect(router.url).toBe('/');
    expect(await router.navigateByUrl('/slow-true')).toBe(true);
    expect(router.url).toBe('/login');
  });

  it('Section 5: canMatch receives the segments and a partial snapshot with inherited params', async () => {
    let seen: { segments: UrlSegment[]; snapshot: PartialMatchRouteSnapshot } | undefined;
    const canMatch: CanMatchFn = (_route, segments, currentSnapshot) => {
      seen = { segments, snapshot: currentSnapshot };
      return true;
    };
    const { harness } = await create([
      { path: 'org/:org', children: [{ path: 'p/:pid', canMatch: [canMatch], component: LabM24GuardPage }] },
    ]);
    await harness.navigateByUrl('/org/acme/p/7?tab=x');
    expect(seen?.segments.map((s) => s.path)).toEqual(['p', '7']);
    expect(seen?.snapshot.params).toEqual({ org: 'acme', pid: '7' });
    expect(seen?.snapshot.queryParams).toEqual({ tab: 'x' });
    expect(seen?.snapshot.url.map((s) => s.path)).toEqual(['p', '7']);
    expect(Object.keys(seen?.snapshot ?? {}).sort()).toEqual(
      ['routeConfig', 'url', 'params', 'queryParams', 'fragment', 'data', 'outlet', 'title', 'paramMap', 'queryParamMap'].sort(),
    );
  });

  it('Section 5: a false canDeactivate keeps the current URL', async () => {
    const unsaved: CanDeactivateFn<LabM24Editor> = (editor) => !editor.dirty();
    const { harness, router } = await create([
      { path: 'edit', canDeactivate: [unsaved], component: LabM24Editor },
      { path: 'other', component: LabM24GuardPage },
    ]);
    const editor = await harness.navigateByUrl('/edit', LabM24Editor);
    expect(await router.navigateByUrl('/other')).toBe(false);
    expect(router.url).toBe('/edit');
    editor.dirty.set(false);
    expect(await router.navigateByUrl('/other')).toBe(true);
    expect(router.url).toBe('/other');
  });

  it('Section 5: canDeactivate receives the component instance and the next URL', async () => {
    let received: { component: unknown; next: string } | undefined;
    const record: CanDeactivateFn<LabM24Editor> = (component, _route, _state, nextState) => {
      received = { component, next: nextState.url };
      return true;
    };
    const { harness, router } = await create([
      { path: 'edit', canDeactivate: [record], component: LabM24Editor },
      { path: 'other', component: LabM24GuardPage },
    ]);
    const editor = await harness.navigateByUrl('/edit', LabM24Editor);
    await router.navigateByUrl('/other?x=1');
    expect(received?.component).toBe(editor);
    expect(received?.next).toBe('/other?x=1');
  });

  it('Section 5: a guard factory closes over its argument and runs in the injection context', async () => {
    const { harness, router } = await create([
      { path: '', component: LabM24GuardPage },
      { path: 'login', component: LabM24Login },
      { path: 'posts', canActivate: [requireRole('editor')], component: LabM24GuardPage },
      { path: 'users', canActivate: [requireRole('admin')], component: LabM24GuardPage },
    ]);
    await harness.navigateByUrl('/');
    await router.navigateByUrl('/posts');
    expect(router.url).toBe('/posts');
    await router.navigateByUrl('/users');
    expect(router.url).toBe('/login?need=admin');
  });

  it('Section 5: only the first value of an Observable guard counts', async () => {
    const firstTrueThenFalse: CanActivateFn = () =>
      new Observable<boolean>((subscriber) => {
        subscriber.next(true);
        subscriber.next(false);
        subscriber.complete();
      });
    const { harness, router } = await create([
      { path: '', component: LabM24GuardPage },
      { path: 'once', canActivate: [firstTrueThenFalse], component: LabM24GuardPage },
    ]);
    await harness.navigateByUrl('/');
    expect(await router.navigateByUrl('/once')).toBe(true);
    expect(router.url).toBe('/once');
  });

  it('Section 5: a canMatch that returns false lets the next route with the same path match', async () => {
    const { harness, router } = await create([
      { path: 'area', canMatch: [() => false], component: LabM24Login },
      { path: 'area', component: LabM24GuardPage },
    ]);
    const component = await harness.navigateByUrl('/area');
    expect(component).toBeInstanceOf(LabM24GuardPage);
    expect(router.url).toBe('/area');
  });

  it('Section 5: GuardsCheckEnd reports shouldActivate false for a refused navigation', async () => {
    const { harness, router, events } = await create([
      { path: '', component: LabM24GuardPage },
      { path: 'no', canActivate: [() => false], component: LabM24GuardPage },
    ]);
    await harness.navigateByUrl('/');
    events.length = 0;
    await router.navigateByUrl('/no');
    const end = events.find((e) => e instanceof GuardsCheckEnd) as GuardsCheckEnd;
    expect(end.shouldActivate).toBe(false);
  });
});

describe('Section 5: legacy guard forms', () => {
  const login: Route = { path: 'login', component: LabM24Login };

  it('Section 5: a class guard works through mapToCanActivate', async () => {
    const { harness, router } = await create([
      { path: '', component: LabM24GuardPage },
      login,
      { path: 'members', canActivate: legacyMappedGuards, component: LabM24GuardPage },
    ]);
    await harness.navigateByUrl('/');
    expect(await router.navigateByUrl('/members')).toBe(true);
    expect(router.url).toBe('/login?legacy=class');
    expect(TestBed.inject(LabM24LegacyAuthGuard)).toBeInstanceOf(LabM24LegacyAuthGuard);
  });

  it('Section 5: a class listed directly in the guard array is injected and called', async () => {
    const { harness, router } = await create([
      { path: '', component: LabM24GuardPage },
      login,
      { path: 'members', canActivate: legacyTokenGuards, component: LabM24GuardPage },
    ]);
    await harness.navigateByUrl('/');
    expect(await router.navigateByUrl('/members')).toBe(true);
    expect(router.url).toBe('/login?legacy=class');
  });

  it('Section 5: a false canLoad cancels with GuardRejected and the loader does not run', async () => {
    legacyLoaderCalls.count = 0;
    const { harness, router, events } = await create([{ path: '', component: LabM24GuardPage }, legacyCanLoadRoute]);
    await harness.navigateByUrl('/');
    events.length = 0;
    expect(await router.navigateByUrl('/reports')).toBe(false);
    expect(router.url).toBe('/');
    expect(kinds(events)).toEqual(['start', `cancel:${NavigationCancellationCode.GuardRejected}`]);
    expect(legacyLoaderCalls.count).toBe(0);
  });
});
