import { Component } from '@angular/core';

const reason = 'lab-m18-failing-panel: this module throws while it is evaluated';
if (reason.length > 0) {
  throw new Error(reason);
}

@Component({
  selector: 'lab-m18-failing-panel',
  template: `<p id="content">failing panel content</p>`,
})
export class LabM18FailingPanel {}
