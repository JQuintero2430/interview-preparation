import { Component, input, output } from '@angular/core';

export const LAB_M32_EX2_KEY = 'lab-m32-ex2-recent';

const LIMIT = 3;

/** Puts `name` first and keeps the newest three. */
export function labM32Ex2Push(items: readonly string[], name: string): string[] {
  return [name, ...items.filter((item) => item !== name)].slice(0, LIMIT);
}

/** Reads the stored list: names joined by commas. */
export function labM32Ex2Parse(raw: string | null | undefined): string[] {
  return raw ? raw.split(',') : [];
}

/** The buttons and the list; it knows nothing about storage or the platform. */
@Component({
  selector: 'lab-m32-ex2-recent-list',
  template: `
    @for (name of names; track name) {
      <button type="button" (click)="viewed.emit(name)">View {{ name }}</button>
    }
    @if (items().length) {
      <ul aria-label="Recent items">
        @for (item of items(); track item) {
          <li>{{ item }}</li>
        }
      </ul>
    } @else {
      <p>No recent items yet</p>
    }
  `,
})
export class LabM32Ex2RecentList {
  readonly items = input.required<readonly string[]>();
  readonly viewed = output<string>();
  protected readonly names = ['Keyboard', 'Mouse', 'Monitor'];
}
