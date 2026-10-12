import { Component, InjectionToken, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import * as routerExports from '@angular/router';
import { Router, Routes, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

@Component({ selector: 'lab-m24-home', template: 'home' })
class LabM24Home {}

@Component({ selector: 'lab-m24-team', template: 'team' })
class LabM24Team {}

@Component({ selector: 'lab-m24-user', template: 'user-by-id' })
class LabM24User {}

@Component({ selector: 'lab-m24-new-user', template: 'new-user' })
class LabM24NewUser {}

@Component({ selector: 'lab-m24-not-found', template: 'not-found' })
class LabM24NotFound {}

/** The routes of the configuration table in the module text. */
const tableRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'home', component: LabM24Home },
  {
    path: 'old/:id',
    redirectTo: ({ params, queryParams }) =>
      `/team/${params['id']}?from=${queryParams['x'] ?? 'none'}`,
  },
  { path: 'team/:id', component: LabM24Team },
  { path: '**', component: LabM24NotFound },
];

async function open(routes: Routes, url: string): Promise<{ url: string; text: string }> {
  TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
  const harness = await RouterTestingHarness.create();
  await harness.navigateByUrl(url);
  harness.detectChanges();
  return {
    url: TestBed.inject(Router).url,
    text: harness.routeNativeElement?.textContent ?? '',
  };
}

describe('Section 1: router configuration', () => {
  it('Section 1: an empty-path full redirect sends / to /home', async () => {
    expect(await open(tableRoutes, '/')).toEqual({ url: '/home', text: 'home' });
  });

  it('Section 1: a redirect function reads params and query params', async () => {
    expect(await open(tableRoutes, '/old/7?x=1')).toEqual({ url: '/team/7?from=1', text: 'team' });
    TestBed.resetTestingModule();
    expect((await open(tableRoutes, '/old/7')).url).toBe('/team/7?from=none');
  });

  it('Section 1: the wildcard renders for an unknown URL and keeps the URL', async () => {
    expect(await open(tableRoutes, '/nope/deep')).toEqual({ url: '/nope/deep', text: 'not-found' });
  });

  it('Section 1: a route without children does not match a longer URL', async () => {
    expect(await open(tableRoutes, '/home/extra')).toEqual({
      url: '/home/extra',
      text: 'not-found',
    });
  });

  it('Section 1: an empty-path prefix redirect throws NG04014', () => {
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: '', redirectTo: 'home' }])],
    });
    let message = '';
    try {
      TestBed.inject(Router);
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toContain('NG04014');
    expect(message).toContain(`please provide 'pathMatch'`);
  });

  it('Section 1: routes match in array order', async () => {
    const wildcardFirst: Routes = [
      { path: '**', component: LabM24NotFound },
      { path: 'home', component: LabM24Home },
    ];
    expect((await open(wildcardFirst, '/home')).text).toBe('not-found');

    TestBed.resetTestingModule();
    const paramFirst: Routes = [
      { path: 'users/:id', component: LabM24User },
      { path: 'users/new', component: LabM24NewUser },
    ];
    expect((await open(paramFirst, '/users/new')).text).toBe('user-by-id');

    TestBed.resetTestingModule();
    const literalFirst: Routes = [...paramFirst].reverse();
    expect((await open(literalFirst, '/users/new')).text).toBe('new-user');
  });

  it('Section 1: absolute redirects that loop reject with NG04016 and relative ones with NG04002', async () => {
    const reject = async (routes: Routes, url: string): Promise<string> => {
      TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
      const harness = await RouterTestingHarness.create();
      try {
        await harness.navigateByUrl(url);
        return 'resolved';
      } catch (error) {
        return (error as Error).message;
      }
    };
    const relative = await reject(
      [
        { path: 'a', redirectTo: 'b' },
        { path: 'b', redirectTo: 'a' },
      ],
      '/a',
    );
    expect(relative).toContain('NG04002');
    TestBed.resetTestingModule();
    const absolute = await reject(
      [
        { path: 'a', redirectTo: '/b' },
        { path: 'b', redirectTo: '/a' },
      ],
      '/a',
    );
    expect(absolute).toContain('NG04016');
  });

  it('Section 1: a redirect function runs in an injection context and on every matching navigation', async () => {
    const target = new InjectionToken<string>('lab-m24-redirect-target');
    let calls = 0;
    const routes: Routes = [
      {
        path: 'go',
        redirectTo: () => {
          calls++;
          return inject(target);
        },
      },
      { path: 'home', component: LabM24Home },
    ];
    TestBed.configureTestingModule({
      providers: [provideRouter(routes), { provide: target, useValue: '/home' }],
    });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/go');
    const router = TestBed.inject(Router);
    expect(router.url).toBe('/home');
    await harness.navigateByUrl('/go');
    expect(calls).toBe(2);
  });

  it('Section 1: provideRoutes is not exported by @angular/router 22.2.1', () => {
    // @ts-expect-error provideRoutes was removed in v22.0
    const removed: unknown = routerExports.provideRoutes;
    expect(removed).toBeUndefined();
    expect('provideRoutes' in routerExports).toBe(false);
  });
});
