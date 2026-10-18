import { Injectable } from '@angular/core';

/**
 * Root registry of the chart panels currently open. Because it lives as long as the
 * app, anything it still holds after a panel closes stays in memory: the leaky panel
 * adds itself and never leaves, the alternative stores only a numeric id.
 */
@Injectable({ providedIn: 'root' })
export class PanelRegistry {
  private readonly panels = new Set<object>();
  private readonly ids = new Set<number>();

  /** Number of entries held, instances and ids together. */
  get size(): number {
    return this.panels.size + this.ids.size;
  }

  /** Holds a reference to the panel instance, which keeps it reachable until `remove`. */
  add(panel: object): void {
    this.panels.add(panel);
  }

  /** Drops the reference to the panel instance. */
  remove(panel: object): void {
    this.panels.delete(panel);
  }

  /** Records a panel by id only, so the registry never retains the instance. */
  addId(id: number): void {
    this.ids.add(id);
  }

  /** Forgets a panel id. */
  removeId(id: number): void {
    this.ids.delete(id);
  }
}
