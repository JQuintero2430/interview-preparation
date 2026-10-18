import { Component, signal } from '@angular/core';

/** One row of the list: a stable id the `@for` tracks and the text shown. */
interface Item {
  readonly id: number;
  readonly label: string;
}

// Q35.13: a keyed list where one item moves, one is removed and one removed item is restored mid-leave.
@Component({
  selector: 'lab-m35-q35-13',
  template: `
    <h1>Q35.13: move, remove and re-add in a keyed list</h1>

    <button type="button" (click)="moveFirstToEnd()">Move first to end</button>
    <button type="button" (click)="remove(2)">Remove item 2</button>
    <button type="button" (click)="restore(2, 'in place')">Restore item 2</button>
    <button type="button" (click)="restore(2, 'at the end')">Restore item 2 at the end</button>
    <ul data-testid="q13-list">
      @for (item of items(); track item.id) {
        <li
          class="m35-q13-row"
          animate.enter="m35-q13-in"
          animate.leave="m35-q13-out"
          [attr.data-testid]="'q13-row-' + item.id"
        >
          {{ item.label }}
        </li>
      }
    </ul>
  `,
  styles: `
    ul {
      width: 12rem;
      padding: 0;
      list-style: none;
    }

    .m35-q13-row {
      padding: 0.5rem 1rem;
      margin-block: 0.25rem;
      background: #dbeafe;
    }

    .m35-q13-in {
      animation: m35-q13-slide-in 1500ms;
    }

    .m35-q13-out {
      animation: m35-q13-slide-out 1500ms forwards;
    }

    @keyframes m35-q13-slide-in {
      from {
        opacity: 0;
      }
    }

    @keyframes m35-q13-slide-out {
      to {
        opacity: 0;
      }
    }
  `,
})
export class LabM35Q3513 {
  protected readonly items = signal<readonly Item[]>([
    { id: 1, label: 'Item 1' },
    { id: 2, label: 'Item 2' },
    { id: 3, label: 'Item 3' },
  ]);

  /** Where each removed item stood, so a restore can put it back in place. */
  private readonly removedAt = new Map<number, { item: Item; index: number }>();

  protected moveFirstToEnd(): void {
    this.items.update(([first, ...rest]) => (first ? [...rest, first] : rest));
  }

  protected remove(id: number): void {
    const index = this.items().findIndex((item) => item.id === id);
    const item = this.items()[index];
    if (!item) return;
    this.removedAt.set(id, { item, index });
    this.items.update((current) => current.filter((candidate) => candidate.id !== id));
  }

  protected restore(id: number, where: 'in place' | 'at the end'): void {
    const removed = this.removedAt.get(id);
    if (!removed || this.items().some((item) => item.id === id)) return;
    this.items.update((current) => {
      const next = [...current];
      next.splice(where === 'in place' ? removed.index : next.length, 0, removed.item);
      return next;
    });
  }
}
