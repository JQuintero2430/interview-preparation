import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

interface Order {
  readonly customer: { readonly address: { readonly city: string } };
}

// One @let in the component's own template, read by three kinds of block.
@Component({
  selector: 'lab-m18-s4-blocks',
  template: `
    @let city = order().customer.address.city;
    <p id="top">{{ city }}</p>
    @if (open()) {
      <p id="in-if">{{ city }}</p>
    }
    @for (n of numbers(); track n) {
      <p class="in-for">{{ city }}-{{ n }}</p>
    }
    @defer (on immediate) {
      <p id="in-defer">{{ city }}</p>
    }
  `,
})
class LetBlocks {
  readonly order = signal<Order>({ customer: { address: { city: 'Quito' } } });
  readonly open = signal(true);
  readonly numbers = signal([1, 2]);
}

function text(root: HTMLElement, selector: string): string[] {
  return Array.from(root.querySelectorAll(selector)).map((el) => el.textContent ?? '');
}

describe('Section 4: @let inside blocks', () => {
  it('Section 4: a @let is readable inside @if, @for and @defer blocks', async () => {
    const fixture = TestBed.createComponent(LetBlocks);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    expect(text(root, '#top')).toEqual(['Quito']);
    expect(text(root, '#in-if')).toEqual(['Quito']);
    expect(text(root, '.in-for')).toEqual(['Quito-1', 'Quito-2']);
    expect(text(root, '#in-defer')).toEqual(['Quito']);
  });

  it('Section 4: a @let of a signal call re-evaluates when the signal changes', async () => {
    const fixture = TestBed.createComponent(LetBlocks);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    fixture.componentInstance.order.set({ customer: { address: { city: 'Lima' } } });
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    expect(text(root, '#top')).toEqual(['Lima']);
    expect(text(root, '#in-if')).toEqual(['Lima']);
    expect(text(root, '.in-for')).toEqual(['Lima-1', 'Lima-2']);
    expect(text(root, '#in-defer')).toEqual(['Lima']);
  });
});
