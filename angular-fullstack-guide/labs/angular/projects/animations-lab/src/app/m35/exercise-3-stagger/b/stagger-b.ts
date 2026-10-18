import { type AnimationCallbackEvent, Component, signal } from '@angular/core';
import { STAGGER_ITEMS, type StaggerItem, STEP_MS } from '../items';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

// Exercise 35.3, variant b: functions. The code computes each delay from the index with element.animate.
@Component({
  selector: 'lab-m35-stagger-b',
  template: `
    <h1>Exercise 35.3b: staggered list with functions</h1>
    <button type="button" (click)="show()">Show list</button>
    <button type="button" (click)="removeFirst()">Remove first</button>
    <button type="button" (click)="reverse()">Reverse</button>
    <ul aria-label="Items">
      @for (item of items(); track item.id) {
        <li
          class="m35-ex3-item"
          (animate.enter)="enter($event, $index, item.id)"
          (animate.leave)="leave($event)"
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
  `,
})
export class LabM35StaggerB {
  protected readonly all = STAGGER_ITEMS;
  protected readonly items = signal<readonly StaggerItem[]>([]);

  protected enter(event: AnimationCallbackEvent, index: number, id: number): void {
    if (matchMedia(REDUCED_MOTION_QUERY).matches || !this.fresh().has(id)) return;
    event.target.animate(
      [
        { opacity: 0, transform: 'translateX(-2rem)' },
        { opacity: 1, transform: 'none' },
      ],
      { duration: 800, delay: index * STEP_MS, easing: 'ease-out', fill: 'backwards' },
    );
  }

  protected leave(event: AnimationCallbackEvent): void {
    if (matchMedia(REDUCED_MOTION_QUERY).matches) {
      event.animationComplete();
      return;
    }
    const run = event.target.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 800,
      easing: 'ease-in',
      fill: 'forwards',
    });
    run.finished.then(event.animationComplete, event.animationComplete);
  }

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
