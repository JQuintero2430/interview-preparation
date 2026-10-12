import { booleanAttribute, Component, computed, inject, input } from '@angular/core';
import { Tabs } from './tabs';

// One panel of a <lab-m19-tabs>. It asks the Tabs it sits in whether it is the selected one.
@Component({
  selector: 'lab-m19-tab',
  template: `<ng-content />`,
  host: { role: 'tabpanel', '[hidden]': '!active()' },
})
export class Tab {
  readonly label = input.required<string>();
  readonly disabled = input(false, { transform: booleanAttribute });
  // No `optional`: a tab outside lab-m19-tabs fails at creation with a clear injection error.
  private readonly tabs = inject(Tabs);
  protected readonly active = computed(() => this.tabs.activeTab() === this);
}
