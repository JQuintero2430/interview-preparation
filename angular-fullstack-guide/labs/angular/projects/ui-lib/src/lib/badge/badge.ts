import { Component, computed, input } from '@angular/core';
import { UiBadgeDot } from '../internal/badge-dot';
import { formatCount } from '../internal/format-count';

/** A small text badge: the library's first public component. */
@Component({
  selector: 'ui-badge',
  imports: [UiBadgeDot],
  template: `<span class="ui-badge">{{ label() }}@if (count() > 0) { ({{ shownCount() }}) }</span><ui-badge-dot />`,
})
export class UiBadge {
  readonly label = input.required<string>();
  readonly count = input(0);
  protected readonly shownCount = computed(() => formatCount(this.count()));
}
