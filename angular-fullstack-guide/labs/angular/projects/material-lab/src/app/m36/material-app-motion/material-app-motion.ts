import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { _getAnimationsState } from '@angular/material/core';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';

/** A page about motion: no `MATERIAL_ANIMATIONS` provider, so the state comes from the browser's reduced-motion preference. */
@Component({
  selector: 'lab-m36-material-app-motion',
  imports: [MatButton, MatMenu, MatMenuItem, MatMenuTrigger],
  host: { class: 'm36-material-app' },
  template: `
    <h1>Section 2: Material motion</h1>
    <p>Animations state: {{ state }}</p>
    <button matButton [matMenuTriggerFor]="menu">Menu</button>
    <mat-menu #menu="matMenu">
      <button mat-menu-item>Rename draft</button>
      <button mat-menu-item>Duplicate draft</button>
    </mat-menu>
  `,
})
export class LabM36MaterialAppMotion {
  // Internal (`@docs-private`) function: it reads the token and the media query once per page load. A field initializer is an injection context.
  protected readonly state = _getAnimationsState();
}
