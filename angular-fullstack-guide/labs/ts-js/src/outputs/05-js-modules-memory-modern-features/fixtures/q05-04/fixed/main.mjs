import { User } from './user.mjs';
import { createGuest } from './order.mjs';

console.log(new User('ada').firstOrder().owner, createGuest().name);
