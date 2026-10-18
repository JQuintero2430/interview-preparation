import { Component, computed, effect, inject, signal } from '@angular/core';
import { Combobox, ComboboxPopup, ComboboxWidget } from '@angular/aria/combobox';
import { Listbox, Option } from '@angular/aria/listbox';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { CdkConnectedOverlay, STANDARD_DROPDOWN_BELOW_POSITIONS } from '@angular/cdk/overlay';
import { COUNTRIES, type Country, filterCountries, matchMessage } from '../countries';

/**
 * Variant b: Angular Aria. `ngCombobox` owns the input's ARIA states and relays the navigation keys to the listbox;
 * `ngListbox` in `activedescendant` focus mode moves the active option; the page filters, positions and commits.
 */
@Component({
  selector: 'lab-m36-select-b',
  imports: [Combobox, ComboboxPopup, ComboboxWidget, Listbox, Option, CdkConnectedOverlay],
  host: { class: 'm36-select' },
  template: `
    <h1>Exercise 36.2: a filterable select, variant b</h1>
    <label class="m36-select-label" for="m36-select-b-input">Country</label>
    <!-- 1. The combobox: the typed text and the open state are two-way models; Aria adds role, aria-* and the keys. -->
    <input
      #combobox="ngCombobox"
      ngCombobox
      id="m36-select-b-input"
      class="m36-select-input"
      type="text"
      autocomplete="off"
      [(value)]="query"
      [(expanded)]="expanded"
    />
    <p>Selected country: <output aria-label="Selected country">{{ selected()?.name ?? 'none' }}</output></p>

    <!-- 2. Aria positions nothing: a CDK connected overlay, as a popover placed after its origin, holds the popup. -->
    <ng-template
      [cdkConnectedOverlay]="{ origin: combobox.element, positions: positions, usePopover: 'inline' }"
      [cdkConnectedOverlayOpen]="expanded()"
      (detach)="expanded.set(false)"
      (overlayOutsideClick)="expanded.set(false)"
    >
      <!-- 3. The popup template registers with the combobox; the widget inside it reports its id and active descendant. -->
      <ng-template ngComboboxPopup [combobox]="combobox">
        <div
          #listbox="ngListbox"
          ngListbox
          ngComboboxWidget
          class="m36-select-listbox"
          aria-label="Countries"
          focusMode="activedescendant"
          selectionMode="explicit"
          [tabindex]="-1"
          [activeDescendant]="listbox.activeDescendant()"
          [(value)]="picked"
          (valueChange)="commit($event)"
        >
          @for (country of matches(); track country.code) {
            <div ngOption class="m36-select-option" [value]="country.code" [label]="country.name">{{ country.name }}</div>
          }
        </div>
      </ng-template>
    </ng-template>
  `,
})
export class LabM36SelectB {
  private readonly announcer = inject(LiveAnnouncer);

  protected readonly positions = STANDARD_DROPDOWN_BELOW_POSITIONS;
  protected readonly query = signal('');
  protected readonly expanded = signal(false);
  protected readonly selected = signal<Country | undefined>(undefined);
  /** The listbox's own selection; it becomes the committed country only through `commit`. */
  protected readonly picked = signal<string[]>([]);
  // The combobox does not filter: it writes the typed text into `query`, and the page derives the options from it.
  protected readonly matches = computed(() => filterCountries(this.query()));

  constructor() {
    effect(() => {
      if (this.expanded()) void this.announcer.announce(matchMessage(this.matches().length));
    });
  }

  /**
   * Enter (relayed by the combobox) or a click selects an option in the listbox; that selection is committed here.
   * The listbox is reset afterwards, so a later Enter on the same option selects it again instead of toggling it off.
   */
  protected commit(codes: readonly string[]): void {
    const country = COUNTRIES.find((candidate) => candidate.code === codes[0]);
    if (!country) return;
    this.selected.set(country);
    this.query.set(country.name);
    this.expanded.set(false);
    this.picked.set([]);
  }
}
