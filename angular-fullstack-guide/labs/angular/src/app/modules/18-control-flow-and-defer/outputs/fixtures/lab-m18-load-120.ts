import { Component } from '@angular/core';

// Top-level await: evaluating this module takes about 120 ms, so the load behind a @defer takes that long.
await new Promise<void>((resolve) => setTimeout(resolve, 120));

@Component({
  selector: 'lab-m18-load-120',
  template: `<p id="content">content</p>`,
})
export class LabM18Load120 {}
