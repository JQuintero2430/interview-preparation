// Exercise 44.3: the checkout page. It reads two flags through `FLAGS`, so either variant can back it; both flags are
// read on every render, so a context change re-evaluates each once in either variant.
import { Component, inject } from '@angular/core';
import { FLAGS } from './flags';

@Component({
  selector: 'lab-m44-checkout',
  template: `
    @if (newCheckout()) {
      <section data-checkout="new">One-page checkout</section>
    } @else {
      <section data-checkout="classic">Classic checkout</section>
    }
    @if (expressPay()) {
      <button type="button">Express pay</button>
    }
  `,
})
export class Checkout {
  private readonly flags = inject(FLAGS);

  protected readonly newCheckout = this.flags.flag('new-checkout', false);
  protected readonly expressPay = this.flags.flag('express-pay', false);
}
