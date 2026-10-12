import { Component } from '@angular/core';

// Top-level await: evaluating this module takes about 20 ms, so the load behind a @defer takes that long.
await new Promise<void>((resolve) => setTimeout(resolve, 20));

@Component({
  selector: 'lab-m18-load-20',
  template: `<p id="content">content</p>`,
})
export class LabM18Load20 {}
