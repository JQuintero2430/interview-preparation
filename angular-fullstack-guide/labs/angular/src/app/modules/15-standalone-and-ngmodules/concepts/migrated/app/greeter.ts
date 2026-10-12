import { Injectable } from '@angular/core';

// Migration sample: the greeting service.
@Injectable()
export class Greeter {
  greet(name: string): string {
    return `Hello, ${name}`;
  }
}
