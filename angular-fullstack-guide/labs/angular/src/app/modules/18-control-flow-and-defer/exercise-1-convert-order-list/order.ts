export type OrderStatus = 'new' | 'paid' | 'shipped' | 'lost';

export interface Order {
  readonly id: number;
  readonly label: string;
  readonly status: OrderStatus;
}
