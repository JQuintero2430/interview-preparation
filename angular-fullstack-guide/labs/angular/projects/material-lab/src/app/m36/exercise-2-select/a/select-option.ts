import { Directive, computed, input, signal } from '@angular/core';
import type { Highlightable } from '@angular/cdk/a11y';
import type { Country } from '../countries';

/**
 * One option of variant a. It never takes focus: the key manager calls `setActiveStyles` and `setInactiveStyles`,
 * and the input points at the active option's id through `aria-activedescendant`.
 */
@Directive({
  selector: '[labM36SelectOption]',
  host: {
    role: 'option',
    '[id]': 'id()',
    '[attr.aria-selected]': 'selected()',
    '[attr.data-active]': 'isActive()',
  },
})
export class LabM36SelectOption implements Highlightable {
  readonly country = input.required<Country>({ alias: 'labM36SelectOption' });
  readonly selected = input(false);
  readonly id = computed(() => `m36-select-a-${this.country().code}`);

  private readonly active = signal(false);
  readonly isActive = this.active.asReadonly();

  setActiveStyles(): void {
    this.active.set(true);
  }

  setInactiveStyles(): void {
    this.active.set(false);
  }

  getLabel(): string {
    return this.country().name;
  }
}
