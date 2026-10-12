import { Component, Directive, signal, viewChild } from '@angular/core';
import { AbstractControl, FormsModule, NgForm } from '@angular/forms';
import { LabM25OrderHost, LabM25QuantityStepper } from './quantity-stepper';
import { LabM25QuantityStepperSplit, LabM25StepperRange } from './quantity-stepper-split';

@Directive()
abstract class LabM25OrderTemplateBase implements LabM25OrderHost {
  readonly max = signal(10);
  protected readonly quantity = signal(3);
  private readonly ngForm = viewChild.required(NgForm);

  control(): AbstractControl {
    return this.ngForm().controls['quantity'];
  }
}

@Component({
  selector: 'lab-m25-order-template',
  imports: [FormsModule, LabM25QuantityStepper],
  template: `
    <form>
      <lab-m25-quantity-stepper name="quantity" [(ngModel)]="quantity" [min]="1" [max]="max()" />
    </form>
  `,
})
export class LabM25OrderTemplate extends LabM25OrderTemplateBase {}

@Component({
  selector: 'lab-m25-order-template-split',
  imports: [FormsModule, LabM25QuantityStepperSplit, LabM25StepperRange],
  template: `
    <form>
      <lab-m25-quantity-stepper-split name="quantity" [(ngModel)]="quantity" [min]="1" [max]="max()" />
    </form>
  `,
})
export class LabM25OrderTemplateSplit extends LabM25OrderTemplateBase {}
