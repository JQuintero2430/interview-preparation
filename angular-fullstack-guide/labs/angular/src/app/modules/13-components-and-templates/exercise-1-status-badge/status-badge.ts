import { Component, computed, input, output } from '@angular/core';

export type BadgeLevel = 'info' | 'warn' | 'error';

const TONES: Record<BadgeLevel, string> = {
  info: 'teal',
  warn: 'orange',
  error: 'crimson',
};

@Component({
  selector: 'lab-status-badge',
  template: `
    <span
      class="badge"
      [class]="levelClasses()"
      [class.is-pulsing]="pulsing()"
      [style.--badge-tone]="tone()"
      [style.width.px]="width()"
      [attr.aria-label]="label()"
      [title]="hint() ?? ''"
      (click)="dismissed.emit(label())"
      >{{ label() }}</span
    >
  `,
  styles: `
    .badge {
      background: var(--badge-tone);
    }
  `,
})
export class StatusBadge {
  readonly level = input<BadgeLevel>('info');
  readonly label = input<string | null>(null);
  readonly pulsing = input(false);
  readonly hint = input<string | null>(null);
  readonly width = input<number | null>(null);
  readonly dismissed = output<string | null>();

  // A new object for every level: [class] compares the previous object with ===.
  protected readonly levelClasses = computed(() => ({
    'is-info': this.level() === 'info',
    'is-warn': this.level() === 'warn',
    'is-error': this.level() === 'error',
  }));
  protected readonly tone = computed(() => TONES[this.level()]);
}
