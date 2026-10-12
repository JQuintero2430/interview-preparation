import { Component, signal } from '@angular/core';
import { FreezeWhenHidden } from './freeze-when-hidden';
import { LivePanel } from './live-panel';

// OnPush, the v22 default: the panel's inputs come from this host's signals.
@Component({
  selector: 'lab-m21-e5-host',
  imports: [FreezeWhenHidden, LivePanel],
  template: `@if (shown()) {
    <lab-m21-e5-panel [labM21E5Freeze]="hidden()" [title]="title()" />
  }`,
})
export class PanelHost {
  readonly hidden = signal(false);
  readonly shown = signal(true);
  readonly title = signal('first');
}
