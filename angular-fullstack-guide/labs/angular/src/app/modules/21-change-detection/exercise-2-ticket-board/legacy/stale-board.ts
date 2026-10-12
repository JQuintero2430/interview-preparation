import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Ticket, TicketSource } from '../ticket-source';

// Legacy: the zone-era ticket board of Exercise 21.2 (module 21), read-only. Plain fields are written
// from a subscription, a timer and an in-place `push`; none of them announces a change.
// `Eager` is what the v22 `change-detection-eager` migration adds to a component with no strategy.
@Component({
  selector: 'lab-m21-e2-stale-board',
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `<p class="status">{{ status }}</p>
    <p class="open">{{ open }} open</p>
    <p class="count">{{ tickets.length }} tickets</p>`,
})
export class StaleBoard implements OnInit {
  private readonly source = inject(TicketSource);
  tickets: Ticket[] = [];
  open = 0;
  status = 'loading';

  ngOnInit(): void {
    this.source.tickets$.subscribe((tickets) => {
      this.tickets = [...tickets];
      this.open = tickets.filter((ticket) => !ticket.done).length;
    });
    setTimeout(() => {
      this.status = 'ready';
    }, 0);
  }

  add(title: string): void {
    this.tickets.push({ id: this.tickets.length + 1, title, done: false });
  }
}
