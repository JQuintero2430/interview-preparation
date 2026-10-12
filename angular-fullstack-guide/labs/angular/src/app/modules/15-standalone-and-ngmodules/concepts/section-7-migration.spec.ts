import { ApplicationRef, importProvidersFrom, isStandalone, NgModuleRef, Type } from '@angular/core';
import { bootstrapApplication, BrowserModule, platformBrowser } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AdminPage as LegacyAdminPage } from '../legacy/migration-sample/app/admin/admin-page';
import { App as LegacyApp } from '../legacy/migration-sample/app/app';
import { AppModule } from '../legacy/migration-sample/app/app.module';
import { Hello as LegacyHello } from '../legacy/migration-sample/app/hello';
import { Badge as LegacyBadge } from '../legacy/migration-sample/app/shared/badge';
import { ShortPipe as LegacyShortPipe } from '../legacy/migration-sample/app/shared/short-pipe';
import { AdminPage } from './migrated/app/admin/admin-page';
import { App } from './migrated/app/app';
import { AppRoutingModule } from './migrated/app/app-routing.module';
import { Greeter } from './migrated/app/greeter';
import { Hello } from './migrated/app/hello';
import { Badge } from './migrated/app/shared/badge';
import { ShortPipe } from './migrated/app/shared/short-pipe';

interface Rendered {
  text: string;
  tags: string[];
}

// What a reader would compare: the visible text and the element structure.
function snapshot(host: HTMLElement): Rendered {
  return {
    text: host.textContent?.replace(/\s+/g, ' ').trim() ?? '',
    tags: Array.from(host.querySelectorAll('*'), (element) => element.tagName.toLowerCase()),
  };
}

// Renders the start page and the lazy admin page, then navigates back to the start.
async function renderPages(appRef: ApplicationRef, host: HTMLElement): Promise<Rendered[]> {
  const router = appRef.injector.get(Router);
  await appRef.whenStable();
  const start = snapshot(host);
  await router.navigateByUrl('/admin');
  await appRef.whenStable();
  const admin = snapshot(host);
  await router.navigateByUrl('/');
  return [start, admin];
}

function addHost(): HTMLElement {
  const host = document.createElement('lab-m15-mig-app');
  document.body.appendChild(host);
  return host;
}

describe('Section 7: migrating with the standalone schematic', () => {
  let moduleRef: NgModuleRef<AppModule> | undefined;
  let appRef: ApplicationRef | undefined;

  afterEach(() => {
    moduleRef?.destroy();
    appRef?.destroy();
    moduleRef = undefined;
    appRef = undefined;
    document.querySelectorAll('lab-m15-mig-app').forEach((host) => host.remove());
  });

  it('Section 7: the migrated app renders what the NgModule app rendered', async () => {
    const legacyHost = addHost();
    moduleRef = await platformBrowser().bootstrapModule(AppModule);
    const before = await renderPages(moduleRef.injector.get(ApplicationRef), legacyHost);
    moduleRef.destroy();
    moduleRef = undefined;
    legacyHost.remove();

    // The providers are the ones the schematic wrote into migrated/main.ts.
    const migratedHost = addHost();
    appRef = await bootstrapApplication(App, {
      providers: [importProvidersFrom(BrowserModule, AppRoutingModule), Greeter],
    });
    const after = await renderPages(appRef, migratedHost);

    expect(before[0]).toEqual({ text: 'Hello, Ada [Ada]', tags: ['lab-m15-mig-hello', 'p', 'lab-m15-mig-badge', 'router-outlet'] });
    expect(before[1].text).toBe('Hello, Ada [Ada]admin [ops]');
    expect(after).toEqual(before);
  });

  it('Section 7: every migrated declarable is standalone', () => {
    const legacy: Type<unknown>[] = [LegacyApp, LegacyHello, LegacyBadge, LegacyShortPipe, LegacyAdminPage];
    const migrated: Type<unknown>[] = [App, Hello, Badge, ShortPipe, AdminPage];

    expect(legacy.map((type) => isStandalone(type))).toEqual([false, false, false, false, false]);
    expect(migrated.map((type) => isStandalone(type))).toEqual([true, true, true, true, true]);
  });
});
