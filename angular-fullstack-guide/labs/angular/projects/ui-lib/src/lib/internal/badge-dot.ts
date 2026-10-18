import { Component } from '@angular/core';

/** Internal component: used by UiBadge, not exported from public-api.ts, so it is not part of the public API. */
@Component({
  selector: 'ui-badge-dot',
  template: `<i class="ui-badge-dot" aria-hidden="true"></i>`,
})
export class UiBadgeDot {}
