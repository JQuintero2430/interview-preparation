import { afterNextRender, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

/** A page that links to the product, so the product page can be reached by a client-side navigation. */
@Component({
  selector: 'lab-m32-ex4-start',
  imports: [RouterLink],
  template: `
    <h2>Office furniture</h2>
    <p>Page: <output aria-label="Page state">{{ state() }}</output></p>
    <a routerLink="../product">Open the office chair</a>
  `,
})
export class LabM32Ex4Start {
  protected readonly state = signal('server');

  constructor() {
    afterNextRender(() => this.state.set('hydrated'));
  }
}
