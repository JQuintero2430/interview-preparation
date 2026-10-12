import { DestroyRef, Injectable, inject } from '@angular/core';
import { Observable, Subject } from 'rxjs';

/** Every event the cart understands; a typo in `type` or a missing price fails to compile. */
export type CartEvent =
  | { readonly type: 'added'; readonly item: string; readonly price: number }
  | { readonly type: 'removed'; readonly item: string; readonly price: number };

/** The typed replacement of the public bus: consumers read `events$` and publish through `publish` only. */
@Injectable()
export class CartEvents {
  private readonly events = new Subject<CartEvent>();
  readonly events$: Observable<CartEvent> = this.events.asObservable();

  constructor() {
    inject(DestroyRef).onDestroy(() => this.events.complete());
  }

  publish(event: CartEvent): void {
    this.events.next(event);
  }
}
