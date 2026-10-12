import { Injectable, inject } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of } from 'rxjs';
import { LabM24Connection } from './connection';

/** Preloads the routes flagged `data: { preload: true }`, unless the user saves data or the connection is `'2g'`. */
@Injectable({ providedIn: 'root' })
export class LabM24FlagPreloading implements PreloadingStrategy {
  private readonly connection = inject(LabM24Connection);

  preload(route: Route, load: () => Observable<unknown>): Observable<unknown> {
    const constrained = this.connection.saveData() || this.connection.effectiveType() === '2g';
    return route.data?.['preload'] === true && !constrained ? load() : of(null);
  }
}
