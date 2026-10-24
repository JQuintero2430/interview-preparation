import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { type ApplyResult, type Customer, type FieldError, SERVER_ERROR, applyFieldErrors, fieldOrder } from '../server-errors';

function itemRow(item: Customer['items'][number]) {
  return new FormGroup({
    sku: new FormControl(item.sku, { nonNullable: true }),
    quantity: new FormControl(item.quantity, { nonNullable: true }),
  });
}

/** Variant a: a reactive form over the model, with a nested `address` group and an `items` array. */
export function customerForm(value: Customer) {
  return new FormGroup({
    email: new FormControl(value.email, { nonNullable: true }),
    address: new FormGroup({
      street: new FormControl(value.address.street, { nonNullable: true }),
      city: new FormControl(value.address.city, { nonNullable: true }),
    }),
    items: new FormArray(value.items.map(itemRow)),
  });
}

export type CustomerForm = ReturnType<typeof customerForm>;

/** Sets a `server` error on each control a pointer resolves to; the control's next validation run replaces it. */
export function applyToReactive(form: CustomerForm, errors: readonly FieldError[]): ApplyResult {
  return applyFieldErrors(errors, fieldOrder(form.getRawValue()), (tokens, detail) => {
    const control = form.get([...tokens]);
    control?.setErrors({ [SERVER_ERROR]: detail });
    return control !== null;
  });
}
