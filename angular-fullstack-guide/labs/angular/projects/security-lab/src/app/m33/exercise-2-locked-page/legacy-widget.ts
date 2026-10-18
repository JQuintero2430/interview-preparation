import { Component, ElementRef, afterRenderEffect, input, viewChild } from '@angular/core';

/**
 * Exercise 33.2, the starting point: a "legacy widget" that writes the comment's HTML into the page itself.
 * Without a policy the markup goes in unchecked; under `require-trusted-types-for 'script'` the write throws.
 */
@Component({
  selector: 'lab-m33-ex2-legacy-widget',
  template: `<div #box></div>`,
})
export class LabM33Ex2LegacyWidget {
  readonly html = input.required<string>();
  private readonly box = viewChild.required<ElementRef<HTMLElement>>('box');

  constructor() {
    afterRenderEffect(() => {
      const html = this.html();
      if (html !== '') this.box().nativeElement.innerHTML = html;
    });
  }
}
