import { Component, inject, input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatButtonToggle, MatButtonToggleChange, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { MatToolbar } from '@angular/material/toolbar';
import { isThemeChoice, ThemeChoice } from './theme-choice';

/** A toolbar with the three-way switch and a filled button; the host carries the brand override class. */
@Component({
  selector: 'lab-m36-shell',
  imports: [MatToolbar, MatButtonToggleGroup, MatButtonToggle, MatButton],
  host: { class: 'm36-shell', '[style.color-scheme]': 'colorScheme()' },
  template: `
    <mat-toolbar>
      <h1 class="m36-shell-title">{{ heading() }}</h1>
      <mat-button-toggle-group aria-label="Color scheme" [value]="theme.choice()" (change)="pick($event)">
        <mat-button-toggle value="system">System</mat-button-toggle>
        <mat-button-toggle value="light">Light</mat-button-toggle>
        <mat-button-toggle value="dark">Dark</mat-button-toggle>
      </mat-button-toggle-group>
    </mat-toolbar>
    <main class="m36-shell-main">
      <button matButton="filled" type="button">Save</button>
      <ng-content />
    </main>
  `,
})
export class LabM36Shell {
  protected readonly theme = inject(ThemeChoice);

  readonly heading = input.required<string>();
  /** The `color-scheme` to set on the shell, or `null` when the page sets it elsewhere (variant b sets it on `html`). */
  readonly colorScheme = input<string | null>(null);

  protected pick(event: MatButtonToggleChange): void {
    if (isThemeChoice(event.value)) this.theme.select(event.value);
  }
}
