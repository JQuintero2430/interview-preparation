import { Component, inject } from '@angular/core';
import { Dir, Direction } from '@angular/cdk/bidi';
import { MatButton } from '@angular/material/button';
import { MatDialog, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';

const DIRECTIONS: readonly Direction[] = ['ltr', 'rtl'];

/** The content of the dialog: the `mat-dialog-*` directives give it a title, a scrolling body and an action row. */
@Component({
  selector: 'lab-m36-delete-dialog',
  imports: [MatButton, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose],
  template: `
    <h2 mat-dialog-title>Delete this draft?</h2>
    <mat-dialog-content>The draft cannot be restored.</mat-dialog-content>
    <mat-dialog-actions>
      <button matButton mat-dialog-close>Keep</button>
      <button matButton="filled" [mat-dialog-close]="true">Delete</button>
    </mat-dialog-actions>
  `,
})
class LabM36DeleteDialog {}

/** Standalone Material imports: a dialog opened by a service, and one menu under `dir="ltr"` and one under `dir="rtl"`. */
@Component({
  selector: 'lab-m36-material-app',
  imports: [MatButton, MatMenu, MatMenuItem, MatMenuTrigger, Dir],
  host: { class: 'm36-material-app' },
  template: `
    <h1>Section 2: Material components in a v22 app</h1>

    <section aria-labelledby="m36-app-dialog">
      <h2 id="m36-app-dialog">Dialog</h2>
      <button matButton="filled" (click)="openDelete()">Delete draft</button>
    </section>

    @for (direction of directions; track direction) {
      <section [attr.aria-label]="'Menu under dir ' + direction" [dir]="direction">
        <button matButton [matMenuTriggerFor]="menu">Menu</button>
        <mat-menu #menu="matMenu">
          <button mat-menu-item>Rename draft</button>
          <button mat-menu-item>Duplicate draft</button>
        </mat-menu>
      </section>
    }
  `,
})
export class LabM36MaterialApp {
  private readonly dialog = inject(MatDialog);
  protected readonly directions = DIRECTIONS;

  protected openDelete(): void {
    this.dialog.open(LabM36DeleteDialog);
  }
}
