import { UpperCasePipe } from '@angular/common';
import { Component, computed, input, output, signal } from '@angular/core';

// Section 8 compiles exactly this file with ngc and walks through the emitted definition.
@Component({
  selector: 'lab-counter',
  imports: [UpperCasePipe],
  template: `
    <h2 [title]="label()">{{ label() | uppercase }}: {{ count() }}</h2>
    <button type="button" (click)="increment()">+1</button>
    @if (count() > 2) {
      <p>Many</p>
    } @else {
      <p>Few</p>
    }
    <ul>
      @for (item of items(); track item) {
        <li>{{ item }}</li>
      }
    </ul>
  `,
  styles: `
    h2 {
      color: teal;
    }
  `,
})
export class Counter {
  readonly label = input('Count');
  readonly changed = output<number>();
  protected readonly count = signal(0);
  protected readonly items = computed(() => Array.from({ length: this.count() }, (_, i) => i + 1));

  protected increment(): void {
    this.count.update((n) => n + 1);
    this.changed.emit(this.count());
  }
}
