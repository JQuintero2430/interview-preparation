import { Component, computed, inject, input } from '@angular/core';
import { formatEntity, type LabM31Entity, LabM31EntityStore } from './entity-store';
import { LabM31RunCounter } from './run-counter';

/** One row with its own `computed` label: it re-runs only when this row's entity changes. */
@Component({
  selector: 'lab-m31-entity-row',
  template: `<p>{{ label() }}</p>`,
})
export class LabM31EntityRow {
  private readonly runs = inject(LabM31RunCounter);
  readonly entity = input.required<LabM31Entity>();

  protected readonly label = computed(() => {
    this.runs.rowComputed++;
    return formatEntity(this.entity());
  });
}

/** Renders every entity of the store as a row, tracked by id. */
@Component({
  selector: 'lab-m31-entity-list',
  imports: [LabM31EntityRow],
  template: `
    <section aria-label="Entities">
      @for (entity of store.entities(); track entity.id) {
        <lab-m31-entity-row [entity]="entity" />
      }
    </section>
  `,
})
export class LabM31EntityList {
  protected readonly store = inject(LabM31EntityStore);
}
