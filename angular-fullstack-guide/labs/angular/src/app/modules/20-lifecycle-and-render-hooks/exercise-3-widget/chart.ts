import {
  Component,
  DestroyRef,
  ElementRef,
  afterEveryRender,
  afterNextRender,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { ChartLog, FakeChart } from './fake-chart';

@Component({ selector: 'lab-m20-chart', template: `{{ size() }}` })
export class Chart {
  readonly data = input.required<readonly number[]>();
  readonly size = signal(0);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly log = inject(ChartLog);
  private chart: FakeChart | undefined;

  constructor() {
    // Registered first on purpose: the phase decides the order, not the registration.
    afterEveryRender({
      read: () => {
        this.log.entries.push('read');
        this.size.set(Math.round(this.host.nativeElement.getBoundingClientRect().width));
      },
    });
    afterNextRender({
      write: () => {
        this.log.entries.push('write');
        this.chart = new FakeChart(this.host.nativeElement, this.data());
        this.log.charts.push(this.chart);
      },
    });
    effect(() => {
      const data = this.data();
      this.chart?.update(data);
    });
    effect(() => {
      const size = this.size();
      this.chart?.resize(size);
    });
    inject(DestroyRef).onDestroy(() => this.chart?.destroy());
  }
}
