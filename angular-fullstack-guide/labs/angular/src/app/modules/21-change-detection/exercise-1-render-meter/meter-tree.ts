import { Component, inject, signal } from '@angular/core';
import { EagerMeterNode, MeterLeaf, MeterNode } from './meter-node';
import { RenderMeter } from './render-meter';

@Component({
  selector: 'lab-m21-e1-tree',
  imports: [EagerMeterNode, MeterLeaf, MeterNode],
  template: `{{ tpl() }}{{ tick() }}
    <lab-m21-e1-node name="par" />
    <lab-m21-e1-eager-node name="par-eager" />
    <lab-m21-e1-leaf name="sib" />
    <lab-m21-e1-leaf name="probe" [data]="data" />`,
})
export class MeterTree {
  private readonly meter = inject(RenderMeter);
  readonly tick = signal(0);
  data = { n: 1 };

  protected tpl(): string {
    this.meter.hit('root');
    return '';
  }
}
