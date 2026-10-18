import { Component } from '@angular/core';

// Section 6 of module 34: two custom-ID messages, one computed-ID message and two identical texts
// told apart by their meaning. `ng extract-i18n` lists all five in `messages.xlf`.
@Component({
  selector: 'lab-m34-extract',
  template: `
    <h2 i18n="@@m34.extract.title">Extraction lab</h2>
    <p i18n="Describes the form|Shown above the save button@@m34.extract.hint">Review your answers</p>
    <p i18n>Welcome back</p>
    <button type="button" i18n="door|Closes a physical door">Close</button>
    <button type="button" i18n="dialog|Dismisses a dialog">Close</button>
  `,
})
export class LabM34Extract {}
