import { Component } from '@angular/core';

const reason = 'lab-m18-failing: this module throws while it is evaluated';
if (reason.length > 0) {
  throw new Error(reason);
}

@Component({
  selector: 'lab-m18-failing',
  template: `<p id="content">failing content</p>`,
})
export class LabM18Failing {}
