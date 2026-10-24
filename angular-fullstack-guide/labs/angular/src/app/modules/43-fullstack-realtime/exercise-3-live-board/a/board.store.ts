// Exercise 43.3, variant a (the solution): a signals service. `BoardStore` hands each reader its own `toSignal` over the
// one shared `board$`, tied to the reader's injector, so destroying a component unsubscribes only that reader and the
// shared socket closes after the last one leaves and the grace period ends.
import { Component, Injectable, Injector, afterNextRender, computed, inject, signal, type Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BOARD_TEMPLATE, BoardConnection, type BoardSnapshot } from '../board';

@Injectable({ providedIn: 'root' })
export class BoardStore {
  private readonly connection = inject(BoardConnection);

  readonly state = this.connection.state;

  /** The board for one reader; its subscription ends when `injector` is destroyed. */
  read(injector: Injector): Signal<BoardSnapshot | undefined> {
    return toSignal(this.connection.board$, { injector });
  }
}

@Component({
  selector: 'lab-m43-board-signals',
  template: BOARD_TEMPLATE,
})
export class LabM43BoardSignals {
  private readonly store = inject(BoardStore);
  private readonly injector = inject(Injector);
  private readonly reader = signal<Signal<BoardSnapshot | undefined> | undefined>(undefined);

  protected readonly state = this.store.state;
  protected readonly cards = computed(() => this.reader()?.()?.cards ?? []);

  constructor() {
    // The server skips render hooks, so a server render opens no socket.
    afterNextRender(() => this.reader.set(this.store.read(this.injector)));
  }
}
