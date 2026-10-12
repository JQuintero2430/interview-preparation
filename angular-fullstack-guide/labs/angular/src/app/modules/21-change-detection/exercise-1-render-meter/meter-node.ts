import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Directive,
  inject,
  input,
  signal,
} from '@angular/core';
import { RenderMeter } from './render-meter';

@Directive()
export abstract class Metered {
  private readonly meter = inject(RenderMeter);
  readonly name = input.required<string>();

  protected tpl(): string {
    this.meter.hit(this.name());
    return '';
  }
}

@Component({
  selector: 'lab-m21-e1-leaf',
  template: `<button type="button" (click)="clicked = true">{{ tpl() }}</button>{{ n() }}{{
    data().n
  }}`,
})
export class MeterLeaf extends Metered {
  readonly data = input<{ n: number }>({ n: 0 });
  readonly n = signal(0);
  readonly cdr = inject(ChangeDetectorRef);
  clicked = false;
}

@Component({
  selector: 'lab-m21-e1-node',
  imports: [MeterLeaf],
  template: `{{ tpl() }}<lab-m21-e1-leaf [name]="name() + '-leaf'" />`,
})
export class MeterNode extends Metered {}

// Eager on purpose: the walk refreshes it whenever it reaches it in global mode.
@Component({
  selector: 'lab-m21-e1-eager-node',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MeterLeaf],
  template: `{{ tpl() }}<lab-m21-e1-leaf [name]="name() + '-leaf'" />`,
})
export class EagerMeterNode extends Metered {}
