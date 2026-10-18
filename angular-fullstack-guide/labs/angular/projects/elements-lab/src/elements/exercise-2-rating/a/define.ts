import { Injector } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { LabRating } from '../rating';

/** Variant a: Angular Elements does the wiring. */
export function defineRatingA(injector: Injector): void {
  if (!customElements.get('m37-ex2-rating-a')) {
    customElements.define('m37-ex2-rating-a', createCustomElement(LabRating, { injector }));
  }
}
