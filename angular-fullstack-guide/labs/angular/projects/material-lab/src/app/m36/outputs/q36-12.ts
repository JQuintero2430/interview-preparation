import { Component, signal } from '@angular/core';
import { type CdkDragDrop, CdkDrag, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';

const ITEMS = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'];

/** What a drop event reported, as one line the test reads. */
function describeDrop(event: CdkDragDrop<unknown, unknown, string>): string {
  const same = event.previousContainer === event.container;
  return `Dropped ${event.item.data}: previousIndex ${event.previousIndex}, currentIndex ${event.currentIndex}, same container: ${same}`;
}

/** Two five-item lists with one handler each: the first only reports the drop, the second also writes the new order. */
@Component({
  selector: 'lab-m36-q12',
  imports: [CdkDrag, CdkDropList],
  host: { class: 'm36-out-page' },
  template: `
    <h1>Q36.12: what a drop reports</h1>

    <section>
      <h2>Report only</h2>
      <ul cdkDropList class="m36-out-list" aria-label="Report-only list" (cdkDropListDropped)="report($event)">
        @for (item of fixed; track item) {
          <li cdkDrag [cdkDragData]="item" class="m36-out-item">{{ item }}</li>
        }
      </ul>
      <output aria-label="Report-only result">{{ reportOnly() }}</output>
    </section>

    <section>
      <h2>Report and reorder</h2>
      <ul cdkDropList class="m36-out-list" aria-label="Reordering list" (cdkDropListDropped)="reorder($event)">
        @for (item of items(); track item) {
          <li cdkDrag [cdkDragData]="item" class="m36-out-item">{{ item }}</li>
        }
      </ul>
      <output aria-label="Reordering result">{{ reordered() }}</output>
    </section>
  `,
})
export class LabM36Q12 {
  protected readonly fixed = ITEMS;
  protected readonly reportOnly = signal('No drop yet');

  protected readonly items = signal(ITEMS);
  protected readonly reordered = signal('No drop yet');

  /** The handler never touches the data, so the template keeps rendering `fixed`. */
  protected report(event: CdkDragDrop<unknown, unknown, string>): void {
    this.reportOnly.set(describeDrop(event));
  }

  /** The handler reorders a copy and sets the signal: the data decides what renders. */
  protected reorder(event: CdkDragDrop<unknown, unknown, string>): void {
    this.reordered.set(describeDrop(event));
    this.items.update((list) => {
      const next = [...list];
      moveItemInArray(next, event.previousIndex, event.currentIndex);
      return next;
    });
  }
}
