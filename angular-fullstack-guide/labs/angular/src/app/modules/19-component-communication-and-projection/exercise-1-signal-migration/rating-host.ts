import { Component, signal } from '@angular/core';
import { LegacyRating } from './legacy/legacy-rating';
import { Rating } from './rating';

@Component({
  selector: 'lab-m19-rating-host',
  imports: [Rating],
  template: `
    <lab-m19-rating label="Quality" max="10" readonly tone="warm" [(value)]="value" (closed)="closes.update((n) => n + 1)">
      <i #slot>a</i><i #slot>b</i>
    </lab-m19-rating>
  `,
})
export class RatingHost {
  readonly value = signal(3);
  readonly closes = signal(0);
}

// Same bindings as RatingHost, aimed at the legacy component.
@Component({
  selector: 'lab-m19-legacy-rating-host',
  imports: [LegacyRating],
  template: `
    <lab-m19-legacy-rating label="Quality" max="10" readonly tone="warm" [(value)]="value" (closed)="closes.update((n) => n + 1)">
      <i #slot>a</i><i #slot>b</i>
    </lab-m19-legacy-rating>
  `,
})
export class LegacyRatingHost {
  readonly value = signal(3);
  readonly closes = signal(0);
}
