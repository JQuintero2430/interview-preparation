import { Component } from '@angular/core';

// Top-level side effect: evaluating this module records one line, so a test can see when the module was loaded.
const loaded = ((globalThis as { labM18PanelLoaded?: string[] }).labM18PanelLoaded ??= []);
loaded.push('lab-m18-panel evaluated');

@Component({
  selector: 'lab-m18-panel',
  template: `<p id="content">panel content</p>`,
})
export class LabM18Panel {}
