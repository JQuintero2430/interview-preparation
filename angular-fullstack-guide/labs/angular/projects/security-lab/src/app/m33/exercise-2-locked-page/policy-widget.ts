import { Component, ElementRef, afterRenderEffect, inject, input, viewChild } from '@angular/core';
import { LabM33Ex2WidgetPolicy } from './widget-policy';

/** Exercise 33.2, the alternative: the widget still writes `innerHTML`, but only through its sanitizing policy. */
@Component({
  selector: 'lab-m33-ex2-policy-widget',
  template: `<div #box></div>`,
})
export class LabM33Ex2PolicyWidget {
  readonly html = input.required<string>();
  private readonly box = viewChild.required<ElementRef<HTMLElement>>('box');
  private readonly policy = inject(LabM33Ex2WidgetPolicy);

  constructor() {
    afterRenderEffect(() => {
      const html = this.html();
      if (html !== '') this.policy.write(this.box().nativeElement, html);
    });
  }
}
