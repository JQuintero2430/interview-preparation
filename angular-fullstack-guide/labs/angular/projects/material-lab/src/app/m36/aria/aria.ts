import { Component, signal } from '@angular/core';
import { Tab, TabContent, TabList, TabPanel, Tabs } from '@angular/aria/tabs';

interface ProductSection {
  readonly value: string;
  readonly label: string;
  readonly text: string;
}

const SECTIONS: readonly ProductSection[] = [
  { value: 'details', label: 'Details', text: 'A cotton shirt in three sizes.' },
  { value: 'shipping', label: 'Shipping', text: 'Ships in two working days.' },
  { value: 'returns', label: 'Returns', text: 'Free returns within 30 days.' },
];

/** The WAI-ARIA tabs pattern on plain markup: Angular Aria adds roles, states and keys; styles.scss adds every pixel. */
@Component({
  selector: 'lab-m36-aria',
  imports: [Tabs, TabList, Tab, TabPanel, TabContent],
  host: { class: 'm36-aria' },
  template: `
    <h1>Section 11: Angular Aria tabs</h1>

    <!-- 1. ngTabs only coordinates: it links the tab list to the panels and renders nothing. -->
    <div ngTabs>
      <!-- 2. The tab list: roving focus and selection that follows focus are its defaults; the selected tab is a model. -->
      <ul ngTabList aria-label="Product information" [(selectedTab)]="selectedTab" class="m36-tab-list">
        @for (section of sections; track section.value) {
          <li ngTab [value]="section.value" class="m36-tab">{{ section.label }}</li>
        }
      </ul>
      <!-- 3. A panel matches its tab by value; ngTabContent renders only while the panel is shown. -->
      @for (section of sections; track section.value) {
        <div ngTabPanel [value]="section.value" class="m36-tab-panel">
          <ng-template ngTabContent><p>{{ section.text }}</p></ng-template>
        </div>
      }
    </div>

    <p>Selected tab: <output aria-label="Selected tab">{{ selectedTab() }}</output></p>
  `,
})
export class LabM36Aria {
  protected readonly sections = SECTIONS;
  protected readonly selectedTab = signal<string | undefined>('details');
}
