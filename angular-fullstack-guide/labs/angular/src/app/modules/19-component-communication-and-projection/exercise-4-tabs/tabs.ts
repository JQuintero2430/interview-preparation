import { Component, computed, contentChildren, model } from '@angular/core';
import { Tab } from './tab';

@Component({
  selector: 'lab-m19-tabs',
  template: `
    <div role="tablist">
      @for (tab of tabs(); track tab; let i = $index) {
        <button type="button" role="tab" [disabled]="tab.disabled()" [attr.aria-selected]="i === selected()" (click)="selected.set(i)">
          {{ tab.label() }}
        </button>
      }
    </div>
    <ng-content />
  `,
})
export class Tabs {
  readonly selected = model(0);
  protected readonly tabs = contentChildren(Tab);
  readonly activeTab = computed(() => this.tabs()[this.selected()]);
}
