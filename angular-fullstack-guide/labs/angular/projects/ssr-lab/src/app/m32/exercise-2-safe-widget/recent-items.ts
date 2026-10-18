import { afterNextRender, Component, DOCUMENT, inject, signal } from '@angular/core';
import { LAB_M32_EX2_KEY, LabM32Ex2RecentList, labM32Ex2Parse, labM32Ex2Push } from './recent-list';
import { LabM32Ex2ViewportBadge } from './viewport-badge';

/** Solution: the storage is read after the first render, through the injected `DOCUMENT`. */
@Component({
  selector: 'lab-m32-ex2-recent-items',
  imports: [LabM32Ex2ViewportBadge, LabM32Ex2RecentList],
  template: `
    <h2>Widget: viewport and recent items</h2>
    <lab-m32-ex2-viewport-badge />
    <lab-m32-ex2-recent-list [items]="items()" (viewed)="view($event)" />
  `,
})
export class LabM32Ex2RecentItems {
  private readonly document = inject(DOCUMENT);
  protected readonly items = signal<readonly string[]>([]);

  constructor() {
    afterNextRender(() => this.items.set(labM32Ex2Parse(this.document.defaultView?.localStorage.getItem(LAB_M32_EX2_KEY))));
  }

  protected view(name: string): void {
    const next = labM32Ex2Push(this.items(), name);
    this.items.set(next);
    this.document.defaultView?.localStorage.setItem(LAB_M32_EX2_KEY, next.join(','));
  }
}
