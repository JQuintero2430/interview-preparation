import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'lab-m24-product-tab',
  template: `<p>{{ tab() }} of {{ id() }}, sort: {{ sort() ?? 'newest' }}</p>`,
})
export class LabM24ProductTab {
  readonly id = input<string>();
  readonly tab = input<string>();
  readonly sort = input<string>();
}

/** The alternative: the default label lives in the class instead of the template. */
@Component({
  selector: 'lab-m24-product-tab-computed',
  template: `<p>{{ tab() }} of {{ id() }}, sort: {{ sortLabel() }}</p>`,
})
export class LabM24ProductTabComputed extends LabM24ProductTab {
  protected readonly sortLabel = computed(() => this.sort() ?? 'newest');
}
