import { Component, signal } from '@angular/core';
import { TicketBoard } from './ticket-board';

@Component({
  selector: 'lab-m21-e2-host',
  imports: [TicketBoard],
  template: `@if (shown()) {
    <lab-m21-e2-board />
  }`,
})
export class BoardHost {
  readonly shown = signal(true);
}
