import { guest } from './order.mjs';
import { User } from './user.mjs';

console.log(guest.name, new User('ada').firstOrder().owner);
