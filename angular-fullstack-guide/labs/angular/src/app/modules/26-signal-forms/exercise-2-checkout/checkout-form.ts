import { Component, signal } from '@angular/core';
import { FormField, form } from '@angular/forms/signals';
import { CHECKOUT_MESSAGES, Checkout, INITIAL_CHECKOUT } from './checkout-model';
import { checkoutSchema, checkoutWhenSchema } from './checkout-schema';

const CHECKOUT_TEMPLATE = `
  <input id="shipping-street" [formField]="checkoutForm.shipping.street" />
  <input id="shipping-city" [formField]="checkoutForm.shipping.city" />
  <input id="same" type="checkbox" [formField]="checkoutForm.sameAsShipping" />
  @if (!checkoutForm.billing().hidden()) {
    <input id="billing-street" [formField]="checkoutForm.billing.street" />
    <input id="billing-city" [formField]="checkoutForm.billing.city" />
  }
  <input id="company" type="checkbox" [formField]="checkoutForm.isCompany" />
  <input id="vat" [formField]="checkoutForm.vat" />
  @for (e of checkoutForm.vat().errors(); track e.kind) {
    <p class="error vat-error">{{ message(e.kind) }}</p>
  }
  <input id="order" type="date" [formField]="checkoutForm.orderDate" />
  <input id="delivery" type="date" [formField]="checkoutForm.deliveryDate" />
  @for (e of checkoutForm.deliveryDate().errors(); track e.kind) {
    <p class="error delivery-error">{{ message(e.kind) }}</p>
  }
`;

@Component({
  selector: 'lab-m26-checkout-form',
  imports: [FormField],
  template: CHECKOUT_TEMPLATE,
})
export class LabM26CheckoutForm {
  readonly model = signal<Checkout>(structuredClone(INITIAL_CHECKOUT));
  readonly checkoutForm = form(this.model, checkoutSchema);

  protected message(kind: string): string {
    return CHECKOUT_MESSAGES[kind] ?? kind;
  }
}

/** The alternative: the same form with VAT required through `when`. */
@Component({
  selector: 'lab-m26-checkout-when-form',
  imports: [FormField],
  template: CHECKOUT_TEMPLATE,
})
export class LabM26CheckoutWhenForm {
  readonly model = signal<Checkout>(structuredClone(INITIAL_CHECKOUT));
  readonly checkoutForm = form(this.model, checkoutWhenSchema);

  protected message(kind: string): string {
    return CHECKOUT_MESSAGES[kind] ?? kind;
  }
}
