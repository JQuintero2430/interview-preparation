import { Component, input, signal } from '@angular/core';

@Component({ selector: 'lab-m21-e5-child', template: `<p class="child">{{ count() }}</p>` })
export class PanelChild {
  readonly count = signal(0);
}

@Component({
  selector: 'lab-m21-e5-panel',
  imports: [PanelChild],
  template: `<p class="value">{{ track() }}{{ title() }}:{{ value() }}</p>
    <lab-m21-e5-child />`,
})
export class LivePanel {
  readonly title = input('first');
  readonly value = signal(0);
  runs = 0;

  protected track(): string {
    this.runs += 1;
    return '';
  }
}
