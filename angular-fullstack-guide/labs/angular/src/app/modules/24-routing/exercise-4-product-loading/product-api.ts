import { Injectable } from '@angular/core';
import { EMPTY, Observable, of, throwError } from 'rxjs';

export interface LabM24Product {
  readonly id: string;
  readonly name: string;
}

const CATALOG: readonly LabM24Product[] = [
  { id: '1', name: 'Keyboard' },
  { id: '2', name: 'Monitor' },
];

/** A fake product API: Observables, a call log and ids that fail or never emit. */
@Injectable({ providedIn: 'root' })
export class LabM24ProductApi {
  /** Every id requested, in order. */
  readonly calls: string[] = [];
  /** Ids whose request errors. */
  readonly failing = new Set<string>();
  /** Ids whose request completes without a value. */
  readonly silent = new Set<string>();

  /** The product, or `null` when the id is unknown. */
  load(id: string): Observable<LabM24Product | null> {
    this.calls.push(id);
    if (this.failing.has(id)) {
      return throwError(() => new Error(`product ${id} is unavailable`));
    }
    if (this.silent.has(id)) {
      return EMPTY;
    }
    return of(CATALOG.find((product) => product.id === id) ?? null);
  }
}
