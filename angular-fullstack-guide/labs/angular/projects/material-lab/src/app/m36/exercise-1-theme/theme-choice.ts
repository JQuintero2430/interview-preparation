import { Service, computed, signal } from '@angular/core';

/** What the user picked: follow the system, or force one scheme. */
export type ThemeChoiceValue = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'm36-theme-choice';

export function isThemeChoice(value: unknown): value is ThemeChoiceValue {
  return value === 'system' || value === 'light' || value === 'dark';
}

/** Storage can throw (blocked or private mode): a failed read means "no choice yet". */
function readStored(): ThemeChoiceValue {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isThemeChoice(stored) ? stored : 'system';
  } catch {
    return 'system';
  }
}

/** The user's color scheme choice, kept in `localStorage` under one key, and the system preference as a signal. */
@Service()
export class ThemeChoice {
  private readonly query = window.matchMedia('(prefers-color-scheme: dark)');

  readonly choice = signal<ThemeChoiceValue>(readStored());
  readonly prefersDark = signal(this.query.matches);

  /** The `color-scheme` value variant a puts on the shell: both schemes while the choice is "system". */
  readonly colorScheme = computed(() => (this.choice() === 'system' ? 'light dark' : this.choice()));

  /** Whether variant b shows its dark theme. */
  readonly dark = computed(() => (this.choice() === 'system' ? this.prefersDark() : this.choice() === 'dark'));

  constructor() {
    this.query.addEventListener('change', (event) => this.prefersDark.set(event.matches));
  }

  select(choice: ThemeChoiceValue): void {
    this.choice.set(choice);
    try {
      localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      // The choice still applies for this page; it just will not survive a reload.
    }
  }
}
