import { Component } from '@angular/core';

/** A static footer: rendered on the server and never hydrated (`hydrate never`). */
@Component({
  selector: 'lab-m32-incremental-footer',
  template: `<p>Shipping and returns: 30 days.</p>`,
})
export class LabM32IncrementalFooter {}
