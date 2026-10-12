import { Component, inject, input } from "@angular/core";
import { Greeter } from "./greeter";
import { NgIf } from "@angular/common";
import { Badge } from "./shared/badge";
import { ShortPipe } from "./shared/short-pipe";

// Migration sample: the greeting component.
@Component({
  selector: "lab-m15-mig-hello",
  template: `
    <p *ngIf="name()">
      {{ greeter.greet(name()) }}
      <lab-m15-mig-badge [label]="name() | m15Short" />
    </p>
  `,
  imports: [NgIf, Badge, ShortPipe],
})
export class Hello {
  readonly name = input("");
  protected readonly greeter = inject(Greeter);
}
