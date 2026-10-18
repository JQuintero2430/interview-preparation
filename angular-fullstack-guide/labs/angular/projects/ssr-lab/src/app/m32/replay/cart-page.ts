import { Component, signal } from '@angular/core';

/** A cart with one listener: a click on the button before hydration is queued and replayed. */
@Component({
  selector: 'lab-m32-replay-cart',
  template: `
    <h2>Event replay: cart</h2>
    <p>Items in cart: <output>{{ items() }}</output></p>
    <button type="button" (click)="items.set(items() + 1)">Add to cart</button>
    <p>This paragraph has no listener.</p>
  `,
})
export class LabM32ReplayCart {
  protected readonly items = signal(0);
}
