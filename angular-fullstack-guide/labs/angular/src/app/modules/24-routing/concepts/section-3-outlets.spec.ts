import { Component, Signal, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  ROUTER_OUTLET_DATA,
  Router,
  RouterOutlet,
  Routes,
  provideRouter,
} from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

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

@Component({
  selector: 'lab-m24-settings',
  imports: [RouterOutlet],
  template: 'settings[<router-outlet />]',
})
class LabM24Settings {}

@Component({ selector: 'lab-m24-profile', template: 'profile' })
class LabM24Profile {}

@Component({ selector: 'lab-m24-themed', template: '{{ theme() }}' })
class LabM24Themed {
  protected readonly theme = inject(ROUTER_OUTLET_DATA) as Signal<string>;
}

@Component({ selector: 'lab-m24-data-probe', template: '{{ shown }}' })
class LabM24DataProbe {
  protected readonly shown = String(inject(ROUTER_OUTLET_DATA)());
}

@Component({
  selector: 'lab-m24-bare-shell',
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
class LabM24BareShell {}

@Component({
  selector: 'lab-m24-themed-shell',
  imports: [RouterOutlet],
  template: '<router-outlet [routerOutletData]="theme" />',
})
class LabM24ThemedShell {
  protected readonly theme = 'dark';
}

/** The mail table of the outlet tests: an empty-path shell with a primary and a `popup` outlet. */
const mailRoutes: Routes = [
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

async function create(routes: Routes) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
  return RouterTestingHarness.create();
}

/** The text of one named region of the shell, or of the whole host when `selector` is omitted. */
function text(harness: RouterTestingHarness, selector?: string): string {
  const host = harness.routeNativeElement as HTMLElement;
  const region = selector ? host.querySelector(selector) : host;
  return region?.textContent?.trim() ?? '';
}

describe('Section 3: nested and named outlets', () => {
  it("Section 3: children render into the parent's outlet", async () => {
    const harness = await create([
      { path: 'settings', component: LabM24Settings, children: [{ path: 'profile', component: LabM24Profile }] },
    ]);
    await harness.navigateByUrl('/settings/profile');
    expect(text(harness)).toBe('settings[profile]');
    const outlet = (harness.routeNativeElement as HTMLElement).querySelector('lab-m24-settings router-outlet');
    expect(outlet?.nextElementSibling?.tagName).toBe('LAB-M24-PROFILE');
    const settings = TestBed.inject(Router).routerState.snapshot.root.firstChild!;
    expect(settings.routeConfig?.path).toBe('settings');
    expect(settings.firstChild?.routeConfig?.path).toBe('profile');
  });

  it('Section 3: a named outlet appears in the URL in parentheses', async () => {
    const harness = await create(mailRoutes);
    await harness.navigateByUrl('/inbox(popup:compose)');
    expect(TestBed.inject(Router).url).toBe('/inbox(popup:compose)');
    expect(text(harness, 'main')).toBe('inbox');
    expect(text(harness, 'aside')).toBe('compose');
  });

  it('Section 3: outlets popup null closes the named outlet', async () => {
    const harness = await create(mailRoutes);
    const router = TestBed.inject(Router);
    await harness.navigateByUrl('/inbox(popup:compose)');
    await router.navigate([{ outlets: { popup: null } }]);
    harness.detectChanges();
    expect(router.url).toBe('/inbox');
    expect(text(harness, 'main')).toBe('inbox');
    expect(text(harness, 'aside')).toBe('');
  });

  it('Section 3: an outlets command reopens the named outlet', async () => {
    const harness = await create(mailRoutes);
    const router = TestBed.inject(Router);
    await harness.navigateByUrl('/inbox');
    expect(await router.navigate([{ outlets: { popup: ['compose'] } }])).toBe(true);
    harness.detectChanges();
    expect(router.url).toBe('/inbox(popup:compose)');
    expect(text(harness, 'aside')).toBe('compose');
  });

  it('Section 3: the primary outlet navigates without touching the named outlet', async () => {
    const harness = await create(mailRoutes);
    const router = TestBed.inject(Router);
    await harness.navigateByUrl('/inbox(popup:compose)');
    await router.navigate([{ outlets: { primary: ['sent'] } }]);
    harness.detectChanges();
    expect(router.url).toBe('/sent(popup:compose)');
    expect(text(harness, 'main')).toBe('sent');
    expect(text(harness, 'aside')).toBe('compose');
  });

  it('Section 3: a componentless route groups children without a view', async () => {
    const harness = await create([
      { path: 'area', data: { d: 'group' }, children: [{ path: 'page', component: LabM24Profile }] },
    ]);
    const page = await harness.navigateByUrl('/area/page', LabM24Profile);
    expect(page).toBeInstanceOf(LabM24Profile);
    expect(text(harness)).toBe('profile');
    const group: ActivatedRouteSnapshot = TestBed.inject(Router).routerState.snapshot.root.firstChild!;
    expect(group.component).toBeNull();
    expect(group.firstChild?.data).toEqual({ d: 'group' });
  });

  it('Section 3: routerOutletData reaches the routed component through ROUTER_OUTLET_DATA', async () => {
    const harness = await create([
      { path: 'themed', component: LabM24ThemedShell, children: [{ path: 'page', component: LabM24Themed }] },
    ]);
    await harness.navigateByUrl('/themed/page');
    expect(text(harness)).toBe('dark');
  });

  it('Section 3: an outlet without routerOutletData provides undefined', async () => {
    const harness = await create([
      { path: 'bare', component: LabM24BareShell, children: [{ path: 'page', component: LabM24DataProbe }] },
    ]);
    await harness.navigateByUrl('/bare/page');
    expect(text(harness)).toBe('undefined');
  });
});
