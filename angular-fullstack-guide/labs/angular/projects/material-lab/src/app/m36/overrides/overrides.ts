import { Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatDialog, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';

/** A dialog with one filled button: it renders in the overlay container, outside the element that opened it. */
@Component({
  selector: 'lab-m36-brand-dialog',
  imports: [MatButton, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose],
  template: `
    <h2 mat-dialog-title>Brand dialog</h2>
    <mat-dialog-content>A filled button reads the system primary color.</mat-dialog-content>
    <mat-dialog-actions>
      <button matButton="filled" mat-dialog-close>Confirm</button>
    </mat-dialog-actions>
  `,
})
class LabM36BrandDialog {}

/** A component override, a system override that stops at the card, and a custom card that reads system variables. */
@Component({
  selector: 'lab-m36-overrides',
  imports: [MatButton, MatCard, MatCardContent],
  host: { class: 'm36-overrides' },
  template: `
    <h1>Section 4: customizing the theme</h1>

    <section aria-labelledby="m36-ov-component">
      <h2 id="m36-ov-component">Component override</h2>
      <!-- 1. The class sets --mat-button-filled-container-color on this group only. -->
      <div class="m36-brand-buttons" role="group" aria-label="Branded buttons">
        <button matButton="filled" type="button">Save</button>
        <button matButton="filled" type="button">Send</button>
      </div>
      <div role="group" aria-label="Default buttons">
        <button matButton="filled" type="button">Save</button>
        <button matButton="filled" type="button">Send</button>
      </div>
    </section>

    <section aria-labelledby="m36-ov-system">
      <h2 id="m36-ov-system">System override</h2>
      <div class="m36-swatch">Page primary</div>
      <!-- 2. The class sets --mat-sys-primary on the card's subtree; the dialog opens outside it. -->
      <mat-card class="m36-brand" appearance="outlined" role="group" aria-label="Branded card">
        <mat-card-content>
          <div class="m36-swatch">Card primary</div>
          <button matButton="filled" type="button" (click)="openDialog()">Open dialog</button>
          <button matButton="filled" type="button" (click)="openDialog('m36-brand')">Open dialog on branded pane</button>
        </mat-card-content>
      </mat-card>
    </section>

    <section class="m36-custom-card" aria-labelledby="m36-ov-custom">
      <h2 id="m36-ov-custom">Custom card</h2>
      <!-- 3. Plain CSS: the card reads --mat-sys-* variables and exposes --m36-card-accent. -->
      <p>No Material import: the stylesheet reads the system variables.</p>
    </section>
  `,
})
export class LabM36Overrides {
  private readonly dialog = inject(MatDialog);

  protected openDialog(panelClass = ''): void {
    this.dialog.open(LabM36BrandDialog, { panelClass });
  }
}
