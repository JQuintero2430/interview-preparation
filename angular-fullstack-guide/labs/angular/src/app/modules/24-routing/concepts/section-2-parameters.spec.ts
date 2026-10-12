import { Component, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  PRIMARY_OUTLET,
  Router,
  RouterOutlet,
  Routes,
  provideRouter,
  withComponentInputBinding,
  withRouterConfig,
} from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { firstValueFrom } from 'rxjs';
import {
  LabM24LegacyParamMapProduct,
  LabM24LegacyStaleProduct,
  legacyEmptyOnlyInheritance,
} from '../legacy/deprecated-forms';

@Component({ selector: 'lab-m24-page', template: 'page' })
class LabM24Page {}

@Component({ selector: 'lab-m24-shell', imports: [RouterOutlet], template: '<router-outlet />' })
class LabM24Shell {}

let created = 0;

@Component({ selector: 'lab-m24-counted', template: 'counted' })
class LabM24Counted {
  constructor() {
    created += 1;
  }
}

@Component({ selector: 'lab-m24-inputs', template: 'inputs' })
class LabM24Inputs {
  readonly id = input<string>();
  readonly q = input<string>();
  readonly kind = input<string>();
  readonly user = input<string>();
  readonly withDefault = input<string>('default');
}

/** The deepest activated route of the current router state. */
function leaf(router: Router): ActivatedRouteSnapshot {
  let snapshot = router.routerState.snapshot.root;
  while (snapshot.firstChild) {
    snapshot = snapshot.firstChild;
  }
  return snapshot;
}

/** The nested table of the inheritance tests: a parent with a component, data and a path parameter. */
const teamRoutes = (parentComponent: boolean): Routes => [
  {
    path: 'team/:id',
    ...(parentComponent ? { component: LabM24Shell } : {}),
    data: { d: 'parent' },
    children: [{ path: 'member/:mid', component: LabM24Page }],
  },
];

async function leafAt(routes: Routes, url: string, ...features: Parameters<typeof provideRouter>[1][]) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: [provideRouter(routes, ...features)] });
  const harness = await RouterTestingHarness.create();
  await harness.navigateByUrl(url);
  return leaf(TestBed.inject(Router));
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

const inputRoutes: Routes = [{ path: 'u/:id', component: LabM24Inputs }];

describe('Section 2: route parameters', () => {
  beforeEach(() => {
    created = 0;
  });

  it('Section 2: path, matrix, query and fragment land in their places', async () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: 'list', component: LabM24Page }])],
    });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/list;sort=asc;page=2?q=x#top');
    const router = TestBed.inject(Router);
    const snapshot = leaf(router);
    expect(snapshot.params).toEqual({ sort: 'asc', page: '2' });
    expect(snapshot.queryParams).toEqual({ q: 'x' });
    expect(snapshot.fragment).toBe('top');
    expect(router.url).toBe('/list;sort=asc;page=2?q=x#top');
    const route = router.routerState.root.firstChild!;
    expect((await firstValueFrom(route.paramMap)).get('sort')).toBe('asc');
    expect((await firstValueFrom(route.queryParamMap)).get('q')).toBe('x');
    expect(await firstValueFrom(route.fragment)).toBe('top');
  });

  it('Section 2: parseUrl splits a URL into segment groups, matrix parameters, query and fragment', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const tree = TestBed.inject(Router).parseUrl('/u/42;id=m?q=x#top');
    const segments = tree.root.children[PRIMARY_OUTLET].segments;
    expect(segments.map((segment) => segment.path)).toEqual(['u', '42']);
    expect(segments.map((segment) => segment.parameters)).toEqual([{}, { id: 'm' }]);
    expect(tree.queryParams).toEqual({ q: 'x' });
    expect(tree.fragment).toBe('top');
  });

  it('Section 2: createUrlTree builds matrix, query and fragment', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const tree = TestBed.inject(Router).createUrlTree(['/list', { sort: 'desc' }], {
      queryParams: { q: 'y' },
      fragment: 'f',
    });
    expect(tree.toString()).toBe('/list;sort=desc?q=y#f');
  });

  it('Section 2: a reused component keeps one instance across param changes', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'c/:id', component: LabM24Counted },
          { path: 'x', component: LabM24Page },
        ]),
      ],
    });
    const harness = await RouterTestingHarness.create();
    const first = await harness.navigateByUrl('/c/1', LabM24Counted);
    const second = await harness.navigateByUrl('/c/2', LabM24Counted);
    expect(second).toBe(first);
    expect(created).toBe(1);
    await harness.navigateByUrl('/x');
    const third = await harness.navigateByUrl('/c/1', LabM24Counted);
    expect(third).not.toBe(first);
    expect(created).toBe(2);
  });

  it('Section 2: a snapshot read in a constructor goes stale, a subscription stays current', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'stale/:id', component: LabM24LegacyStaleProduct },
          { path: 'live/:id', component: LabM24LegacyParamMapProduct },
        ]),
      ],
    });
    const harness = await RouterTestingHarness.create();
    const stale = await harness.navigateByUrl('/stale/1', LabM24LegacyStaleProduct);
    await harness.navigateByUrl('/stale/2', LabM24LegacyStaleProduct);
    expect(stale.id).toBe('1');
    const live = await harness.navigateByUrl('/live/1', LabM24LegacyParamMapProduct);
    expect(live.id).toBe('1');
    await harness.navigateByUrl('/live/2', LabM24LegacyParamMapProduct);
    expect(live.id).toBe('2');
  });

  it("Section 2: with the v22 default a child sees its parent's params and data", async () => {
    const snapshot = await leafAt(teamRoutes(true), '/team/5/member/9');
    expect(snapshot.params).toEqual({ id: '5', mid: '9' });
    expect(snapshot.data).toEqual({ d: 'parent' });
  });

  it("Section 2: emptyOnly hides a component parent's params", async () => {
    const snapshot = await leafAt(teamRoutes(true), '/team/5/member/9', legacyEmptyOnlyInheritance);
    expect(snapshot.params).toEqual({ mid: '9' });
    expect(snapshot.data).toEqual({});
  });

  it('Section 2: a componentless parent passes params under both strategies', async () => {
    for (const features of [[], [withRouterConfig({ paramsInheritanceStrategy: 'emptyOnly' })]]) {
      const snapshot = await leafAt(teamRoutes(false), '/team/5/member/9', ...features);
      expect(snapshot.params).toEqual({ id: '5', mid: '9' });
      expect(snapshot.data).toEqual({ d: 'parent' });
    }
  });

  it('Section 2: a matrix parameter belongs to the route of its segment', async () => {
    const routes: Routes = [
      { path: 'team', component: LabM24Shell, children: [{ path: 'member', component: LabM24Page }] },
    ];
    const url = '/team;t=1/member;m=2';
    const emptyOnly = await leafAt(routes, url, legacyEmptyOnlyInheritance);
    expect(emptyOnly.params).toEqual({ m: '2' });
    expect(emptyOnly.parent?.params).toEqual({ t: '1' });
    const always = await leafAt(routes, url);
    expect(always.params).toEqual({ t: '1', m: '2' });
  });

  it('Section 2: input binding merges query, params, data and resolved data in that order', async () => {
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
    const [matrix] = await bindAcross(inputRoutes, ['/u/42;id=matrix?id=query&q=hello'], withComponentInputBinding());
    expect(matrix).toMatchObject({ id: 'matrix', q: 'hello' });
    const [path] = await bindAcross(inputRoutes, ['/u/42?id=query'], withComponentInputBinding());
    expect(path['id']).toBe('42');
  });

  it('Section 2: a key that disappears binds undefined, over the input default', async () => {
    const [first, second] = await bindAcross(inputRoutes, ['/u/42?q=hello', '/u/43'], withComponentInputBinding());
    expect(first).toMatchObject({ id: '42', q: 'hello', withDefault: undefined, sameInstance: 'true' });
    expect(second).toMatchObject({ id: '43', q: undefined, withDefault: undefined, sameInstance: 'true' });
  });

  it('Section 2: queryParams false and undefinedIfStale change what binds', async () => {
    const [noQuery] = await bindAcross(
      inputRoutes,
      ['/u/1?q=hello'],
      withComponentInputBinding({ queryParams: false, unmatchedInputBehavior: 'undefinedIfStale' }),
    );
    expect(noQuery).toMatchObject({ id: '1', q: undefined, withDefault: 'default' });
    const [first, second] = await bindAcross(
      inputRoutes,
      ['/u/1?q=hello', '/u/2'],
      withComponentInputBinding({ unmatchedInputBehavior: 'undefinedIfStale' }),
    );
    expect(first).toMatchObject({ id: '1', q: 'hello', withDefault: 'default' });
    expect(second).toMatchObject({ id: '2', q: undefined, withDefault: 'default' });
  });
});
