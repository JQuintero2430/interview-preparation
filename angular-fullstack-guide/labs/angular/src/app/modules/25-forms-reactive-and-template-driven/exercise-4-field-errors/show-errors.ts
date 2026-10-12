import { AbstractControl } from '@angular/forms';

/** The error display policy: an invalid control shows its errors once touched, or once the form was submitted. */
export function shouldShowErrors(control: AbstractControl, submitted: boolean): boolean {
  return control.invalid && (control.touched || submitted);
}
