import { Component, computed, inject, input } from '@angular/core';
import { formatStatus } from '../internal/format-status';
import { UI_STATUS_CONFIG } from '../internal/status-config';

/** A coloured-by-CSS status label; the text comes from the provided labels or the formatter. */
@Component({
  selector: 'ui-status-pill',
  template: `<span class="ui-status-pill">{{ text() }}</span>`,
})
export class UiStatusPill {
  readonly status = input.required<string>();
  private readonly config = inject(UI_STATUS_CONFIG);
  protected readonly text = computed(() => this.config.labels[this.status()] ?? formatStatus(this.status()));
}
