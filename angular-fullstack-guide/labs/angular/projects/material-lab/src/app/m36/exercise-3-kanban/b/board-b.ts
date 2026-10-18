import { Component, inject } from '@angular/core';
import { type CdkDragDrop, CdkDrag, CdkDropList } from '@angular/cdk/drag-drop';
import { BoardStore, COLUMNS, type ColumnId } from '../board-store';
import { LabM36Card } from '../card';

function listId(column: ColumnId): string {
  return `m36-kanban-list-${column}`;
}

function otherIds(column: ColumnId): string[] {
  return COLUMNS.filter((other) => other.id !== column).map((other) => listId(other.id));
}

/** Variant b: each list names the others it exchanges cards with, through `cdkDropListConnectedTo` and the lists' ids. */
@Component({
  selector: 'lab-m36-board-b',
  imports: [CdkDrag, CdkDropList, LabM36Card],
  host: { class: 'm36-kanban' },
  template: `
    <h1>Exercise 36.3: a kanban board, variant b</h1>
    <div class="m36-kanban-board">
      @for (column of columns; track column.id) {
        <section class="m36-kanban-column">
          <h2>{{ column.title }}</h2>
          <ul
            cdkDropList
            class="m36-kanban-list"
            [id]="listId(column.id)"
            [attr.aria-label]="column.title"
            [cdkDropListData]="column.id"
            [cdkDropListConnectedTo]="others[column.id]"
            (cdkDropListDropped)="drop($event)"
          >
            @for (card of store.board()[column.id]; track card.id; let i = $index; let n = $count) {
              <li lab-m36-card cdkDrag cdkDragPreviewClass="m36-kanban-preview" [cdkDragData]="card.id" [card]="card" [column]="column.id" [index]="i" [count]="n"></li>
            }
          </ul>
        </section>
      }
    </div>
  `,
})
export class LabM36BoardB {
  protected readonly store = inject(BoardStore);
  protected readonly columns = COLUMNS;

  protected listId(column: ColumnId): string {
    return listId(column);
  }

  /** The ids of every list except the key's, built once so the binding sees the same array on every check. */
  protected readonly others: Readonly<Record<ColumnId, string[]>> = {
    todo: otherIds('todo'),
    doing: otherIds('doing'),
    done: otherIds('done'),
  };

  protected drop(event: CdkDragDrop<ColumnId, ColumnId, string>): void {
    this.store.move(event.item.data, event.container.data, event.currentIndex);
  }
}
