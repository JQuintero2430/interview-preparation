import { computed, inject, Injectable, signal } from '@angular/core';
import { LabM31RunCounter } from './run-counter';

/** One store entity. */
export interface LabM31Entity {
  readonly id: number;
  readonly name: string;
}

/** How many entities the section 3 store holds. */
export const LAB_M31_ENTITY_COUNT = 100;

/**
 * The display label of one entity (the per-row work both derivations do).
 * @param entity the entity to format
 */
export function formatEntity(entity: LabM31Entity): string {
  return `#${entity.id} ${entity.name}`;
}

function makeEntities(count: number): LabM31Entity[] {
  return Array.from({ length: count }, (_, id) => ({ id, name: `Entity ${id}` }));
}

/** A service-with-signals store whose updates replace one entity and the array, as module 28 teaches. */
@Injectable({ providedIn: 'root' })
export class LabM31EntityStore {
  private readonly runs = inject(LabM31RunCounter);
  private readonly state = signal<readonly LabM31Entity[]>(makeEntities(LAB_M31_ENTITY_COUNT));
  readonly entities = this.state.asReadonly();

  /** A list-wide selector: one `computed` that formats every entity. */
  readonly labels = computed(() =>
    this.state().map((entity) => {
      this.runs.selectorRows++;
      return formatEntity(entity);
    }),
  );

  /**
   * Replaces one entity with a renamed copy; every other entity keeps its reference.
   * @param id the entity to rename
   * @param name its new name
   */
  rename(id: number, name: string): void {
    this.state.update((list) => list.map((entity) => (entity.id === id ? { ...entity, name } : entity)));
  }
}
