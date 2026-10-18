import { Component, inject } from '@angular/core';
import { ViewTransitionLog } from '../../../view-transition-log';
import { LabM35Ex4List } from '../list';
import { transitionName } from '../products';

// Exercise 35.4, variant b: no click state. The app's onViewTransitionCreated hook records the transition's paths;
// a card carries the name only when the last transition goes to its detail page or comes back from it.
@Component({
  selector: 'lab-m35-ex4-products-b',
  imports: [LabM35Ex4List],
  template: `<lab-m35-ex4-list variant="b" base="/m35/ex4/b" [nameOf]="nameOf" />`,
})
export class LabM35Ex4ProductsB {
  private readonly log = inject(ViewTransitionLog);
  protected readonly nameOf = (id: number): string | null => {
    const last = this.log.last();
    const detail = `/m35/ex4/b/product/${id}`;
    return last && (last.to === detail || last.from === detail) ? transitionName(id) : null;
  };
}
