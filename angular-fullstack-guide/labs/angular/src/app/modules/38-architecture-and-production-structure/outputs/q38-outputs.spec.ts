import { Component, inject, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import * as angular from 'prettier/plugins/angular';
import * as estree from 'prettier/plugins/estree';
import * as html from 'prettier/plugins/html';
import * as typescript from 'prettier/plugins/typescript';
import { format } from 'prettier/standalone';
import { Observable, of, throwError } from 'rxjs';
import { ORDERS_API, Order, OrdersApi } from '../sample-app/features/orders/data-access/orders-api';
import { OrdersFacade, provideOrdersDataAccess } from '../sample-app/features/orders/data-access/orders-facade';
import { LabM38OrderList, OrderRow } from '../sample-app/features/orders/ui/order-list';

// Output questions of module 38 (jsdom half). The Prettier test is the C4 probe: the browser build
// of Prettier cannot read files, so the options of labs/angular/.prettierrc are inlined here
// (printWidth 100, singleQuote true, and the `*.html` override's parser: 'angular').
const WORKSPACE_PRETTIERRC = { printWidth: 100, singleQuote: true, parser: 'angular' } as const;

describe('Module 38 outputs', () => {
  it('Section 9: Prettier with the workspace .prettierrc formats a template with the angular parser', async () => {
    const source =
      `@if (user(); as u) {<a class="nav-link active" [routerLink]="['/users', u.id]" [class.disabled]="busy()" (click)="track(u)">{{ u.name }}</a>}`;

    const formatted = await format(source, {
      ...WORKSPACE_PRETTIERRC,
      plugins: [angular, html, estree, typescript],
    });

    expect(formatted).toBe(
      [
        '@if (user(); as u) {',
        '  <a',
        '    class="nav-link active"',
        `    [routerLink]="['/users', u.id]"`,
        '    [class.disabled]="busy()"',
        '    (click)="track(u)"',
        '    >{{ u.name }}</a',
        '  >',
        '}',
        '',
      ].join('\n'),
    );
  });

  it('Q38.05: a presentational list shows a new array, then keeps the old rows after an in-place push until a new array arrives', () => {
    @Component({
      selector: 'lab-m38-q05-container',
      imports: [LabM38OrderList],
      template: `<lab-m38-order-list [orders]="orders()" />`,
    })
    class Container {
      readonly orders = signal<OrderRow[]>([{ id: 1, customer: 'Ada' }]);
    }
    const rows = (el: HTMLElement): string[] =>
      Array.from(el.querySelectorAll('button'), (button) => button.textContent ?? '');

    const fixture = TestBed.createComponent(Container);
    fixture.detectChanges();
    expect(rows(fixture.nativeElement)).toEqual(['Ada']);

    // Step 1: the container hands over a new array.
    fixture.componentInstance.orders.set([{ id: 1, customer: 'Ada' }, { id: 2, customer: 'Grace' }]);
    fixture.detectChanges();
    expect(rows(fixture.nativeElement)).toEqual(['Ada', 'Grace']);

    // Step 2: the container mutates that same array in place; no new reference, no event.
    fixture.componentInstance.orders().push({ id: 3, customer: 'Linus' });
    fixture.detectChanges();
    expect(rows(fixture.nativeElement)).toEqual(['Ada', 'Grace']);

    // Step 3: a new array makes all rows appear.
    fixture.componentInstance.orders.update((list) => [...list]);
    fixture.detectChanges();
    expect(rows(fixture.nativeElement)).toEqual(['Ada', 'Grace', 'Linus']);
  });

  it('Q38.09: the second load reaches the fake and fails; the container shows the error and still lists the first orders', () => {
    const calls: number[] = [];
    const fake: OrdersApi = {
      list(): Observable<readonly Order[]> {
        calls.push(calls.length + 1);
        return calls.length === 1
          ? of([{ id: 1, customer: 'Ada' }, { id: 2, customer: 'Grace' }])
          : throwError(() => ({ kind: 'server', status: 503 }));
      },
    };

    @Component({
      selector: 'lab-m38-q09-container',
      imports: [LabM38OrderList],
      template: `
        <lab-m38-order-list [orders]="facade.orders()" />
        @if (facade.error(); as error) {
          <p role="alert">Orders failed: {{ error.kind }}</p>
        }
      `,
    })
    class Container {
      protected readonly facade = inject(OrdersFacade);
      load(): void {
        this.facade.load();
      }
    }

    TestBed.configureTestingModule({
      providers: [...provideOrdersDataAccess(), { provide: ORDERS_API, useValue: fake }],
    });
    const fixture = TestBed.createComponent(Container);
    const rows = (): string[] =>
      Array.from(fixture.nativeElement.querySelectorAll('button'), (b) => (b as HTMLElement).textContent ?? '');
    const alert = (): string | null => fixture.nativeElement.querySelector('[role=alert]')?.textContent ?? null;
    fixture.detectChanges();
    expect(calls).toEqual([]);
    expect(rows()).toEqual([]);

    // Call 1 succeeds.
    fixture.componentInstance.load();
    fixture.detectChanges();
    expect(calls).toEqual([1]);
    expect(rows()).toEqual(['Ada', 'Grace']);
    expect(alert()).toBeNull();

    // Call 2 fails: the error is shown, the first orders stay.
    fixture.componentInstance.load();
    fixture.detectChanges();
    expect(calls).toEqual([1, 2]);
    expect(rows()).toEqual(['Ada', 'Grace']);
    expect(alert()).toBe('Orders failed: server');
  });

  it('Q38.25: Prettier with the ng new .prettierrc breaks the four attributes of a long line onto their own lines and keeps the @if braces', async () => {
    const source =
      `@if (order(); as o) {<a class="nav-link" [routerLink]="['/orders', o.id]" [class.active]="isActive()" (click)="open(o)">{{ o.name }}</a>}`;

    const formatted = await format(source, {
      ...WORKSPACE_PRETTIERRC,
      plugins: [angular, html, estree, typescript],
    });

    expect(formatted).toBe(
      [
        '@if (order(); as o) {',
        '  <a',
        '    class="nav-link"',
        `    [routerLink]="['/orders', o.id]"`,
        '    [class.active]="isActive()"',
        '    (click)="open(o)"',
        '    >{{ o.name }}</a',
        '  >',
        '}',
        '',
      ].join('\n'),
    );
  });
});
