import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Ticket, TicketSource } from './ticket-source';

@Component({
  selector: 'lab-m21-e2-board',
  template: `<p class="status">{{ status() }}</p>
    <p class="open">{{ open() }} open</p>
    <ul>
      @for (ticket of list(); track ticket.id) {
        <li>{{ ticket.title }}</li>
      }
    </ul>`,
})
export class TicketBoard {
  private readonly fromSource = toSignal(inject(TicketSource).tickets$);
  private readonly added = signal<readonly Ticket[]>([]);
  readonly list = computed(() => [...(this.fromSource() ?? []), ...this.added()]);
  readonly open = computed(() => this.list().filter((ticket) => !ticket.done).length);
  readonly status = computed(() => (this.fromSource() ? 'ready' : 'loading'));

  add(title: string): void {
    this.added.update((added) => [...added, { id: 100 + added.length, title, done: false }]);
  }
}
