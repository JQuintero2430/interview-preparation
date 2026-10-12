import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Ticket {
  readonly id: number;
  readonly title: string;
  readonly done: boolean;
}

// A fake source the spec controls: nothing is emitted until `emit` is called.
@Injectable({ providedIn: 'root' })
export class TicketSource {
  private readonly subject = new Subject<readonly Ticket[]>();
  readonly tickets$ = this.subject.asObservable();

  get observed(): boolean {
    return this.subject.observed;
  }

  emit(tickets: readonly Ticket[]): void {
    this.subject.next(tickets);
  }
}
