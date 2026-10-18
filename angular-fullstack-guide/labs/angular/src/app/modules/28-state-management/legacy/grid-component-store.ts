// LEGACY: the ComponentStore subclass of module 28 §8. Before @ngrx/signals, a component-local store extended ComponentStore and
// was written through updater() and read through select()/selectSignal(); it is still supported, new code uses signalStore().
import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';

export interface LabM28Row {
  readonly id: number;
  readonly name: string;
}

interface LabM28GridCsState {
  readonly rows: readonly LabM28Row[];
  readonly page: number;
}

@Injectable()
export class LabM28GridComponentStore extends ComponentStore<LabM28GridCsState> {
  constructor() {
    super({ rows: [], page: 0 });
  }

  readonly page = this.selectSignal((s) => s.page);
  readonly next = this.updater((s) => ({ ...s, page: s.page + 1 }));
  readonly load = this.updater((s, rows: readonly LabM28Row[]) => ({ ...s, rows }));
}
