import { TestBed } from '@angular/core/testing';
import { Route } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { sampleAppConfig } from '../sample-app/core/sample-app.config';
import { LabM38AppShell } from '../sample-app/app-shell';
import { sampleRoutes } from '../sample-app/routes';

describe('Module 38 · section 1', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: sampleAppConfig.providers }));

  it('Section 1: each feature folder is reached only through its lazy route', async () => {
    const children: readonly Route[] = sampleRoutes[0]?.children ?? [];
    const lazy = children.filter((route) => route.loadChildren !== undefined && route.component === undefined);
    expect(lazy.map((route) => route.path)).toEqual(['orders', 'catalog']);

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/orders', LabM38AppShell);
    expect(harness.routeNativeElement?.querySelector('h2')?.textContent).toBe('Orders');

    await harness.navigateByUrl('/catalog', LabM38AppShell);
    expect(harness.routeNativeElement?.querySelector('h2')?.textContent).toBe('Catalog');
  });
});
