import { CommonModule, NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LegacyOrderList } from './legacy/legacy-order-list';
import { Order, OrderStatus } from './order';
import { OrderList } from './order-list';

const orders: readonly Order[] = [
  { id: 1, label: 'tea', status: 'new' },
  { id: 2, label: 'cake', status: 'paid' },
  { id: 3, label: 'jam', status: 'shipped' },
  { id: 4, label: 'ink', status: 'lost' },
];

// The private ɵcmp definition holds the directives and pipes a component's template may use.
interface ComponentDefinition {
  dependencies: unknown[] | null;
}

function dependenciesOf(type: Type<unknown>): unknown[] {
  return (type as unknown as { ɵcmp: ComponentDefinition }).ɵcmp.dependencies ?? [];
}

function render<T extends LegacyOrderList | OrderList>(
  type: Type<T>,
  value: readonly Order[] | null,
): ComponentFixture<T> {
  const fixture = TestBed.createComponent(type);
  fixture.componentRef.setInput('orders', value);
  fixture.detectChanges();
  return fixture;
}

const textOf = (fixture: ComponentFixture<unknown>): string =>
  (fixture.nativeElement as HTMLElement).textContent?.replace(/\s+/g, ' ').trim() ?? '';

const itemsOf = (fixture: ComponentFixture<unknown>): HTMLElement[] =>
  Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('li'));

describe('E18.1 Convert an order list from structural directives to control flow', () => {
  it('the converted list renders the same text as the legacy list for the same data (up to whitespace)', () => {
    for (const value of [null, [], orders]) {
      expect(textOf(render(OrderList, value))).toBe(textOf(render(LegacyOrderList, value)));
    }
    expect(textOf(render(OrderList, orders))).toBe('tea New cake Paid jam Shipped ink Lost');
  });

  it('the component imports no structural directive', () => {
    const structural: unknown[] = [CommonModule, NgIf, NgFor, NgSwitch, NgSwitchCase, NgSwitchDefault];

    expect(dependenciesOf(OrderList).filter((dep) => structural.includes(dep))).toEqual([]);
    // The same check finds them in the legacy component, so it can fail.
    expect(dependenciesOf(LegacyOrderList)).toEqual(expect.arrayContaining([NgIf, NgFor, NgSwitch]));
  });

  it('an empty list renders the @empty text', () => {
    const fixture = render(OrderList, []);

    expect(itemsOf(fixture).map((li) => li.textContent?.trim())).toEqual(['No orders yet']);
    fixture.componentRef.setInput('orders', orders.slice(0, 1));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.empty')).toBeNull();
  });

  it('each status renders its badge', () => {
    const badges = new Map<OrderStatus, string>([
      ['new', 'New'],
      ['paid', 'Paid'],
      ['shipped', 'Shipped'],
      ['lost', 'Lost'],
    ]);

    for (const [status, badge] of badges) {
      const fixture = render(OrderList, [{ id: 1, label: 'tea', status }]);
      const found = (fixture.nativeElement as HTMLElement).querySelectorAll('.badge');

      expect(Array.from(found, (b) => b.textContent)).toEqual([badge]);
    }
  });

  it('reordering the orders keeps the DOM node of each id', () => {
    const fixture = render(OrderList, orders);
    const before = new Map(itemsOf(fixture).map((li) => [li.dataset['id'], li]));

    // New objects, same ids, reversed: each node must follow its id.
    fixture.componentRef.setInput(
      'orders',
      [...orders].reverse().map((order) => ({ ...order })),
    );
    fixture.detectChanges();

    const after = itemsOf(fixture);
    expect(after.map((li) => li.dataset['id'])).toEqual(['4', '3', '2', '1']);
    for (const li of after) {
      expect(li).toBe(before.get(li.dataset['id']));
    }
  });
});
