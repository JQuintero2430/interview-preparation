import { User } from './user.mjs';

export class Order {
  constructor(user) {
    this.owner = user.name;
  }
}

export function createGuest() {
  return new User('guest');
}
