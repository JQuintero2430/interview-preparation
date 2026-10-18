import { Component, input } from '@angular/core';
import { LabM29QuantityPicker } from './quantity-picker';

export interface PickerOptions {
  readonly label: string;
  readonly value?: number;
  readonly min?: number;
  readonly max?: number;
}

export interface PickerHandle {
  getValue(): Promise<number>;
  increment(): Promise<void>;
  decrement(): Promise<void>;
  setValue(quantity: number): Promise<void>;
  isDecrementDisabled(): Promise<boolean>;
}

export interface QuantityPickerDriver {
  mount(pickers: readonly PickerOptions[]): Promise<void>;
  picker(label: string): Promise<PickerHandle>;
}

@Component({
  selector: 'lab-m29-picker-host',
  imports: [LabM29QuantityPicker],
  template: `
    @for (picker of pickers(); track picker.label) {
      <lab-m29-quantity-picker
        [label]="picker.label"
        [value]="picker.value ?? 1"
        [min]="picker.min ?? 1"
        [max]="picker.max ?? 10"
      />
    }
  `,
})
export class LabM29PickerHost {
  readonly pickers = input.required<readonly PickerOptions[]>();
}
