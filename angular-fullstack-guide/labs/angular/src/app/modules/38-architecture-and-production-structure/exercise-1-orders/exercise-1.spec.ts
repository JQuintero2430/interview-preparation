import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Provider } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideOrdersFacadeA } from './a/orders-facade';
import { provideOrdersFacadeB } from './b/orders-facade';
import { HttpOrdersApi, ORDERS_API, Order, OrdersApi } from './data-access/orders-api';
import { LabM38Ex1OrdersContainer } from './orders-container';
import { LOAD_ERROR_MESSAGE } from './orders-facade.token';
import { LabM38Ex1OrderList } from './ui/order-list';

const ada: Order = { id: 1, customer: 'Ada', status: 'open' };
const bob: Order = { id: 2, customer: 'Bob', status: 'shipped' };

const host = (fixture: ComponentFixture<unknown>): HTMLElement => fixture.nativeElement;

const rows = (fixture: ComponentFixture<unknown>): string[] =>
  Array.from(host(fixture).querySelectorAll('li'), (li) => li.textContent?.trim() ?? '');

const click = (fixture: ComponentFixture<unknown>, selector: string): void =>
  host(fixture).querySelector<HTMLButtonElement>(selector)?.click();

describe('Exercise 38.1 · the presentational list', () => {
  it('renders the order list from inputs alone, with no injected services', async () => {
    TestBed.configureTestingModule({ providers: [] });
    const fixture = TestBed.createComponent(LabM38Ex1OrderList);
    fixture.componentRef.setInput('orders', [ada, bob]);
    await fixture.whenStable();

    expect(rows(fixture)).toEqual(['Ada (open)', 'Bob (shipped)']);
  });
});

const variants: readonly (readonly [string, () => Provider[]])[] = [
  ['a (service with signals)', provideOrdersFacadeA],
  ['b (signalStore)', provideOrdersFacadeB],
];

describe.each(variants)('Exercise 38.1 · facade variant %s', (_name, provideFacade) => {
  function setUpWithHttp(): HttpTestingController {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ORDERS_API, useClass: HttpOrdersApi },
        provideFacade(),
      ],
    });
    return TestBed.inject(HttpTestingController);
  }

  function setUpWithFake(api: OrdersApi): void {
    TestBed.configureTestingModule({ providers: [{ provide: ORDERS_API, useValue: api }, provideFacade()] });
  }

  it('filters the list when the filter emits a status', async () => {
    setUpWithFake({ list: () => of([ada, bob]) });
    const fixture = TestBed.createComponent(LabM38Ex1OrdersContainer);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(rows(fixture)).toEqual(['Ada (open)', 'Bob (shipped)']);

    click(fixture, 'button[data-status="shipped"]');
    await fixture.whenStable();
    expect(rows(fixture)).toEqual(['Bob (shipped)']);

    click(fixture, 'button:not([data-status]):not([data-action])');
    await fixture.whenStable();
    expect(rows(fixture)).toEqual(['Ada (open)', 'Bob (shipped)']);
  });

  it('loads orders through the facade when the container starts', async () => {
    const controller = setUpWithHttp();
    const fixture = TestBed.createComponent(LabM38Ex1OrdersContainer);
    fixture.detectChanges();

    const req = controller.expectOne('/api/orders');
    expect(req.request.method).toBe('GET');
    req.flush([ada, bob]);
    await fixture.whenStable();

    expect(rows(fixture)).toEqual(['Ada (open)', 'Bob (shipped)']);
    controller.verify();
  });

  it('shows an error message and keeps the previous orders when a reload fails', async () => {
    const controller = setUpWithHttp();
    const fixture = TestBed.createComponent(LabM38Ex1OrdersContainer);
    fixture.detectChanges();
    controller.expectOne('/api/orders').flush([ada, bob]);
    await fixture.whenStable();

    click(fixture, 'button[data-action="reload"]');
    controller.expectOne('/api/orders').flush('down', { status: 500, statusText: 'Server Error' });
    await fixture.whenStable();

    expect(host(fixture).querySelector('[role="alert"]')?.textContent).toBe(LOAD_ERROR_MESSAGE);
    expect(rows(fixture)).toEqual(['Ada (open)', 'Bob (shipped)']);
    controller.verify();
  });

  it('lets a test replace the HTTP service without changing the container', async () => {
    let calls = 0;
    setUpWithFake({
      list: () => {
        calls += 1;
        return of([{ id: 9, customer: 'Fake Ltd', status: 'open' }]);
      },
    });
    const fixture = TestBed.createComponent(LabM38Ex1OrdersContainer);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(calls).toBe(1);
    expect(rows(fixture)).toEqual(['Fake Ltd (open)']);
  });
});
