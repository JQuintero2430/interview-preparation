import { Component, signal } from '@angular/core';
import { STAGGER_ITEMS, type StaggerItem, STEP_MS } from '../items';

// Exercise 35.3, variant a: pure CSS. The template sets --i, the enter class turns it into a delay.
@Component({
  selector: 'lab-m35-stagger-a',
  template: `
    <h1>Exercise 35.3a: staggered list with CSS</h1>
    <button type="button" (click)="show()">Show list</button>
    <button type="button" (click)="removeFirst()">Remove first</button>
    <button type="button" (click)="reverse()">Reverse</button>
    <ul aria-label="Items">
      @for (item of items(); track item.id) {
        <li
          class="m35-ex3-item"
          [animate.enter]="fresh().has(item.id) ? 'm35-ex3-in' : ''"
          animate.leave="m35-ex3-out"
          [style.--i]="$index"
          [attr.data-item]="item.id"
        >
          {{ item.label }}
        </li>
      }
    </ul>
  `,
  styles: `
    .m35-ex3-item {
      width: 12rem;
      padding: 0.5rem 1rem;
      margin-block: 0.25rem;
      background: #dbeafe;
    }

    .m35-ex3-in {
      animation: m35-ex3-slide 800ms ease-out backwards;
      animation-delay: calc(var(--i) * ${STEP_MS}ms);
    }

    .m35-ex3-out {
      animation: m35-ex3-fade 800ms ease-in forwards;
    }

    @keyframes m35-ex3-slide {
      from {
        opacity: 0;
        transform: translateX(-2rem);
      }
    }

    @keyframes m35-ex3-fade {
      to {
        opacity: 0;
      }
    }
  `,
})
export class LabM35StaggerA {
  protected readonly all = STAGGER_ITEMS;
  protected readonly items = signal<readonly StaggerItem[]>([]);

  /** Ids that entered since the last reorder: a moved item is not one of them, so it replays nothing. */
  protected readonly fresh = signal<ReadonlySet<number>>(new Set());

  protected show(): void {
    this.items.set(this.all);
    this.fresh.set(new Set(this.all.map(({ id }) => id)));
  }

  protected removeFirst(): void {
    this.items.update((current) => current.slice(1));
  }

  protected reverse(): void {
    this.fresh.set(new Set());
    this.items.update((current) => [...current].reverse());
  }
}
