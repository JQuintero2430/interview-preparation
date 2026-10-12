import { Component, signal } from '@angular/core';
import { TracedLeaf, TracedNode } from './traced-node';

@Component({
  selector: 'lab-m20-tracer-host',
  imports: [TracedLeaf, TracedNode],
  template: `
    @if (shown()) {
      <lab-m20-traced-node name="parent">
        <lab-m20-traced-leaf name="sib" />
      </lab-m20-traced-node>
    }
  `,
})
export class TracerHost {
  readonly shown = signal(true);
}
