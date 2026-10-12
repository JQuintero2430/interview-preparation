import { Component, input } from '@angular/core';

export interface Item {
  readonly id: string;
  readonly title: string;
}

@Component({
  selector: 'lab-m18-e2-row',
  // The input has no binding: what the user types is DOM state that only the row view keeps.
  template: `<input [attr.aria-label]="item().title" /> <span>{{ item().title }}</span>`,
})
export class Row {
  readonly item = input.required<Item>();
}
