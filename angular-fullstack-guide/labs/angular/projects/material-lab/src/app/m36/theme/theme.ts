import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';

/** One theme on `html`, read twice: once under the page's color scheme and once inside a subtree that forces dark. */
@Component({
  selector: 'lab-m36-theme',
  imports: [MatButton],
  host: { class: 'm36-theme' },
  template: `
    <h1>Section 3: one theme, light and dark</h1>

    <section aria-labelledby="m36-theme-page">
      <h2 id="m36-theme-page">Page color scheme</h2>
      <!-- 1. The swatch reads the system variable directly; the button reads it through its component token. -->
      <div class="m36-swatch">Primary</div>
      <button matButton="filled" type="button">Save</button>
    </section>

    <section aria-labelledby="m36-theme-dark" class="m36-dark-panel">
      <h2 id="m36-theme-dark">Dark subtree</h2>
      <!-- 2. Same variables, inherited from html; color-scheme: dark on the section makes light-dark() pick the dark value. -->
      <div class="m36-swatch">Primary</div>
      <button matButton="filled" type="button">Save</button>
    </section>
  `,
})
export class LabM36Theme {}
