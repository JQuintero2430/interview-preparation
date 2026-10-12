import { Component, signal } from '@angular/core';
import { Chart } from './chart';

@Component({
  selector: 'lab-m20-chart-host',
  imports: [Chart],
  template: `
    @if (shown()) {
      <lab-m20-chart [data]="data()" />
    }
  `,
})
export class ChartHost {
  readonly shown = signal(true);
  readonly data = signal<readonly number[]>([1, 2, 3]);
}
