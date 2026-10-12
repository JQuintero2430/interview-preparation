import { Component, computed, inject, signal } from '@angular/core';
import { DashboardTitle, TitleSlot } from './title-slot';

@Component({
  selector: 'lab-m20-dashboard',
  imports: [TitleSlot],
  providers: [DashboardTitle],
  template: `
    <h2>{{ title.text() }}</h2>
    <p>Total {{ total() }}</p>
    <lab-m20-title-slot label="Sales" [items]="items()" />
  `,
})
export class Dashboard {
  protected readonly title = inject(DashboardTitle);
  readonly items = signal<readonly number[]>([10, 20]);
  readonly total = computed(() => this.items().reduce((sum, price) => sum + price, 0));

  add(): void {
    this.items.update((items) => [...items, 5]);
  }
}
