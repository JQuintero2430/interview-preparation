import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

/** A fake user endpoint: it logs every request and every request cancelled before it answered. */
@Injectable({ providedIn: 'root' })
export class LabM25UserApi {
  readonly calls: string[] = [];
  readonly cancelled: string[] = [];
  readonly takenNames = new Set(['ann']);
  delayMs = 100;

  isTaken(name: string): Observable<boolean> {
    return new Observable<boolean>((subscriber) => {
      this.calls.push(name);
      let answered = false;
      const timerId = setTimeout(() => {
        answered = true;
        subscriber.next(this.takenNames.has(name));
        subscriber.complete();
      }, this.delayMs);
      return () => {
        clearTimeout(timerId);
        if (!answered) this.cancelled.push(name);
      };
    });
  }
}
