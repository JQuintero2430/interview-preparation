import { HttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ErrorHandler } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingHarness } from '@angular/router/testing';
import { LabM38AppShell } from '../sample-app/app-shell';
import { LabM38ErrorHandler } from '../sample-app/core/error-handler';
import { sampleProductionConfig } from '../sample-app/core/production.config';
import { LabM38OrdersHome } from '../sample-app/features/orders/feature/orders-home';

const texts = (el: Element | null | undefined, selector: string): string[] =>
  Array.from(el?.querySelectorAll(selector) ?? [], (node) => node.textContent?.trim() ?? '');

describe('Module 38 · section 12', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({ providers: [...sampleProductionConfig.providers, provideHttpClientTesting()] }),
  );

  it('Section 12: the sample app renders the shell and both lazy features', async () => {
    const harness = await RouterTestingHarness.create();

    await harness.navigateByUrl('/orders', LabM38AppShell);
    expect(texts(harness.routeNativeElement, 'p')).toEqual(['Sample app']);
    expect(texts(harness.routeNativeElement, 'h2')).toEqual(['Orders']);

    await harness.navigateByUrl('/catalog', LabM38AppShell);
    expect(texts(harness.routeNativeElement, 'h2')).toEqual(['Catalog']);

    await harness.navigateByUrl('/catalog/products', LabM38AppShell);
    expect(texts(harness.routeNativeElement, 'h2')).toEqual(['Products']);
    expect(texts(harness.routeNativeElement, 'li')).toEqual(['Desk', 'Lamp']);
  });

  it('Section 12: core providers are registered once in the application config', async () => {
    const rootHandler = TestBed.inject(ErrorHandler);
    expect(rootHandler).toBeInstanceOf(LabM38ErrorHandler);

    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/orders', LabM38AppShell);
    const featureInjector = harness.routeDebugElement?.query(By.directive(LabM38OrdersHome)).injector;
    expect(featureInjector?.get(ErrorHandler)).toBe(rootHandler);

    featureInjector?.get(HttpClient).get('/api/ping').subscribe();
    const controller = TestBed.inject(HttpTestingController);
    const request = controller.expectOne('/api/ping');
    expect(request.request.headers.getAll('X-Client')).toEqual(['lab-m38-sample-app']);
    request.flush({});
    controller.verify();
  });
});
