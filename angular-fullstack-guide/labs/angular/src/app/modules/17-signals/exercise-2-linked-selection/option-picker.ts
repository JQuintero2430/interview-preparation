// labs/angular/src/app/modules/17-signals/exercise-2-linked-selection/option-picker.ts
import { Component, computed, input, linkedSignal } from '@angular/core';

export interface Option {
  readonly id: string;
  readonly label: string;
}

/** Keeps the user's choice when it still exists in the new list; otherwise falls back to the first option. */
export function keepOrFirst(
  options: readonly Option[],
  previous?: { source: readonly Option[]; value: string | null },
): string | null {
  const stillThere = previous?.value != null && options.some((o) => o.id === previous.value);
  return stillThere ? previous.value : (options[0]?.id ?? null);
}

@Component({
  selector: 'lab-option-picker',
  // Native buttons are focusable and operable with Enter/Space; aria-pressed exposes the choice.
  template: `
    <ul aria-label="Options">
      @for (option of options(); track option.id) {
        <li>
          <button type="button" [attr.aria-pressed]="option.id === selectedId()" (click)="select(option.id)">
            {{ option.label }}
          </button>
        </li>
      } @empty {
        <li>No options</li>
      }
    </ul>
    <p data-testid="selected">{{ selected()?.label ?? 'Nothing selected' }}</p>
  `,
})
export class OptionPicker {
  readonly options = input.required<readonly Option[]>();

  // Writable (the user can select), but reset by the computation when options() changes.
  readonly selectedId = linkedSignal<readonly Option[], string | null>({
    source: this.options,
    computation: keepOrFirst,
  });

  readonly selected = computed(() => this.options().find((o) => o.id === this.selectedId()));

  select(id: string): void {
    this.selectedId.set(id);
  }
}
