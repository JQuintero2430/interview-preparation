import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ORDERS_API, OrdersApi } from '../sample-app/features/orders/data-access/orders-api';
import { OrdersFacade, provideOrdersDataAccess } from '../sample-app/features/orders/data-access/orders-facade';
import { LabM38OrdersPage } from '../sample-app/features/orders/feature/orders-page';

const rows = (el: HTMLElement): string[] =>
  Array.from(el.querySelectorAll('button'), (button) => button.textContent ?? '');

describe('Module 38 · section 3', () => {
  let facade: OrdersFacade;
  let controller: HttpTestingController;

  function setUpWithHttp(): void {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideOrdersDataAccess()],
    });
    facade = TestBed.inject(OrdersFacade);
    controller = TestBed.inject(HttpTestingController);
  }

  it('Section 3: the facade exposes orders loaded through the data-access service', () => {
    setUpWithHttp();
    facade.load();
    expect(facade.loading()).toBe(true);

    const req = controller.expectOne('/api/orders');
    expect(req.request.method).toBe('GET');
    req.flush([{ order_id: 1, customer_name: 'Ada' }]);

    expect(facade.orders()).toEqual([{ id: 1, customer: 'Ada' }]);
    expect(facade.loading()).toBe(false);
    expect(facade.error()).toBeNull();
    controller.verify();
  });

  it('Section 3: the facade maps an HTTP error to an error state and keeps the previous orders', () => {
    setUpWithHttp();
    facade.load();
    controller.expectOne('/api/orders').flush([{ order_id: 1, customer_name: 'Ada' }]);

    facade.load();
    controller.expectOne('/api/orders').flush('down', { status: 500, statusText: 'Server Error' });

    expect(facade.error()).toEqual({ kind: 'server', status: 500 });
    expect(facade.orders()).toEqual([{ id: 1, customer: 'Ada' }]);
    expect(facade.loading()).toBe(false);
    controller.verify();
  });

  it('Section 3: replacing the API token with a fake changes no component code', () => {
    const fake: OrdersApi = { list: () => of([{ id: 9, customer: 'Fake Ltd' }]) };
    TestBed.configureTestingModule({
      providers: [provideOrdersDataAccess(), { provide: ORDERS_API, useValue: fake }],
    });
    const fixture = TestBed.createComponent(LabM38OrdersPage);
    TestBed.inject(OrdersFacade).load();
    fixture.detectChanges();
    expect(rows(fixture.nativeElement)).toEqual(['Fake Ltd']);

    fixture.nativeElement.querySelector('button').click();
    expect(TestBed.inject(OrdersFacade).selectedId()).toBe(9);
  });
});
