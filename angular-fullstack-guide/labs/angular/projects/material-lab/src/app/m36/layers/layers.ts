import { Component } from '@angular/core';
import { Listbox, Option } from '@angular/aria/listbox';
import { CdkListbox, CdkOption } from '@angular/cdk/listbox';
import { MatListOption, MatSelectionList } from '@angular/material/list';

interface Size {
  readonly value: string;
  readonly label: string;
}

const SIZES: readonly Size[] = [
  { value: 's', label: 'Small' },
  { value: 'm', label: 'Medium' },
  { value: 'l', label: 'Large' },
];

/** One "pick a size" control built three ways: styled (Material), behavior only (CDK), headless pattern (Aria). */
@Component({
  selector: 'lab-m36-layers',
  imports: [MatSelectionList, MatListOption, CdkListbox, CdkOption, Listbox, Option],
  host: { class: 'm36-layers' },
  template: `
    <h1>Section 1: one control, three layers</h1>

    <section aria-labelledby="m36-layers-material">
      <h2 id="m36-layers-material">Material version</h2>
      <!-- 1. Material: the component brings its markup, its styles and its behavior. -->
      <mat-selection-list aria-label="Size" [multiple]="false">
        @for (size of sizes; track size.value) {
          <mat-list-option [value]="size.value">{{ size.label }}</mat-list-option>
        }
      </mat-selection-list>
    </section>

    <section aria-labelledby="m36-layers-cdk">
      <h2 id="m36-layers-cdk">CDK version</h2>
      <!-- 2. CDK: behavior on your markup; the m36- classes are the whole look. -->
      <ul cdkListbox aria-label="Size" class="m36-listbox">
        @for (size of sizes; track size.value) {
          <li [cdkOption]="size.value" class="m36-option">{{ size.label }}</li>
        }
      </ul>
    </section>

    <section aria-labelledby="m36-layers-aria">
      <h2 id="m36-layers-aria">Aria version</h2>
      <!-- 3. Aria: the WAI-ARIA listbox pattern on your markup, configured through signal inputs. -->
      <ul ngListbox aria-label="Size" class="m36-listbox">
        @for (size of sizes; track size.value) {
          <li ngOption [value]="size.value" [label]="size.label" class="m36-option">{{ size.label }}</li>
        }
      </ul>
    </section>
  `,
})
export class LabM36Layers {
  protected readonly sizes = SIZES;
}
