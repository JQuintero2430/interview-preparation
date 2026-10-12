import { Component } from '@angular/core';

// Top-level side effect: evaluating this module records one line, so a test can see when the load happened.
const loaded = ((globalThis as { labM18Loaded?: string[] }).labM18Loaded ??= []);
loaded.push('lab-m18-side-effect evaluated');

@Component({
  selector: 'lab-m18-side-effect',
  template: `<p id="content">side-effect content</p>`,
})
export class LabM18SideEffect {}
