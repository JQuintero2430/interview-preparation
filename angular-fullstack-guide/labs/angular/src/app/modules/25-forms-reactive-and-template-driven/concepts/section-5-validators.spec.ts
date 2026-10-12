import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

const labM25NoSpaces: ValidatorFn = (control) => (/\s/.test(String(control.value)) ? { noSpaces: true } : null);

function labM25StartsWith(prefix: string): ValidatorFn {
  return (control) =>
    String(control.value).startsWith(prefix) ? null : { startsWith: { required: prefix, actual: control.value } };
}

function labM25PasswordsMatch(group: AbstractControl): ValidationErrors | null {
  return group.get('pw')?.value === group.get('confirm')?.value ? null : { mismatch: true };
}

@Component({
  selector: 'lab-m25-min-host',
  imports: [ReactiveFormsModule],
  template: `<input id="text" type="text" min="5" [formControl]="textControl" />
    <input id="number" type="number" min="5" [formControl]="numberControl" />`,
})
class LabM25MinHost {
  readonly textControl = new FormControl('1');
  readonly numberControl = new FormControl(1);
}

describe('Section 5: validators', () => {
  it('Section 5: required treats spaces, 0 and false as present', () => {
    const required = (value: unknown) => Validators.required(new FormControl(value));
    expect(required('')).toEqual({ required: true });
    expect(required(null)).toEqual({ required: true });
    expect(required([])).toEqual({ required: true });
    expect(required(' ')).toBeNull();
    expect(required(0)).toBeNull();
    expect(required(false)).toBeNull();
    expect(Validators.requiredTrue(new FormControl(false))).toEqual({ required: true });
  });

  it('Section 5: minLength, pattern and email leave an empty value to required', () => {
    const minLength3 = Validators.minLength(3);
    expect(minLength3(new FormControl(''))).toBeNull();
    expect(minLength3(new FormControl('ab'))).toEqual({ minlength: { requiredLength: 3, actualLength: 2 } });
    expect(Validators.minLength(2)(new FormControl([1]))).toEqual({ minlength: { requiredLength: 2, actualLength: 1 } });
    expect(Validators.minLength(2)(new FormControl(new Set([1])))).toEqual({
      minlength: { requiredLength: 2, actualLength: 1 },
    });
    expect(Validators.pattern('[a-z]+')(new FormControl(''))).toBeNull();
    expect(Validators.email(new FormControl(''))).toBeNull();
    expect(Validators.email(new FormControl('a@b'))).toBeNull();
    expect(Validators.email(new FormControl('ab'))).toEqual({ email: true });
  });

  it('Section 5: a string pattern is anchored and a RegExp is not', () => {
    const control = new FormControl('abc1');
    expect(Validators.pattern('[a-z]+')(control)).toEqual({
      pattern: { requiredPattern: '^[a-z]+$', actualValue: 'abc1' },
    });
    expect(Validators.pattern(/[a-z]+/)(control)).toBeNull();
  });

  it('Section 5: Validators.min parses a numeric string', () => {
    const min3 = Validators.min(3);
    expect(min3(new FormControl('2'))).toEqual({ min: { min: 3, actual: '2' } });
    expect(min3(new FormControl('abc'))).toBeNull();
    expect(min3(new FormControl(''))).toBeNull();
    expect(min3(new FormControl(null))).toBeNull();
    expect(Validators.max(3)(new FormControl(5))).toEqual({ max: { max: 3, actual: 5 } });
  });

  it('Section 5: the min attribute validates only number inputs', () => {
    const fixture = TestBed.createComponent(LabM25MinHost);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    expect(host.textControl.errors).toBeNull();
    expect(host.numberControl.errors).toEqual({ min: { min: 5, actual: 1 } });
    const number = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>('#number');
    number!.value = '7';
    number!.dispatchEvent(new Event('input'));
    expect(host.numberControl.value).toBe(7);
    expect(host.numberControl.errors).toBeNull();
  });

  it('Section 5: the error maps of several validators merge', () => {
    const control = new FormControl('a b', [Validators.minLength(5), labM25NoSpaces, labM25StartsWith('A')]);
    expect(control.errors).toEqual({
      minlength: { requiredLength: 5, actualLength: 3 },
      noSpaces: true,
      startsWith: { required: 'A', actual: 'a b' },
    });
    control.setValue('Abcde');
    expect(control.errors).toBeNull();
    expect(new FormControl('a', [Validators.required, Validators.minLength(3)]).errors).toEqual({
      minlength: { requiredLength: 3, actualLength: 1 },
    });
    const sameKey = new FormControl('x', [() => ({ clash: 1 }), () => ({ clash: 2 })]);
    expect(sameKey.errors).toEqual({ clash: 2 });
  });

  it('Section 5: a group validator puts its error on the group', () => {
    const group = new FormGroup(
      { pw: new FormControl('a'), confirm: new FormControl('b') },
      { validators: labM25PasswordsMatch },
    );
    expect(group.errors).toEqual({ mismatch: true });
    expect(group.status).toBe('INVALID');
    expect(group.controls.confirm.errors).toBeNull();
    expect(group.controls.confirm.status).toBe('VALID');
    expect(group.hasError('mismatch')).toBe(true);
    expect(group.hasError('mismatch', 'confirm')).toBe(false);
    group.controls.confirm.setValue('a');
    expect(group.errors).toBeNull();
  });

  it('Section 5: setErrors lasts until the next validation run', () => {
    const control = new FormControl('x', Validators.required);
    control.setErrors({ server: 'taken' });
    expect(control.errors).toEqual({ server: 'taken' });
    expect(control.status).toBe('INVALID');
    control.setValue('y');
    expect(control.errors).toBeNull();
    expect(control.status).toBe('VALID');
  });

  it('Section 5: removeValidators needs the same function reference', () => {
    const fresh = new FormControl('ab', [Validators.required, Validators.minLength(3)]);
    fresh.removeValidators(Validators.minLength(3));
    fresh.updateValueAndValidity();
    expect(fresh.errors).toEqual({ minlength: { requiredLength: 3, actualLength: 2 } });
    expect(fresh.hasValidator(Validators.minLength(3))).toBe(false);

    const min3 = Validators.minLength(3);
    const stored = new FormControl('ab', [Validators.required, min3]);
    expect(stored.hasValidator(min3)).toBe(true);
    stored.removeValidators(min3);
    expect(stored.errors).toEqual({ minlength: { requiredLength: 3, actualLength: 2 } });
    stored.updateValueAndValidity();
    expect(stored.errors).toBeNull();

    stored.removeValidators(Validators.required);
    expect(stored.hasValidator(Validators.required)).toBe(false);
  });
});
