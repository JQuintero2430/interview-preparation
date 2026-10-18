import { Component } from '@angular/core';

/** A static footer with no listener: rendered on the server and never hydrated. */
@Component({
  selector: 'lab-m32-ex4-footer',
  template: `<p>Free delivery on orders over 50 euros.</p>`,
})
export class LabM32Ex4Footer {}
