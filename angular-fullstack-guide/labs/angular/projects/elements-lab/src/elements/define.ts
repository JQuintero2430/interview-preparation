import { Injector } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { LabHelloElement } from './hello';
import { LabRatingElement } from './section-1/rating';
import { LabShadowNoteElement } from './section-3/shadow-note';
import { defineRatingA } from './exercise-2-rating/a/define';
import { defineRatingB } from './exercise-2-rating/b/define';

// Append-only: each later task adds one guarded `customElements.define('m37-…', createCustomElement(…))` below.
export function defineLabElements(injector: Injector): void {
  // HOUSE-38
  if (!customElements.get('m37-hello')) {
    customElements.define('m37-hello', createCustomElement(LabHelloElement, { injector }));
  }
  // SEC-M37-01
  if (!customElements.get('m37-rating')) {
    customElements.define('m37-rating', createCustomElement(LabRatingElement, { injector }));
  }
  // SEC-M37-03
  if (!customElements.get('m37-shadow-note')) {
    customElements.define('m37-shadow-note', createCustomElement(LabShadowNoteElement, { injector }));
  }
  // EX-M37-02
  defineRatingA(injector);
  defineRatingB(injector);
}
