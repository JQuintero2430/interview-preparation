import { Component, DOCUMENT, ElementRef, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/** Adds a node with the DOM API before Angular takes over its template: hydration no longer finds what the server wrote. */
@Component({
  selector: 'lab-m32-sales-chart',
  template: `Weekly sales <strong>42</strong>`,
})
export class LabM32SalesChart {
  constructor() {
    if (isPlatformBrowser(inject(PLATFORM_ID))) {
      const canvas = inject(DOCUMENT).createElement('canvas');
      inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.prepend(canvas);
    }
  }
}

@Component({
  selector: 'lab-m32-hydration-dom-append',
  imports: [LabM32SalesChart],
  template: `
    <h2>Hydration: DOM added outside Angular</h2>
    <lab-m32-sales-chart />
  `,
})
export class LabM32HydrationDomAppend {}
