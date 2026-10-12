import { applyWhen, hidden, required, schema, validate } from '@angular/forms/signals';
import type { SchemaPathTree } from '@angular/forms/signals';
import { Checkout } from './checkout-model';

function addressAndDateRules(p: SchemaPathTree<Checkout>): void {
  required(p.shipping.street);
  required(p.shipping.city);
  hidden(p.billing, { when: ({ valueOf }) => valueOf(p.sameAsShipping) });
  required(p.billing.street);
  required(p.billing.city);
  validate(p.deliveryDate, ({ value, valueOf }) => {
    const order = valueOf(p.orderDate);
    return value() !== '' && order !== '' && value() < order ? { kind: 'beforeOrder' } : undefined;
  });
}

/** The exported schema: any model shaped like `Checkout` can use it. */
export const checkoutSchema = schema<Checkout>((p) => {
  addressAndDateRules(p);
  applyWhen(
    p,
    ({ valueOf }) => valueOf(p.isCompany),
    schema<Checkout>((q) => required(q.vat)),
  );
});

/** The alternative: VAT required through the `when` option of `required`. */
export const checkoutWhenSchema = schema<Checkout>((p) => {
  addressAndDateRules(p);
  required(p.vat, { when: ({ valueOf }) => valueOf(p.isCompany) });
});
