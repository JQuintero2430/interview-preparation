import { Component } from '@angular/core';

// Top-level await: evaluating this module takes about 120 ms, so the load behind a @defer is slow.
await new Promise<void>((resolve) => setTimeout(resolve, 120));

@Component({
  selector: 'lab-m18-slow',
  template: `<p id="content">slow content</p>`,
})
export class LabM18Slow {}
