import { afterNextRender, Component, inject, signal } from '@angular/core';
import { LabM32Ex2RecentList, labM32Ex2Push } from './recent-list';
import { LAB_M32_EX2_RECENT_STORE } from './recent-store';
import { LabM32Ex2ViewportBadge } from './viewport-badge';

/** Alternative: the same widget reads through a store the route provides; it still reads after the first render. */
@Component({
  selector: 'lab-m32-ex2-stored-recent-items',
  imports: [LabM32Ex2ViewportBadge, LabM32Ex2RecentList],
  template: `
    <h2>Widget: viewport and recent items</h2>
    <lab-m32-ex2-viewport-badge />
    <lab-m32-ex2-recent-list [items]="items()" (viewed)="view($event)" />
  `,
})
export class LabM32Ex2StoredRecentItems {
  private readonly store = inject(LAB_M32_EX2_RECENT_STORE);
  protected readonly items = signal<readonly string[]>([]);

  constructor() {
    afterNextRender(() => this.items.set(this.store.read()));
  }

  protected view(name: string): void {
    const next = labM32Ex2Push(this.items(), name);
    this.items.set(next);
    this.store.write(next);
  }
}
