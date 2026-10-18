import { Component } from '@angular/core';

/** One theme on `html`, read in three places: the page's own color scheme, a subtree forced dark and a subtree forced light. */
@Component({
  selector: 'lab-m36-q06',
  host: { class: 'm36-out-page' },
  template: `
    <h1>Q36.06: one theme, three color schemes</h1>

    <!-- 1. Each region holds a swatch that reads var(--mat-sys-primary) as its background. -->
    <section aria-labelledby="m36-q06-page">
      <h2 id="m36-q06-page">Page scheme</h2>
      <div class="m36-out-swatch">Primary</div>
    </section>

    <!-- 2. color-scheme: dark on the region makes light-dark() pick the dark color, whatever the preference. -->
    <section aria-labelledby="m36-q06-dark" class="m36-out-dark">
      <h2 id="m36-q06-dark">Dark subtree</h2>
      <div class="m36-out-swatch">Primary</div>
    </section>

    <section aria-labelledby="m36-q06-light" class="m36-out-light">
      <h2 id="m36-q06-light">Light subtree</h2>
      <div class="m36-out-swatch">Primary</div>
    </section>
  `,
})
export class LabM36Q06 {}
