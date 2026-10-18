import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'lab-m36-email-field',
  imports: [ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatError],
  template: `
    <mat-form-field>
      <mat-label>Email</mat-label>
      <input matInput [formControl]="email" />
      <mat-error>Enter a valid email address</mat-error>
    </mat-form-field>
  `,
})
class LabM36EmailField {
  readonly email = new FormControl('not-an-email', { nonNullable: true, validators: [Validators.email] });
}

@Component({
  selector: 'lab-m36-button-appearances',
  imports: [MatButton],
  template: `
    <button matButton="filled">Filled</button>
    <button mat-flat-button>Legacy flat</button>
    <button matButton>Plain</button>
  `,
})
class LabM36ButtonAppearances {}

describe('Section 2: Material in a v22 app', () => {
  it('Section 2: the error shows only after the control is touched', async () => {
    const fixture = TestBed.createComponent(LabM36EmailField);
    fixture.detectChanges();
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    const input = root.querySelector('input');

    // Invalid from the first check, yet no error: the default matcher also needs touched (or a submitted form).
    expect(fixture.componentInstance.email.invalid).toBe(true);
    expect(fixture.componentInstance.email.touched).toBe(false);
    expect(root.querySelector('mat-error')).toBeNull();
    expect(input?.getAttribute('aria-invalid')).toBe('false');

    // The blur listener of the value accessor marks the control touched; the next check lets the matcher answer.
    input?.dispatchEvent(new Event('blur'));
    fixture.detectChanges();
    await fixture.whenStable();

    const error = root.querySelector('mat-error');
    expect(error?.textContent).toBe('Enter a valid email address');
    expect(input?.getAttribute('aria-invalid')).toBe('true');
    expect(input?.getAttribute('aria-describedby')).toBe(error?.id);
  });

  it('Section 2: MatButton applies the filled appearance class', () => {
    const fixture = TestBed.createComponent(LabM36ButtonAppearances);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    const [filled, legacy, plain] = Array.from(root.querySelectorAll('button'));

    // `matButton="filled"` and the older `mat-flat-button` selector land on the same class and the same appearance classes.
    for (const button of [filled, legacy]) {
      expect(button?.classList.contains('mdc-button')).toBe(true);
      expect(button?.classList.contains('mdc-button--unelevated')).toBe(true);
      expect(button?.classList.contains('mat-mdc-unelevated-button')).toBe(true);
    }
    // A bare `matButton` is the text appearance.
    expect(plain?.classList.contains('mat-mdc-button')).toBe(true);
    expect(plain?.classList.contains('mat-mdc-unelevated-button')).toBe(false);
  });
});
