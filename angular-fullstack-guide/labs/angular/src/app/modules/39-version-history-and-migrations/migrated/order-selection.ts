import { Injectable, signal } from '@angular/core';

/** The legacy BehaviorSubject service after the migration program: the selection is a signal. */
@Injectable({ providedIn: 'root' })
export class LabM39OrderSelection {
  private readonly selected = signal<string | null>(null);
  readonly selectedId = this.selected.asReadonly();

  select(id: string): void {
    this.selected.set(id);
  }
}
