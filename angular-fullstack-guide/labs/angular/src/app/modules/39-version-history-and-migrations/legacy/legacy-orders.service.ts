import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// Legacy on purpose (SYLLABUS §5, module 39 section 10): selection state in a BehaviorSubject, read with the
// async pipe, provided by an NgModule. migrated/order-selection.ts is the same state after the migration program.
@Injectable()
export class LabM39LegacyOrdersService {
  private readonly selectedIdSubject = new BehaviorSubject<string | null>(null);
  readonly selectedId$ = this.selectedIdSubject.asObservable();

  select(id: string): void {
    this.selectedIdSubject.next(id);
  }
}
