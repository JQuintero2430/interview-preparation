// Exercise 43.3, variant b (the alternative): `rxResource` with `stream` in each component, over the same shared
// `board$`. `undefined` params keep the resource idle until the first render; destroying the component destroys the
// resource, which aborts its stream and unsubscribes (Angular 22.2.1 `rxjs-interop.mjs`).
import { Component, afterNextRender, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { BOARD_TEMPLATE, BoardConnection } from '../board';

@Component({
  selector: 'lab-m43-board-resource',
  template: BOARD_TEMPLATE,
})
export class LabM43BoardResource {
  private readonly connection = inject(BoardConnection);
  private readonly rendered = signal(false);
  private readonly board = rxResource({
    params: () => (this.rendered() ? true : undefined),
    stream: () => this.connection.board$,
  });

  protected readonly state = this.connection.state;
  protected readonly cards = computed(() => (this.board.hasValue() ? this.board.value().cards : []));

  constructor() {
    afterNextRender(() => this.rendered.set(true));
  }
}
