import { Component, DOCUMENT, EnvironmentInjector, afterNextRender, computed, inject, input } from '@angular/core';
import { BoardStore, COLUMNS, type BoardCard, type ColumnId } from './board-store';

/**
 * One card. The host is the list item (and the drag item, where a variant puts `cdkDrag` on it): focusable, with two buttons
 * and Alt+Arrow keys as the keyboard alternative to dragging. A keyboard move ends by focusing the card again.
 *
 * Why `afterNextRender` and not a `FocusKeyManager`: a move across columns destroys this card and creates another one in the
 * next list, so no per-column manager holds the new element; the id lets the code find it once the render has put it there.
 * The injector is the environment's, because the component's own injector is destroyed with the card and would cancel the callback.
 */
@Component({
  selector: 'li[lab-m36-card]',
  host: {
    class: 'm36-card',
    tabindex: '0',
    '[id]': 'domId()',
    '(keydown)': 'onKeydown($event)',
  },
  template: `
    <button type="button" class="m36-card-move m36-card-left" [attr.aria-label]="'Move ' + card().title + ' left'" [disabled]="!previous()" (click)="shift(-1)"></button>
    <span class="m36-card-title">{{ card().title }}</span>
    <button type="button" class="m36-card-move m36-card-right" [attr.aria-label]="'Move ' + card().title + ' right'" [disabled]="!next()" (click)="shift(1)"></button>
  `,
})
export class LabM36Card {
  private readonly store = inject(BoardStore);
  private readonly document = inject(DOCUMENT);
  private readonly environment = inject(EnvironmentInjector);

  readonly card = input.required<BoardCard>();
  readonly column = input.required<ColumnId>();
  readonly index = input.required<number>();
  readonly count = input.required<number>();

  protected readonly domId = computed(() => `m36-card-${this.card().id}`);
  protected readonly previous = computed(() => COLUMNS[COLUMNS.findIndex((column) => column.id === this.column()) - 1]);
  protected readonly next = computed(() => COLUMNS[COLUMNS.findIndex((column) => column.id === this.column()) + 1]);

  /** Alt+ArrowLeft and Alt+ArrowRight change column, Alt+ArrowUp and Alt+ArrowDown change the position in the column. */
  protected onKeydown(event: KeyboardEvent): void {
    if (!event.altKey) return;
    switch (event.key) {
      case 'ArrowLeft':
        this.shift(-1);
        break;
      case 'ArrowRight':
        this.shift(1);
        break;
      case 'ArrowUp':
        this.reorder(-1);
        break;
      case 'ArrowDown':
        this.reorder(1);
        break;
      default:
        return;
    }
    // The browser's own Alt+Arrow (history navigation) must not run as well.
    event.preventDefault();
  }

  protected shift(direction: -1 | 1): void {
    const target = direction < 0 ? this.previous() : this.next();
    if (target) this.moveTo(target.id, this.index());
  }

  private reorder(direction: -1 | 1): void {
    const index = this.index() + direction;
    if (index >= 0 && index < this.count()) this.moveTo(this.column(), index);
  }

  private moveTo(column: ColumnId, index: number): void {
    const id = this.domId();
    this.store.move(this.card().id, column, index);
    afterNextRender(() => this.document.getElementById(id)?.focus(), { injector: this.environment });
  }
}
