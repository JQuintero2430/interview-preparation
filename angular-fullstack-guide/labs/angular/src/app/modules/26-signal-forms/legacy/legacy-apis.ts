// LEGACY: Signal Forms APIs deprecated in v22, kept for the guide's `#### Legacy` subsections of module 26.
// New code uses the replacements. Later SEC tasks add exports below and keep these unchanged.
import { Component, forwardRef, input, model, output, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { disabled, required, schema } from '@angular/forms/signals';

export interface LabM26LegacyOrder {
  company: boolean;
  vat: string;
}

/** Legacy: passing a function directly to `disabled` is deprecated since v22.0. Replacement: `labM26OrderSchema`. */
export const labM26LegacyOrderSchema = schema<LabM26LegacyOrder>((p) => {
  required(p.vat);
  disabled(p.vat, ({ valueOf }) => !valueOf(p.company));
});

/** Replacement for `labM26LegacyOrderSchema`: the same condition inside `{ when }`. */
export const labM26OrderSchema = schema<LabM26LegacyOrder>((p) => {
  required(p.vat);
  disabled(p.vat, { when: ({ valueOf }) => !valueOf(p.company) });
});

/** Legacy: a `ControlValueAccessor` component. `[formField]` still binds it, as the backwards-compatibility path. Replacement: `LabM26ValueControl`. */
@Component({
  selector: 'lab-m26-legacy-accessor',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => LabM26LegacyAccessor), multi: true },
  ],
  template: `<input
    id="inner"
    [value]="text()"
    [disabled]="off()"
    (input)="typed($event)"
    (blur)="onTouched()"
  />`,
})
export class LabM26LegacyAccessor implements ControlValueAccessor {
  readonly log: string[] = [];
  protected readonly text = signal('');
  protected readonly off = signal(false);
  protected onChange: (value: string) => void = () => undefined;
  protected onTouched: () => void = () => undefined;

  writeValue(value: string): void {
    this.log.push(`writeValue:${value}`);
    this.text.set(value);
  }
  registerOnChange(fn: (value: string) => void): void {
    this.log.push('registerOnChange');
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.log.push('registerOnTouched');
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.log.push(`setDisabledState:${isDisabled}`);
    this.off.set(isDisabled);
  }
  protected typed(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.onChange(event.target.value);
    }
  }
}

/** Replacement for `LabM26LegacyAccessor`: one required `model()`, a bound `disabled` input and a `touch` output, no provider. */
@Component({
  selector: 'lab-m26-value-control',
  template: `<input
    id="inner"
    [value]="value()"
    [disabled]="disabled()"
    (input)="typed($event)"
    (blur)="touch.emit()"
  />`,
})
export class LabM26ValueControl {
  readonly value = model('');
  readonly disabled = input(false);
  readonly touch = output<void>();

  protected typed(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.value.set(event.target.value);
    }
  }
}
