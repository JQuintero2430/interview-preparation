import { Component, input, model } from '@angular/core';

@Component({
  selector: 'lab-m29-quantity-picker',
  template: `
    <div role="group" [attr.aria-label]="label()">
      <button type="button" aria-label="Decrease" [disabled]="value() <= min()" (click)="step(-1)">
        -
      </button>
      <input
        #quantity
        type="number"
        aria-label="Quantity"
        [min]="min()"
        [max]="max()"
        [value]="value()"
        (change)="type(quantity)"
      />
      <button type="button" aria-label="Increase" [disabled]="value() >= max()" (click)="step(1)">
        +
      </button>
    </div>
  `,
})
export class LabM29QuantityPicker {
  readonly value = model(1);
  readonly min = input(1);
  readonly max = input(10);
  readonly label = input.required<string>();

  protected step(by: number): void {
    this.value.set(this.clamp(this.value() + by));
  }

  protected type(field: HTMLInputElement): void {
    const typed = field.value === '' ? this.value() : Number(field.value);
    const next = Number.isNaN(typed) ? this.value() : this.clamp(typed);
    this.value.set(next);
    field.value = String(next);
  }

  private clamp(quantity: number): number {
    return Math.min(this.max(), Math.max(this.min(), quantity));
  }
}
