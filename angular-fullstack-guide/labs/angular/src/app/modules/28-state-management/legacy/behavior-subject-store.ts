// LEGACY: the service-with-BehaviorSubject store of module 28 §3. It is still common in codebases written before
// signals; new code uses a signal store (§2). The spec in concepts/section-3-behavior-subject-store.spec.ts runs it.
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, distinctUntilChanged, map } from 'rxjs';

export interface LabM28ListState {
  items: string[];
  loading: boolean;
}

/** The pattern: a private BehaviorSubject, a read-only stream, `select` built from `map` and `distinctUntilChanged`. */
@Injectable()
export class LabM28LegacyListStore {
  private readonly subject = new BehaviorSubject<LabM28ListState>({ items: ['a'], loading: false });
  readonly state$: Observable<LabM28ListState> = this.subject.asObservable();

  get snapshot(): LabM28ListState {
    return this.subject.getValue();
  }

  select<T>(pick: (state: LabM28ListState) => T): Observable<T> {
    return this.state$.pipe(map(pick), distinctUntilChanged());
  }

  setLoading(loading: boolean): void {
    this.update({ loading });
  }

  setItems(items: string[]): void {
    this.update({ items });
  }

  addItem(item: string): void {
    this.update({ items: [...this.snapshot.items, item] });
  }

  private update(change: Partial<LabM28ListState>): void {
    this.subject.next({ ...this.snapshot, ...change });
  }
}
