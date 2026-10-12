import { Component, input, model, output, signal } from '@angular/core';

// The child side of [(count)]: model() declares the input `count` and the output `countChange`.
@Component({
  selector: 'lab-count-stepper',
  template: `<button type="button" (click)="count.set(count() + 1)">{{ count() }}</button>`,
})
export class CountStepper {
  readonly count = model(0);
}

// The same pair written by hand: an input and an output named after it plus `Change`.
@Component({
  selector: 'lab-manual-stepper',
  template: `<button type="button" (click)="countChange.emit(count() + 1)">{{ count() }}</button>`,
})
export class ManualStepper {
  readonly count = input(0);
  readonly countChange = output<number>();
}

// A parent that binds a signal: the compiler writes `total.set(value)`.
@Component({
  selector: 'lab-signal-parent',
  imports: [CountStepper],
  template: `
    <lab-count-stepper [(count)]="total" />
    <output>{{ total() }}</output>
  `,
})
export class SignalParent {
  readonly total = signal(0);
}

// A parent that binds a plain property: the compiler writes `total = value`.
@Component({
  selector: 'lab-plain-parent',
  imports: [CountStepper],
  template: `<lab-count-stepper [(count)]="total" />`,
})
export class PlainParent {
  total = 0;
}

// A parent that binds the hand-written pair to a signal.
@Component({
  selector: 'lab-manual-parent',
  imports: [ManualStepper],
  template: `
    <lab-manual-stepper [(count)]="total" />
    <output>{{ total() }}</output>
  `,
})
export class ManualParent {
  readonly total = signal(0);
}
