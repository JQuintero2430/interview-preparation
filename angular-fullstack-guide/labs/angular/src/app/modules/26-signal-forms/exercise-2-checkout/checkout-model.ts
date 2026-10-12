export interface Address {
  street: string;
  city: string;
}

export interface Checkout {
  shipping: Address;
  billing: Address;
  sameAsShipping: boolean;
  isCompany: boolean;
  vat: string;
  orderDate: string;
  deliveryDate: string;
}

export const INITIAL_CHECKOUT: Checkout = {
  shipping: { street: '', city: '' },
  billing: { street: '', city: '' },
  sameAsShipping: true,
  isCompany: false,
  vat: '',
  orderDate: '',
  deliveryDate: '',
};

export const CHECKOUT_MESSAGES: Readonly<Record<string, string>> = {
  required: 'This field is required',
  beforeOrder: 'Delivery cannot be before the order date',
};
