import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component, Injectable, computed, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import type { Observable } from 'rxjs';

interface LabM29Line {
  readonly name: string;
  readonly qty: number;
}

/** A pure function: no Angular, no DOM. */
function labM29ItemCount(lines: readonly LabM29Line[]): number {
  return lines.reduce((sum, line) => sum + line.qty, 0);
}

@Component({
  selector: 'lab-m29-cart-line',
  template: '{{ item().name }} x{{ item().qty }};',
})
class LabM29CartLine {
  readonly item = input.required<LabM29Line>();
}

/** Same selector and input as the real child, a fake template. */
@Component({
  selector: 'lab-m29-cart-line',
  template: 'stub:{{ item().name }};',
})
class LabM29CartLineStub {
  readonly item = input.required<LabM29Line>();
}

@Component({
  selector: 'lab-m29-cart',
  imports: [LabM29CartLine],
  template: '@for (line of lines(); track line.name) {<lab-m29-cart-line [item]="line" />}{{ count() }} items',
})
class LabM29Cart {
  protected readonly lines = signal<readonly LabM29Line[]>([
    { name: 'Pen', qty: 2 },
    { name: 'Ink', qty: 1 },
  ]);
  protected readonly count = computed(() => labM29ItemCount(this.lines()));
}

interface LabM29Order {
  readonly id: number;
  readonly item: string;
}

const NO_ORDERS: readonly LabM29Order[] = [];

@Injectable({ providedIn: 'root' })
class LabM29OrdersApi {
  private readonly http = inject(HttpClient);

  list(): Observable<readonly LabM29Order[]> {
    return this.http.get<readonly LabM29Order[]>('/api/orders');
  }
}

@Component({
  selector: 'lab-m29-orders-page',
  template: '@for (order of orders(); track order.id) {<p>{{ order.item }}</p>}@empty {<p>loading</p>}',
})
class LabM29OrdersPage {
  protected readonly orders = toSignal(inject(LabM29OrdersApi).list(), { initialValue: NO_ORDERS });
}

const routes = [{ path: 'orders', component: LabM29OrdersPage }];

describe('Section 1: what to test where', () => {
  it('Section 1: a unit test of a pure function needs no TestBed', () => {
    expect(labM29ItemCount([{ name: 'Pen', qty: 2 }, { name: 'Ink', qty: 1 }])).toBe(3);
    expect(labM29ItemCount([])).toBe(0);
  });

  it('Section 1: a deep component test renders the real child', async () => {
    const fixture = TestBed.createComponent(LabM29Cart);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toBe('Pen x2;Ink x1;3 items');
    expect(fixture.debugElement.queryAll(By.directive(LabM29CartLine))).toHaveLength(2);
  });

  it('Section 1: a shallow test replaces the child with a stub', async () => {
    TestBed.overrideComponent(LabM29Cart, { set: { imports: [LabM29CartLineStub] } });
    const fixture = TestBed.createComponent(LabM29Cart);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toBe('stub:Pen;stub:Ink;3 items');
    expect(fixture.debugElement.queryAll(By.directive(LabM29CartLine))).toHaveLength(0);
    expect(fixture.debugElement.queryAll(By.directive(LabM29CartLineStub))).toHaveLength(2);
  });

  describe('with HTTP faked', () => {
    afterEach(() => TestBed.inject(HttpTestingController).verify());

    it('Section 1: an integration test runs the page, its service and HTTP together', async () => {
      TestBed.configureTestingModule({
        providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter(routes)],
      });
      const harness = await RouterTestingHarness.create();
      await harness.navigateByUrl('/orders', LabM29OrdersPage);
      expect(TestBed.inject(Router).url).toBe('/orders');
      expect(harness.routeNativeElement?.textContent).toBe('loading');

      const request = TestBed.inject(HttpTestingController).expectOne('/api/orders');
      expect(request.request.method).toBe('GET');
      request.flush([
        { id: 1, item: 'Pen' },
        { id: 2, item: 'Ink' },
      ]);
      harness.detectChanges();
      expect(harness.routeNativeElement?.textContent).toBe('PenInk');
    });
  });
});
