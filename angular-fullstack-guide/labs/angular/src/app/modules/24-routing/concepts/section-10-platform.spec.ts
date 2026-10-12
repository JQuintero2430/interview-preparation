import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  RedirectCommand,
  Router,
  RouterLink,
  Routes,
  provideRouter,
  withHashLocation,
} from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { legacyHashExtraOptions } from '../legacy/deprecated-forms';

@Component({ selector: 'lab-m24-page', template: 'page' })
class LabM24Page {}

/** One link with a query parameter, and one that shows `/shown` while it routes to `/b`. */
@Component({
  selector: 'lab-m24-links',
  imports: [RouterLink],
  template: `
    <a id="plain" routerLink="/b" [queryParams]="{ q: 1 }">b</a>
    <a id="shown" routerLink="/b" browserUrl="/shown">shown</a>
  `,
})
class LabM24Links {}

const routes: Routes = [
  { path: 'links', component: LabM24Links },
  { path: 'b', component: LabM24Page },
  { path: 'old', canActivate: [() => new RedirectCommand(TestBed.inject(Router).parseUrl('/b'), { browserUrl: '/shown' })], component: LabM24Page },
];

function hrefs(): { plain: string | null; shown: string | null } {
  const fixture = TestBed.createComponent(LabM24Links);
  fixture.detectChanges();
  const read = (id: string) => (fixture.nativeElement as HTMLElement).querySelector(`#${id}`)?.getAttribute('href') ?? null;
  return { plain: read('plain'), shown: read('shown') };
}

describe('Section 10: the Router and the platform', () => {
  it('Section 10: withHashLocation renders hash hrefs', () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes, withHashLocation())] });
    expect(hrefs().plain).toBe('#/b?q=1');
  });

  it('Section 10: the default strategy renders path hrefs', () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    expect(hrefs().plain).toBe('/b?q=1');
  });

  it('Section 10: Location reports the router URL', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/b?q=1#top');
    const location = TestBed.inject(Location);
    expect([location.path(), location.path(true)]).toEqual(['/b?q=1', '/b?q=1#top']);
  });

  it('Section 10: Location reports the route without the hash prefix under withHashLocation', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes, withHashLocation())] });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/b?q=1');
    expect(TestBed.inject(Location).path()).toBe('/b?q=1');
  });

  it('Section 10: a RouterLink browserUrl changes the address bar, not the route', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/links', LabM24Links);
    const anchor = (harness.routeNativeElement as HTMLElement).querySelector('#shown') as HTMLAnchorElement;
    anchor.click();
    await harness.fixture.whenStable();
    expect([TestBed.inject(Router).url, TestBed.inject(Location).path(), anchor.getAttribute('href')]).toEqual(['/b', '/shown', '/b']);
  });

  it('Section 10: a RedirectCommand browserUrl shows one URL and routes another', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/old');
    expect([TestBed.inject(Router).url, TestBed.inject(Location).path()]).toEqual(['/b', '/shown']);
  });

  it('Section 10: the legacy form is the useHash option', () => {
    expect(legacyHashExtraOptions).toEqual({ useHash: true });
  });
});
