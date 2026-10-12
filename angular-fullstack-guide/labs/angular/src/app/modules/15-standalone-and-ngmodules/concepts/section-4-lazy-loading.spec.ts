import { inject, InjectionToken } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Routes } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { AdminStore, AdminUsers } from './lazy/admin.routes';
import AdminSettings from './lazy/admin-page';
import { LegacyAdminPage, LegacyAdminStore } from './lazy/legacy-admin.module';

// A value only the probe route provides, to see which injector a loader runs in.
const ROUTE_LABEL = new InjectionToken<string>('lab-m15-route-label');
let labelSeenByLoader: string | null = null;

const routes: Routes = [
  { path: 'admin', loadChildren: () => import('./lazy/admin.routes').then((m) => m.ADMIN_ROUTES) },
  { path: 'admin-default', loadChildren: () => import('./lazy/admin.routes') },
  {
    path: 'old-admin',
    loadChildren: () => import('./lazy/legacy-admin.module').then((m) => m.LegacyAdminModule),
  },
  {
    path: 'probe',
    providers: [{ provide: ROUTE_LABEL, useValue: 'probe route' }],
    loadChildren: () => {
      labelSeenByLoader = inject(ROUTE_LABEL);
      return import('./lazy/admin.routes');
    },
  },
  {
    path: 'wrong-component',
    loadComponent: () => import('./lazy/legacy-admin.module').then((m) => m.LegacyAdminModule),
  },
  { path: 'wrong-children', loadChildren: () => import('./lazy/admin-page') },
];

async function errorOf(harness: RouterTestingHarness, url: string): Promise<string> {
  try {
    await harness.navigateByUrl(url);
    return 'navigated';
  } catch (error) {
    return (error as Error).message;
  }
}

describe('Section 4: lazy loading without modules', () => {
  beforeEach(() => {
    labelSeenByLoader = null;
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
  });

  it('Section 4: loadChildren with a routes array renders the child route', async () => {
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/admin', AdminUsers);

    expect(harness.routeNativeElement?.textContent).toBe('2 users');
  });

  it('Section 4: a default export is unwrapped for loadChildren and loadComponent', async () => {
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/admin-default', AdminUsers);
    expect(harness.routeNativeElement?.textContent).toBe('2 users');
    await harness.navigateByUrl('/admin-default/settings', AdminSettings);
    expect(harness.routeNativeElement?.textContent).toBe('settings for 2 users');
  });

  it('Section 4: route providers are shared by the lazy pages and invisible at the root', async () => {
    const harness = await RouterTestingHarness.create();

    const users = await harness.navigateByUrl('/admin', AdminUsers);
    const settings = await harness.navigateByUrl('/admin/settings', AdminSettings);

    expect(settings.store).toBe(users.store);
    expect(() => TestBed.inject(AdminStore)).toThrowError(/NG0201/);
  });

  it('Section 4: a lazy NgModule still loads and gets its own injector', async () => {
    const harness = await RouterTestingHarness.create();

    const page = await harness.navigateByUrl('/old-admin', LegacyAdminPage);

    expect(harness.routeNativeElement?.textContent).toBe('legacy admin: 1 user');
    expect(page.store).toBeInstanceOf(LegacyAdminStore);
    expect(() => TestBed.inject(LegacyAdminStore)).toThrowError(/NG0201/);
  });

  it("Section 4: a loader can inject from the route's injector", async () => {
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/probe', AdminUsers);

    expect(labelSeenByLoader).toBe('probe route');
  });

  it('Section 4: loadComponent given an NgModule fails with NG04014', async () => {
    const harness = await RouterTestingHarness.create();

    expect(await errorOf(harness, '/wrong-component')).toBe(
      "NG04014: Invalid configuration of route 'wrong-component'. You are using 'loadComponent' with a module, " +
        "but it must be used with standalone components. Use 'loadChildren' instead.",
    );
  });

  it('Section 4: loadChildren given a component fails with a development-mode assertion, not a coded error', async () => {
    const harness = await RouterTestingHarness.create();

    // The router treats anything that is not a routes array as an NgModule to compile and create.
    expect(await errorOf(harness, '/wrong-children')).toMatch(
      /^ASSERTION ERROR: NgModule '_?AdminSettings' is not a subtype of 'NgModuleType'\./,
    );
  });
});
