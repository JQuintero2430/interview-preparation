import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** A page with no data, so a client-side navigation away from the products and back is observable. */
@Component({
  selector: 'lab-m32-ex3-other',
  imports: [RouterLink],
  template: `
    <h2>Fetch once: the other page</h2>
    <a routerLink="../products">Back to the products</a>
  `,
})
export class LabM32Ex3Other {}
