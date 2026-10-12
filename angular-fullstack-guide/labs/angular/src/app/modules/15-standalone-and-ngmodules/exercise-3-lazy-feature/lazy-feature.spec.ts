import { Component, DebugElement, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { AdminShell } from './admin-shell';
import { AdminStore } from './admin-store';
import { LegacyUsersPage } from './legacy/legacy-admin.module';
import SettingsPage from './settings-page';
import { UserList } from './user-list';

@Component({ selector: 'lab-m15-e3-home', template: '<p>home</p>' })
class Home {}

const appRoutes: Routes = [
  { path: 'admin', loadChildren: () => import('./admin.routes') },
  { path: 'old-admin', loadChildren: () => import('./legacy/legacy-admin.module').then((m) => m.LegacyAdminModule) },
  { path: 'home', component: Home },
];

function pageOf(harness: RouterTestingHarness, page: Type<unknown>): DebugElement {
  return harness.fixture.debugElement.query(By.directive(page));
}

function storeOf(harness: RouterTestingHarness, page: Type<unknown>): AdminStore {
  return pageOf(harness, page).injector.get(AdminStore);
}

function textOf(harness: RouterTestingHarness, page: Type<unknown>): string {
  return ((pageOf(harness, page).nativeElement as HTMLElement).textContent ?? '').replace(/\s+/g, ' ').trim();
}

describe('E15.3 A lazy feature without modules', () => {
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(appRoutes)] });
    harness = await RouterTestingHarness.create();
  });

  it('/admin renders the user list through the lazy routes array', async () => {
    await harness.navigateByUrl('/admin', AdminShell);

    expect(harness.routeNativeElement?.querySelector('h2')?.textContent).toBe('Admin');
    const rows = (pageOf(harness, UserList).nativeElement as HTMLElement).querySelectorAll('li');
    expect(Array.from(rows, (row) => row.textContent)).toEqual(['ada', 'linus']);
  });

  it('/admin/settings renders the default-exported component', async () => {
    await harness.navigateByUrl('/admin/settings', AdminShell);

    expect(textOf(harness, SettingsPage)).toBe('2 users to manage');
  });

  it('the list and the settings page share one AdminStore', async () => {
    await harness.navigateByUrl('/admin', AdminShell);
    const listStore = storeOf(harness, UserList);
    listStore.add('grace');

    await harness.navigateByUrl('/admin/settings', AdminShell);

    expect(storeOf(harness, SettingsPage)).toBe(listStore);
    expect(textOf(harness, SettingsPage)).toBe('3 users to manage');
  });

  it('the root cannot inject AdminStore', async () => {
    await harness.navigateByUrl('/admin', AdminShell);

    expect(() => TestBed.inject(AdminStore)).toThrowError(/NG0201/);
  });

  it('leaving and re-entering /admin keeps the same store', async () => {
    await harness.navigateByUrl('/admin', AdminShell);
    const first = storeOf(harness, UserList);
    await harness.navigateByUrl('/home', Home);
    await harness.navigateByUrl('/admin', AdminShell);

    expect(storeOf(harness, UserList)).toBe(first);
  });

  it('the legacy NgModule route still works next to it and has its own store instance', async () => {
    await harness.navigateByUrl('/admin', AdminShell);
    const routeStore = storeOf(harness, UserList);

    await harness.navigateByUrl('/old-admin', LegacyUsersPage);

    expect(textOf(harness, LegacyUsersPage)).toBe('legacy: 2 users');
    expect(storeOf(harness, LegacyUsersPage)).toBeInstanceOf(AdminStore);
    expect(storeOf(harness, LegacyUsersPage)).not.toBe(routeStore);
  });
});
