import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { LabM36Rating } from './a/rating';

export interface LabM36Profile {
  name: string;
  plan: string;
  rating: number;
}

/** Imports variant a's rating; a spec swaps in variant b, which has the same selector and inputs. */
@Component({
  selector: 'lab-m36-profile-form',
  imports: [ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatSelect, MatOption, MatButton, LabM36Rating],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()">
      <mat-form-field>
        <mat-label>Name</mat-label>
        <input matInput formControlName="name" />
      </mat-form-field>
      <mat-form-field>
        <mat-label>Plan</mat-label>
        <mat-select formControlName="plan">
          @for (plan of plans; track plan) {
            <mat-option [value]="plan">{{ plan }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <lab-m36-rating
        label="Satisfaction"
        [value]="form.controls.rating.value"
        (valueChange)="form.controls.rating.setValue($event)"
      />
      <button matButton="filled" type="submit">Save profile</button>
    </form>
  `,
})
export class LabM36ProfileForm {
  readonly submitted = signal<LabM36Profile | null>(null);
  protected readonly plans = ['Free', 'Pro', 'Team'];
  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: Validators.required }),
    plan: new FormControl('', { nonNullable: true, validators: Validators.required }),
    rating: new FormControl(0, { nonNullable: true, validators: Validators.min(1) }),
  });

  protected submit(): void {
    if (this.form.valid) {
      this.submitted.set(this.form.getRawValue());
    }
  }
}
