import { Component, ViewEncapsulation } from '@angular/core';

/** `<m37-shadow-note>`: a paragraph styled inside its own shadow root. */
@Component({
  selector: 'lab-m37-shadow-note',
  encapsulation: ViewEncapsulation.ShadowDom,
  template: `<p class="m37-note">Inside the shadow root</p>`,
  styles: `
    p {
      color: rgb(255, 0, 0);
    }
  `,
})
export class LabShadowNoteElement {}
