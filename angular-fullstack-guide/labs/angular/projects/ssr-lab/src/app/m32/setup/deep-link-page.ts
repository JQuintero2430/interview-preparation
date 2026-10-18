import { Component } from '@angular/core';

/** Served at the nested path `/m32/setup/orders/42`, which no file in `browser/` matches. */
@Component({
  selector: 'lab-m32-setup-deep-link',
  template: `<h2>Order 42 detail</h2>`,
})
export class LabM32SetupDeepLink {}
