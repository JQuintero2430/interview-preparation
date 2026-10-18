import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { OrdersFacadePort } from '../sample-app/features/orders/data-access/orders-facade';
import { LabM38OrdersPage } from '../sample-app/features/orders/feature/orders-page';
import { LabM38OrderList, OrderRow } from '../sample-app/features/orders/ui/order-list';

const rows = (el: HTMLElement): string[] =>
  Array.from(el.querySelectorAll('button'), (button) => button.textContent ?? '');

describe('Module 38 · section 2', () => {
  it('Section 2: the presentational list renders only from its inputs and has no injected services', () => {
    TestBed.configureTestingModule({ providers: [] });
    const fixture = TestBed.createComponent(LabM38OrderList);
    fixture.componentRef.setInput('orders', [{ id: 1, customer: 'Ada' }, { id: 2, customer: 'Grace' }]);
    fixture.detectChanges();
    expect(rows(fixture.nativeElement)).toEqual(['Ada', 'Grace']);
  });

  it('Section 2: the presentational list emits select with the row id', () => {
    const fixture = TestBed.createComponent(LabM38OrderList);
    fixture.componentRef.setInput('orders', [{ id: 7, customer: 'Ada' }]);
    const emitted: number[] = [];
    fixture.componentInstance.select.subscribe((id) => emitted.push(id));
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button').click();
    expect(emitted).toEqual([7]);
  });

  it('Section 2: the container passes the facade\'s signals to the list and calls the facade on select', () => {
    const orders = signal<readonly OrderRow[]>([{ id: 3, customer: 'Linus' }]);
    const selected: number[] = [];
    TestBed.configureTestingModule({
      providers: [{ provide: OrdersFacadePort, useValue: { orders, select: (id: number) => selected.push(id) } }],
    });
    const fixture = TestBed.createComponent(LabM38OrdersPage);
    fixture.detectChanges();
    expect(rows(fixture.nativeElement)).toEqual(['Linus']);

    orders.set([{ id: 3, customer: 'Linus' }, { id: 4, customer: 'Margaret' }]);
    fixture.detectChanges();
    expect(rows(fixture.nativeElement)).toEqual(['Linus', 'Margaret']);

    fixture.nativeElement.querySelector('button').click();
    expect(selected).toEqual([3]);
  });

  it('Section 2: an in-place mutation of the input array is not rendered until the container passes a new array', () => {
    const fixture = TestBed.createComponent(LabM38OrderList);
    const list: OrderRow[] = [{ id: 1, customer: 'Ada' }];
    fixture.componentRef.setInput('orders', list);
    fixture.detectChanges();

    list.push({ id: 2, customer: 'Grace' });
    fixture.componentRef.setInput('orders', list);
    fixture.detectChanges();
    expect(rows(fixture.nativeElement)).toEqual(['Ada']);

    fixture.componentRef.setInput('orders', [...list]);
    fixture.detectChanges();
    expect(rows(fixture.nativeElement)).toEqual(['Ada', 'Grace']);
  });
});
