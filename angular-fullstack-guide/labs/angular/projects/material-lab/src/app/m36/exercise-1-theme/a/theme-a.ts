import { Component, inject } from '@angular/core';
import { LabM36ProfileCard } from '../profile-card';
import { LabM36Shell } from '../shell';
import { ThemeChoice } from '../theme-choice';

/** Variant a: the one `mat.theme` on `html` (color-scheme `light dark`) stays; the choice sets `color-scheme` on the shell. */
@Component({
  selector: 'lab-m36-theme-a',
  imports: [LabM36Shell, LabM36ProfileCard],
  template: `
    <lab-m36-shell heading="Exercise 36.1: a themed shell, variant a" [colorScheme]="theme.colorScheme()">
      <lab-m36-profile-card />
    </lab-m36-shell>
  `,
})
export class LabM36ThemeA {
  protected readonly theme = inject(ThemeChoice);
}
