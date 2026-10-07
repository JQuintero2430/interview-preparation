import { User } from './user.mjs';

export class Order {
  constructor(user) {
    this.owner = user.name;
  }
}

export const guest = new User('guest');
