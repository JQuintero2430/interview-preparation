import { Component, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { LabM25OrderHost, LabM25QuantityStepper } from './quantity-stepper';
import { LabM25QuantityStepperSplit, LabM25StepperRange } from './quantity-stepper-split';

abstract class LabM25OrderFormBase implements LabM25OrderHost {
  readonly max = signal(10);
  protected readonly form = new FormGroup({ quantity: new FormControl(3, { nonNullable: true }) });

  control(): AbstractControl {
    return this.form.controls.quantity;
  }
}

@Component({
  selector: 'lab-m25-order-form',
  imports: [ReactiveFormsModule, LabM25QuantityStepper],
  template: `
    <form [formGroup]="form">
      <lab-m25-quantity-stepper formControlName="quantity" [min]="1" [max]="max()" />
    </form>
  `,
})
export class LabM25OrderForm extends LabM25OrderFormBase {}

@Component({
  selector: 'lab-m25-order-form-split',
  imports: [ReactiveFormsModule, LabM25QuantityStepperSplit, LabM25StepperRange],
  template: `
    <form [formGroup]="form">
      <lab-m25-quantity-stepper-split formControlName="quantity" [min]="1" [max]="max()" />
    </form>
  `,
})
export class LabM25OrderFormSplit extends LabM25OrderFormBase {}
