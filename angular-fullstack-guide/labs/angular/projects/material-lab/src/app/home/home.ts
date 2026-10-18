import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'lab-material-home',
  imports: [MatButton, MatFormField, MatLabel, MatInput],
  template: `
    <h1>Module 36 Material and CDK lab</h1>
    <button matButton="filled" type="button">Save</button>
    <mat-form-field>
      <mat-label>Name</mat-label>
      <input matInput />
    </mat-form-field>
  `,
})
export class LabMaterialHome {}
