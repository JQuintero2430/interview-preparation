import { Component, forwardRef, model } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  AbstractControl,
  ControlValueAccessor,
  FormControl,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import { labM25LegacyCallSetDisabledState } from '../legacy/legacy-apis';

let calls: string[] = [];
let hostControl = new FormControl<number | null>(0);
let onChange: (value: number) => void = () => undefined;
let onTouched: () => void = () => undefined;

@Component({
  selector: 'lab-m25-rating',
  template: '<button type="button" (click)="pick(3)" (blur)="touch()">rate</button>',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => LabM25Rating), multi: true },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => LabM25Rating), multi: true },
  ],
})
class LabM25Rating implements ControlValueAccessor, Validator {
  writeValue(value: number | null): void {
    calls.push(`writeValue:${value}`);
  }

  registerOnChange(fn: (value: number) => void): void {
    calls.push('registerOnChange');
    onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    calls.push('registerOnTouched');
    onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    calls.push(`setDisabledState:${isDisabled}`);
  }

  validate(control: AbstractControl): ValidationErrors | null {
    calls.push(`validate:${control.value}`);
    return control.value > 5 ? { tooHigh: true } : null;
  }

  protected pick(value: number): void {
    onChange(value);
  }

  protected touch(): void {
    onTouched();
  }
}

@Component({
  selector: 'lab-m25-rating-host',
  imports: [ReactiveFormsModule, LabM25Rating],
  template: '<lab-m25-rating [formControl]="c" />',
})
class LabM25RatingHost {
  readonly c = hostControl;
}

@Component({
  selector: 'lab-m25-count-model',
  template: '<span>{{ count() }}</span>',
})
class LabM25CountModel {
  readonly count = model(0);
}

@Component({
  selector: 'lab-m25-count-model-host',
  imports: [ReactiveFormsModule, LabM25CountModel],
  template: '<lab-m25-count-model [formControl]="c" />',
})
class LabM25CountModelHost {
  readonly c = new FormControl(1);
}

@Component({
  selector: 'lab-m25-value-model',
  template: '<span>{{ value() }}</span>',
})
class LabM25ValueModel {
  readonly value = model(0);
}

@Component({
  selector: 'lab-m25-value-model-host',
  imports: [ReactiveFormsModule, LabM25ValueModel],
  template: '<lab-m25-value-model [formControl]="c" />',
})
class LabM25ValueModelHost {
  readonly c = new FormControl(1);
}

@Component({
  selector: 'lab-m25-single-provider',
  template: '<span>single</span>',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => LabM25SingleProvider) }],
})
class LabM25SingleProvider implements ControlValueAccessor {
  writeValue(): void {}
  registerOnChange(): void {}
  registerOnTouched(): void {}
}

@Component({
  selector: 'lab-m25-single-provider-host',
  imports: [ReactiveFormsModule, LabM25SingleProvider],
  template: '<lab-m25-single-provider [formControl]="c" />',
})
class LabM25SingleProviderHost {
  readonly c = new FormControl(1);
}

function attach(control: FormControl<number | null>) {
  calls = [];
  hostControl = control;
  const fixture = TestBed.createComponent(LabM25RatingHost);
  fixture.detectChanges();
  const button: HTMLButtonElement = fixture.debugElement.query(By.css('button')).nativeElement;
  return { fixture, button };
}

function withoutValidate(): string[] {
  return calls.filter((call) => !call.startsWith('validate'));
}

describe('Section 10: ControlValueAccessor and Validator', () => {
  it('Section 10: attaching an enabled control calls writeValue, setDisabledState(false), registerOnChange and registerOnTouched', () => {
    attach(new FormControl<number | null>(2));
    expect(withoutValidate()).toEqual(['writeValue:2', 'setDisabledState:false', 'registerOnChange', 'registerOnTouched']);
  });

  it('Section 10: attaching a disabled control calls setDisabledState(true)', () => {
    attach(new FormControl<number | null>({ value: 1, disabled: true }));
    expect(withoutValidate()).toEqual(['writeValue:1', 'setDisabledState:true', 'registerOnChange', 'registerOnTouched']);
  });

  it('Section 10: a view change does not call writeValue and marks the control dirty', () => {
    const control = new FormControl<number | null>(2);
    const { button } = attach(control);
    calls = [];
    button.click();
    expect(calls.some((call) => call.startsWith('writeValue'))).toBe(false);
    expect(control.value).toBe(3);
    expect(control.dirty).toBe(true);
    expect(control.touched).toBe(false);
  });

  it('Section 10: setValue calls writeValue', () => {
    const control = new FormControl<number | null>(2);
    attach(control);
    calls = [];
    control.setValue(9);
    expect(calls).toContain('writeValue:9');
  });

  it('Section 10: disable() calls setDisabledState(true) on an attached control', () => {
    const control = new FormControl<number | null>(2);
    attach(control);
    calls = [];
    control.disable();
    expect(calls).toEqual(['setDisabledState:true']);
  });

  it('Section 10: a component providing NG_VALIDATORS validates its own control', () => {
    const control = new FormControl<number | null>(2);
    attach(control);
    expect(control.valid).toBe(true);
    calls = [];
    control.setValue(9);
    expect(calls).toContain('validate:9');
    expect(control.errors).toEqual({ tooHigh: true });
  });

  it('Section 10: calling the touched callback on blur marks the control touched', () => {
    const control = new FormControl<number | null>(2);
    const { button } = attach(control);
    expect(control.touched).toBe(false);
    button.dispatchEvent(new Event('blur'));
    expect(control.touched).toBe(true);
  });

  it('Section 10: a control without an accessor throws NG01203', () => {
    const fixture = TestBed.createComponent(LabM25CountModelHost);
    expect(() => fixture.detectChanges()).toThrowError(/NG01203/);
  });

  it('Section 10: a component with a value model binds to a formControl without an accessor', () => {
    const fixture = TestBed.createComponent(LabM25ValueModelHost);
    fixture.detectChanges();
    const model: LabM25ValueModel = fixture.debugElement.query(By.directive(LabM25ValueModel)).componentInstance;
    const control = fixture.componentInstance.c;
    expect(model.value()).toBe(1);
    control.setValue(5);
    fixture.detectChanges();
    expect(model.value()).toBe(5);
    model.value.set(7);
    expect(control.value).toBe(7);
    expect(control.dirty).toBe(true);
  });

  it('Section 10: an accessor provided without multi throws NG01200', () => {
    const fixture = TestBed.createComponent(LabM25SingleProviderHost);
    expect(() => fixture.detectChanges()).toThrowError(/NG01200/);
  });

  it('Section 10: withConfig whenDisabledForLegacyCode skips setDisabledState for an enabled control', () => {
    TestBed.configureTestingModule({ imports: [ReactiveFormsModule.withConfig(labM25LegacyCallSetDisabledState)] });
    attach(new FormControl<number | null>(2));
    expect(withoutValidate()).toEqual(['writeValue:2', 'registerOnChange', 'registerOnTouched']);
  });
});
