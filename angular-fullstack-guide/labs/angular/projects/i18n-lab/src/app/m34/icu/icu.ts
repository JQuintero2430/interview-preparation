import { Component, signal } from '@angular/core';

// Section 5 of module 34: one ICU plural whose branches each language chooses for itself.
@Component({
  selector: 'lab-m34-icu',
  template: `
    <div role="group" aria-label="Item count" i18n-aria-label="@@m34.icu.group">
      @for (n of counts; track n) {
        <button type="button" (click)="count.set(n)">{{ n }}</button>
      }
    </div>
    <p data-testid="items" i18n="@@m34.icu.items">{count(), plural, =0 {No items} one {One item} other {{{ count() }} items}}</p>
  `,
})
export class LabM34Icu {
  protected readonly counts = [0, 1, 2, 3, 11];
  protected readonly count = signal(0);
}
