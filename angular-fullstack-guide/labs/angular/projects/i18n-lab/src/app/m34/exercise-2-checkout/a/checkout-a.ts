import { CurrencyPipe } from '@angular/common';
import { Component, signal } from '@angular/core';

// Exercise 34.2, variant a: one ICU plural in the template; each language writes the branches it needs.
@Component({
  selector: 'lab-m34-ex2-a',
  imports: [CurrencyPipe],
  template: `
    <h2 i18n="@@m34.ex2.a.heading">Order summary</h2>
    <div role="group">
      @for (n of counts; track n) {
        <button type="button" (click)="count.set(n)">{{ n }}</button>
      }
    </div>
    <!-- prettier-ignore -->
    <p data-testid="summary" i18n="@@m34.ex2.a.items">{count(), plural, one {{{ count() }} item} other {{{ count() }} items}}</p>
    <p>
      <span i18n="@@m34.ex2.a.total">Total</span>:
      <strong data-testid="total">{{ count() * unitPrice | currency: 'EUR' }}</strong>
    </p>
  `,
})
export class LabM34Ex2A {
  protected readonly counts = [0, 1, 2, 3, 11];
  protected readonly count = signal(3);
  protected readonly unitPrice = 12.5;
}
