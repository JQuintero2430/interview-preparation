import { Component, DestroyRef, DOCUMENT, effect, inject } from '@angular/core';
import { LabM36ProfileCard } from '../profile-card';
import { LabM36Shell } from '../shell';
import { ThemeChoice } from '../theme-choice';

/** Variant b: two themes in the stylesheet, a light one on `html.m36-b` and a dark one under `html.m36-b.m36-dark`; the choice toggles the class. */
@Component({
  selector: 'lab-m36-theme-b',
  imports: [LabM36Shell, LabM36ProfileCard],
  template: `
    <lab-m36-shell heading="Exercise 36.1: a themed shell, variant b">
      <lab-m36-profile-card />
    </lab-m36-shell>
  `,
})
export class LabM36ThemeB {
  constructor() {
    const root = inject(DOCUMENT).documentElement;
    const theme = inject(ThemeChoice);
    root.classList.add('m36-b');
    effect(() => root.classList.toggle('m36-dark', theme.dark()));
    inject(DestroyRef).onDestroy(() => root.classList.remove('m36-b', 'm36-dark'));
  }
}
