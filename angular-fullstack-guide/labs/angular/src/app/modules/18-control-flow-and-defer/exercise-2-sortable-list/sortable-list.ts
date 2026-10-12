import { Component, computed, signal } from '@angular/core';
import { Item, Row } from './row';

@Component({
  selector: 'lab-m18-e2-sortable-list',
  imports: [Row],
  template: `
    <ul>
      @for (item of sorted(); track item.id) {
        <li [attr.data-id]="item.id"><lab-m18-e2-row [item]="item" /></li>
      }
    </ul>
  `,
})
export class SortableList {
  readonly items = signal<readonly Item[]>([]);
  readonly descending = signal(false);

  protected readonly sorted = computed(() => {
    const direction = this.descending() ? -1 : 1;
    return [...this.items()].sort((a, b) => direction * a.title.localeCompare(b.title));
  });

  add(item: Item): void {
    this.items.update((items) => [...items, item]);
  }

  remove(id: string): void {
    this.items.update((items) => items.filter((item) => item.id !== id));
  }

  // A server refresh: new objects, usually with the same ids.
  refresh(items: readonly Item[]): void {
    this.items.set(items);
  }
}
