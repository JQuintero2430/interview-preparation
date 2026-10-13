export interface Action {
  readonly type: string;
}

export interface CartItem {
  readonly id: number;
  readonly name: string;
  /** Price in cents. */
  readonly price: number;
  readonly qty: number;
}

export interface AddItem extends Action {
  readonly type: '[Cart Page] Add Item';
  readonly item: CartItem;
}

export interface RemoveItem extends Action {
  readonly type: '[Cart Page] Remove Item';
  readonly id: number;
}

export interface SetDiscount extends Action {
  readonly type: '[Cart Page] Set Discount';
  readonly percent: number;
}

export interface OpenCart extends Action {
  readonly type: '[Cart Page] Open Cart';
}

export type CartAction = AddItem | RemoveItem | SetDiscount | OpenCart;

export const addItem = (item: CartItem): AddItem => ({ type: '[Cart Page] Add Item', item });
export const removeItem = (id: number): RemoveItem => ({ type: '[Cart Page] Remove Item', id });
export const setDiscount = (percent: number): SetDiscount => ({
  type: '[Cart Page] Set Discount',
  percent,
});
export const openCart = (): OpenCart => ({ type: '[Cart Page] Open Cart' });
