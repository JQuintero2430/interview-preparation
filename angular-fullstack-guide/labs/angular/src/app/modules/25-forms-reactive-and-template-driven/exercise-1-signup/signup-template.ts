import { Component, inject, viewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { LabM25SignupApi } from './signup-model';

@Component({
  selector: 'lab-m25-signup-template',
  imports: [FormsModule],
  template: `
    <form #f="ngForm" (ngSubmit)="submit(f)">
      <input name="email" type="email" [ngModel]="''" required email />
      <input name="password" type="password" [ngModel]="''" required minlength="8" />
      <input name="newsletter" type="checkbox" [ngModel]="false" />
      <button type="submit">Sign up</button>
    </form>
  `,
})
export class LabM25SignupTemplate {
  private readonly api = inject(LabM25SignupApi);
  readonly form = viewChild.required(NgForm);

  submit(form: NgForm): void {
    if (form.invalid) return;
    this.api.submit(form.value);
  }
}
