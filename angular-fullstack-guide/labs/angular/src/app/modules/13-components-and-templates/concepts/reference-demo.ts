import { Component, Directive, signal } from '@angular/core';

// A directive that names its instance for templates: `#t="labTally"` reads it.
@Directive({ selector: '[labTally]', exportAs: 'labTally' })
export class Tally {
  readonly count = signal(3);
}

// A directive without `exportAs`: a reference on its element is still the element.
@Directive({ selector: '[labPlain]' })
export class Plain {}

@Component({ selector: 'lab-kid', template: `<p>kid</p>` })
export class Kid {
  readonly name = 'kid';
}

// Four kinds of reference, handed to a handler, and one read from an inner block.
@Component({
  selector: 'lab-reference-demo',
  imports: [Kid, Tally, Plain],
  template: `
    <input #box value="a" />
    <lab-kid #kid />
    <ng-template #tpl><i>from a template</i></ng-template>
    <span labTally #tally="labTally"></span>
    <span labPlain #plain></span>
    <button id="inspect" type="button" (click)="inspect(box, kid, tpl, tally, plain)">inspect</button>
    @if (open()) {
      <p id="nested">{{ box.value }}</p>
    }
  `,
})
export class ReferenceDemo {
  readonly open = signal(false);
  seen: readonly unknown[] = [];

  inspect(...refs: readonly unknown[]): void {
    this.seen = refs;
  }
}

// `@let` values: one built from another, and one declared inside a block.
@Component({
  selector: 'lab-let-demo',
  template: `
    @let doubled = n() * 2;
    @let label = 'n=' + doubled;
    <p id="top">{{ doubled }}-{{ label }}</p>
    @if (show()) {
      @let inner = doubled + 10;
      <p id="nested">{{ inner }}</p>
    }
  `,
})
export class LetDemo {
  readonly n = signal(1);
  readonly show = signal(false);
}

// How often an expression runs: once for a `@let` read three times, three times for a call written three times.
@Component({
  selector: 'lab-let-calls',
  template: `
    @let once = read();
    <p id="let">{{ once }}{{ once }}{{ once }}</p>
    <p id="calls">{{ read() }}{{ read() }}{{ read() }}</p>
  `,
})
export class LetCalls {
  calls = 0;

  read(): number {
    this.calls += 1;
    return this.calls;
  }
}
