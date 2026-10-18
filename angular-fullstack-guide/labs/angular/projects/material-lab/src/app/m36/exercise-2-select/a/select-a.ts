import {
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  TemplateRef,
  ViewContainerRef,
  afterRenderEffect,
  computed,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
  viewChildren,
} from '@angular/core';
import { ActiveDescendantKeyManager, LiveAnnouncer } from '@angular/cdk/a11y';
import {
  type OverlayRef,
  STANDARD_DROPDOWN_BELOW_POSITIONS,
  createFlexibleConnectedPositionStrategy,
  createOverlayRef,
  createRepositionScrollStrategy,
} from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { type Country, filterCountries, matchMessage } from '../countries';
import { LabM36SelectOption } from './select-option';

const LISTBOX_ID = 'm36-select-a-listbox';

/**
 * Variant a: the combobox wiring by hand. The input keeps focus and carries the ARIA states; the listbox lives in a CDK overlay;
 * an `ActiveDescendantKeyManager` over a `viewChildren` signal moves the active option; `LiveAnnouncer` reads the result count.
 */
@Component({
  selector: 'lab-m36-select-a',
  imports: [LabM36SelectOption],
  host: { class: 'm36-select' },
  template: `
    <h1>Exercise 36.2: a filterable select, variant a</h1>
    <label class="m36-select-label" for="m36-select-a-input">Country</label>
    <input
      #field
      id="m36-select-a-input"
      class="m36-select-input"
      type="text"
      autocomplete="off"
      role="combobox"
      aria-autocomplete="list"
      [attr.aria-expanded]="expanded()"
      [attr.aria-controls]="expanded() ? listboxId : null"
      [attr.aria-activedescendant]="activeId() ?? null"
      [value]="query()"
      (input)="onInput(field.value)"
      (keydown)="onKeydown($event)"
    />
    <p>Selected country: <output aria-label="Selected country">{{ selected()?.name ?? 'none' }}</output></p>

    <!-- The panel is declared here and rendered in the overlay pane through a TemplatePortal. -->
    <ng-template #panel>
      <div role="listbox" class="m36-select-listbox" aria-label="Countries" [id]="listboxId">
        @for (country of matches(); track country.code) {
          <div
            class="m36-select-option"
            [labM36SelectOption]="country"
            [selected]="country.code === selected()?.code"
            (click)="choose(country)"
          >
            {{ country.name }}
          </div>
        }
      </div>
    </ng-template>
  `,
})
export class LabM36SelectA {
  private readonly injector = inject(Injector);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly announcer = inject(LiveAnnouncer);
  private readonly field = viewChild.required<ElementRef<HTMLInputElement>>('field');
  private readonly panel = viewChild.required<TemplateRef<unknown>>('panel');
  // The options render inside the overlay, but the template that creates them is declared here, so the query sees them.
  private readonly options = viewChildren(LabM36SelectOption);
  private readonly keyManager = new ActiveDescendantKeyManager<LabM36SelectOption>(this.options, this.injector).withWrap();
  private overlayRef: OverlayRef | undefined;

  protected readonly listboxId = LISTBOX_ID;
  protected readonly query = signal('');
  protected readonly expanded = signal(false);
  protected readonly selected = signal<Country | undefined>(undefined);
  protected readonly matches = computed(() => filterCountries(this.query()));
  protected readonly activeId = computed(() => this.options().find((option) => option.isActive())?.id());

  constructor() {
    // 1. Every new set of options starts with the first one active. Untracked, so a later arrow key does not re-run this.
    afterRenderEffect({
      write: () => {
        if (this.options().length > 0) untracked(() => this.keyManager.setFirstItemActive());
      },
    });
    // 2. The count is announced whenever it changes while the list is open; the announcer owns the live element.
    effect(() => {
      if (this.expanded()) void this.announcer.announce(matchMessage(this.matches().length));
    });
    inject(DestroyRef).onDestroy(() => {
      this.keyManager.destroy();
      this.overlayRef?.dispose();
    });
  }

  protected onInput(value: string): void {
    this.query.set(value);
    this.open();
  }

  /** Focus never leaves the input: the arrow keys go to the key manager, Enter commits the active option. */
  protected onKeydown(event: KeyboardEvent): void {
    if (!this.expanded()) {
      if (event.key === 'ArrowDown') this.open();
      return;
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      this.keyManager.onKeydown(event);
      return;
    }
    const active = this.keyManager.activeItem;
    if (event.key === 'Enter' && active) {
      event.preventDefault();
      this.choose(active.country());
    }
  }

  protected choose(country: Country): void {
    this.selected.set(country);
    this.query.set(country.name);
    this.close();
  }

  private open(): void {
    this.expanded.set(true);
    const ref = (this.overlayRef ??= this.createOverlay());
    if (!ref.hasAttached()) ref.attach(new TemplatePortal(this.panel(), this.viewContainerRef));
  }

  private close(): void {
    this.expanded.set(false);
    this.overlayRef?.detach();
  }

  /** Created once, on first open, because the origin element exists only after the first render. */
  private createOverlay(): OverlayRef {
    const field = this.field().nativeElement;
    const ref = createOverlayRef(this.injector, {
      positionStrategy: createFlexibleConnectedPositionStrategy(this.injector, field).withPositions(STANDARD_DROPDOWN_BELOW_POSITIONS),
      scrollStrategy: createRepositionScrollStrategy(this.injector),
    });
    // A raw OverlayRef closes nothing by itself: Escape and outside clicks are the page's to handle.
    ref.keydownEvents().subscribe((event) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      this.close();
    });
    // A press on the input is outside the pane too; it must not close the list the user is typing into.
    ref.outsidePointerEvents().subscribe((event) => {
      if (event.target !== field) this.close();
    });
    return ref;
  }
}
