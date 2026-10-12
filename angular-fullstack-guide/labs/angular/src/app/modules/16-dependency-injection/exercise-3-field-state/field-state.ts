import {
  Component,
  computed,
  Directive,
  HOST_TAG_NAME,
  HostAttributeToken,
  inject,
  InjectionToken,
  Service,
  signal,
} from '@angular/core';

// Counts constructions and destructions so a test asserts how many happened.
export const fieldStats = { built: 0, destroyed: 0 };

// Per-field state: listed only in a component's providers, so every field builds its own.
@Service({ autoProvided: false })
export class FieldState {
  readonly id = ++fieldStats.built;
  readonly value = signal('');
  readonly valid = computed(() => this.value().length > 0);

  ngOnDestroy(): void {
    fieldStats.destroyed++;
  }
}

// A helper only the field's own view may read: it is listed in viewProviders.
export const FIELD_ID = new InjectionToken<string>('lab-e3-field-id');

// Reads what the field offers, optional so a missing provider gives null instead of NG0201.
@Directive({ selector: '[labFieldLabel]' })
export class FieldLabel {
  readonly state = inject(FieldState, { optional: true });
  readonly fieldId = inject(FIELD_ID, { optional: true });
}

// Placed between the field's tags, so it is projected content and not part of the field's view.
@Component({ selector: 'lab-hint', template: '' })
export class Hint {
  readonly state = inject(FieldState, { optional: true });
  readonly fieldId = inject(FIELD_ID, { optional: true });
}

@Component({
  selector: 'lab-field',
  imports: [FieldLabel],
  providers: [FieldState],
  viewProviders: [{ provide: FIELD_ID, useFactory: () => `field-${inject(FieldState).id}` }],
  template: '<span labFieldLabel></span><ng-content />',
})
export class Field {
  readonly state = inject(FieldState);
  // HostAttributeToken reads the attribute from the host element; optional turns "absent" into null.
  readonly kind = inject(new HostAttributeToken('kind'), { optional: true });
  readonly tag = inject(HOST_TAG_NAME);
}
