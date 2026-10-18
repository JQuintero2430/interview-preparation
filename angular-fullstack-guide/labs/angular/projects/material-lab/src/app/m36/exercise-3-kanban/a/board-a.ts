import { Component, inject } from '@angular/core';
import { type CdkDragDrop, CdkDrag, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { BoardStore, COLUMNS, type ColumnId } from '../board-store';
import { LabM36Card } from '../card';

/** Variant a: `cdkDropListGroup` on the board connects every list inside it, with no ids to write. */
@Component({
  selector: 'lab-m36-board-a',
  imports: [CdkDrag, CdkDropList, CdkDropListGroup, LabM36Card],
  host: { class: 'm36-kanban' },
  template: `
    <h1>Exercise 36.3: a kanban board, variant a</h1>
    <div cdkDropListGroup class="m36-kanban-board">
      @for (column of columns; track column.id) {
        <section class="m36-kanban-column">
          <h2>{{ column.title }}</h2>
          <ul cdkDropList class="m36-kanban-list" [attr.aria-label]="column.title" [cdkDropListData]="column.id" (cdkDropListDropped)="drop($event)">
            @for (card of store.board()[column.id]; track card.id; let i = $index; let n = $count) {
              <li lab-m36-card cdkDrag cdkDragPreviewClass="m36-kanban-preview" [cdkDragData]="card.id" [card]="card" [column]="column.id" [index]="i" [count]="n"></li>
            }
          </ul>
        </section>
      }
    </div>
  `,
})
export class LabM36BoardA {
  protected readonly store = inject(BoardStore);
  protected readonly columns = COLUMNS;

  /** The CDK reports the drop; the store writes it. */
  protected drop(event: CdkDragDrop<ColumnId, ColumnId, string>): void {
    this.store.move(event.item.data, event.container.data, event.currentIndex);
  }
}
