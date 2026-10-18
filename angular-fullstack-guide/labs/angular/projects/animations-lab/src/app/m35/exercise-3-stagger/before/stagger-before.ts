import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
import { Component, signal } from '@angular/core';
import { STAGGER_ITEMS, type StaggerItem, STEP_MS } from '../items';

// Exercise 35.3, before: the legacy trigger. Served only by the legacy build, whose main.legacy.ts provides the engine.
@Component({
  selector: 'lab-m35-stagger-before',
  animations: [
    trigger('list', [
      transition('* => *', [
        query(
          ':enter',
          [
            style({ opacity: 0, transform: 'translateX(-2rem)' }),
            stagger(STEP_MS, animate('800ms ease-out', style({ opacity: 1, transform: 'none' }))),
          ],
          { optional: true },
        ),
        query(':leave', animate('800ms ease-in', style({ opacity: 0 })), { optional: true }),
      ]),
    ]),
  ],
  template: `
    <h1>Exercise 35.3 before: staggered list with @angular/animations</h1>
    <button type="button" (click)="items.set(all)">Show list</button>
    <button type="button" (click)="removeFirst()">Remove first</button>
    <button type="button" (click)="reverse()">Reverse</button>
    <ul aria-label="Items" [@list]="items().length">
      @for (item of items(); track item.id) {
        <li class="m35-ex3-item" [attr.data-item]="item.id">{{ item.label }}</li>
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
export class LabM35StaggerBefore {
  protected readonly all = STAGGER_ITEMS;
  protected readonly items = signal<readonly StaggerItem[]>([]);

  protected removeFirst(): void {
    this.items.update((current) => current.slice(1));
  }

  protected reverse(): void {
    this.items.update((current) => [...current].reverse());
  }
}
