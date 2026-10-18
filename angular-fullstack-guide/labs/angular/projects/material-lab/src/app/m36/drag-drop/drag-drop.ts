import { Component, computed, signal } from '@angular/core';
import {
  type CdkDragDrop,
  CdkDrag,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';

type ColumnId = 'todo' | 'done';
type Board = Record<ColumnId, string[]>;

interface Column {
  readonly id: ColumnId;
  readonly label: string;
}

/** What a drop event reported, as one line the tests read. */
function describeDrop(event: CdkDragDrop<unknown, unknown, string>): string {
  const same = event.previousContainer === event.container;
  return `Dropped ${event.item.data}: previousIndex ${event.previousIndex}, currentIndex ${event.currentIndex}, same container: ${same}`;
}

/**
 * Drop lists and drag items. The CDK reports each drop and never touches your data: the sortable list copies and
 * reorders, the snap-back list does not, the board transfers between connected lists, the inbox has no group to
 * share, and the in-place list shows why `moveItemInArray` on a signal's own array notifies nobody.
 */
@Component({
  selector: 'lab-m36-drag-drop',
  imports: [CdkDrag, CdkDropList, CdkDropListGroup],
  host: { class: 'm36-drag-drop' },
  template: `
    <h1>Section 6: drag and drop</h1>

    <section>
      <h2>Sortable</h2>
      <ul cdkDropList class="m36-drag-list" aria-label="Sortable list" (cdkDropListDropped)="sort($event)">
        @for (item of items(); track item) {
          <li cdkDrag [cdkDragData]="item" cdkDragPreviewClass="m36-drag-preview" class="m36-drag-item" tabindex="0">{{ item }}</li>
        }
      </ul>
      <output aria-label="Sortable report">{{ sortReport() }}</output>
    </section>

    <section>
      <h2>Snap back</h2>
      <ul cdkDropList class="m36-drag-list" aria-label="Snap-back list" (cdkDropListDropped)="snap($event)">
        @for (item of snapItems; track item) {
          <li cdkDrag [cdkDragData]="item" cdkDragPreviewClass="m36-drag-preview" class="m36-drag-item">{{ item }}</li>
        }
      </ul>
      <output aria-label="Snap-back report">{{ snapReport() }}</output>
    </section>

    <section>
      <h2>Board</h2>
      <div cdkDropListGroup class="m36-board">
        @for (column of columns; track column.id) {
          <ul cdkDropList class="m36-drag-list" [attr.aria-label]="column.label" [cdkDropListData]="column.id" (cdkDropListDropped)="moveCard($event)">
            @for (card of board()[column.id]; track card) {
              <li cdkDrag [cdkDragData]="card" cdkDragPreviewClass="m36-drag-preview" class="m36-drag-item">{{ card }}</li>
            }
          </ul>
        }
      </div>
      <output aria-label="Board report">{{ boardReport() }}</output>
    </section>

    <section>
      <h2>Unconnected</h2>
      <div class="m36-board">
        <ul cdkDropList class="m36-drag-list" aria-label="Inbox" (cdkDropListDropped)="inboxDrop($event)">
          @for (item of inbox; track item) {
            <li cdkDrag [cdkDragData]="item" cdkDragPreviewClass="m36-drag-preview" class="m36-drag-item">{{ item }}</li>
          }
        </ul>
        <ul cdkDropList class="m36-drag-list" aria-label="Archive">
          @for (item of archive; track item) {
            <li cdkDrag [cdkDragData]="item" cdkDragPreviewClass="m36-drag-preview" class="m36-drag-item">{{ item }}</li>
          }
        </ul>
      </div>
      <output aria-label="Inbox report">{{ inboxReport() }}</output>
    </section>

    <section>
      <h2>In place</h2>
      <ul cdkDropList class="m36-drag-list" aria-label="In-place list" (cdkDropListDropped)="inPlaceDrop($event)">
        @for (item of inPlace(); track item) {
          <li cdkDrag cdkDragPreviewClass="m36-drag-preview" class="m36-drag-item">{{ item }}</li>
        }
      </ul>
      <output aria-label="In-place order">Order: {{ inPlaceOrder() }}</output>
      <output aria-label="In-place drops">Drops: {{ drops() }}</output>
    </section>
  `,
})
export class LabM36DragDrop {
  protected readonly items = signal(['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5']);
  protected readonly sortReport = signal('No drop yet');

  protected readonly snapItems = ['Snap A', 'Snap B', 'Snap C'];
  protected readonly snapReport = signal('No drop yet');

  protected readonly columns: readonly Column[] = [
    { id: 'todo', label: 'To do' },
    { id: 'done', label: 'Done' },
  ];
  protected readonly board = signal<Board>({ todo: ['Write', 'Test'], done: ['Ship'] });
  protected readonly boardReport = signal('No drop yet');

  protected readonly inbox = ['Mail'];
  protected readonly archive = ['Old'];
  protected readonly inboxReport = signal('No drop yet');

  protected readonly inPlace = signal(['Sig 1', 'Sig 2', 'Sig 3']);
  protected readonly inPlaceOrder = computed(() => this.inPlace().join(', '));
  protected readonly drops = signal(0);

  /** The handler writes the data: a copy is reordered and set, so the signal notifies. */
  protected sort(event: CdkDragDrop<unknown, unknown, string>): void {
    this.sortReport.set(describeDrop(event));
    this.items.update((list) => {
      const next = [...list];
      moveItemInArray(next, event.previousIndex, event.currentIndex);
      return next;
    });
  }

  /** The handler only reports: the data does not change, so the list shows its old order. */
  protected snap(event: CdkDragDrop<unknown, unknown, string>): void {
    this.snapReport.set(describeDrop(event));
  }

  /** The handler moves a card inside a column or between columns, on copies of both arrays. */
  protected moveCard(event: CdkDragDrop<ColumnId, ColumnId, string>): void {
    const from = event.previousContainer.data;
    const to = event.container.data;
    this.boardReport.set(`Dropped ${event.item.data}: ${from} to ${to}`);
    this.board.update((board) => {
      const next: Board = { todo: [...board.todo], done: [...board.done] };
      if (from === to) moveItemInArray(next[to], event.previousIndex, event.currentIndex);
      else transferArrayItem(next[from], next[to], event.previousIndex, event.currentIndex);
      return next;
    });
  }

  protected inboxDrop(event: CdkDragDrop<unknown, unknown, string>): void {
    this.inboxReport.set(describeDrop(event));
  }

  /** The anti-pattern: `moveItemInArray` mutates the signal's own array and nothing calls `set` or `update` on it. */
  protected inPlaceDrop(event: CdkDragDrop<unknown>): void {
    moveItemInArray(this.inPlace(), event.previousIndex, event.currentIndex);
    this.drops.update((n) => n + 1);
  }
}
