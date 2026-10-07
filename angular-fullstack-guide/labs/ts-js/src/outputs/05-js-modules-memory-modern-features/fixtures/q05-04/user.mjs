import { Order } from './order.mjs';

export class User {
  constructor(name) {
    this.name = name;
  }

  firstOrder() {
    return new Order(this);
  }
}
