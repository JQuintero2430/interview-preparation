import { Injectable, InjectionToken, inject, signal } from '@angular/core';

/** The port the store saves through: the lab's tests replace it with an in-memory fake. */
export interface LabM34LanguageStorage {
  read(): string | null;
  write(lang: string): void;
}

const KEY = 'lab-m34-language';

export const LAB_M34_LANGUAGE_STORAGE = new InjectionToken<LabM34LanguageStorage>(
  'LAB_M34_LANGUAGE_STORAGE',
  {
    providedIn: 'root',
    // Storage can be disabled or full, and the app must still start, so a failure reads as "nothing saved".
    factory: () => ({
      read: () => {
        try {
          return localStorage.getItem(KEY);
        } catch {
          return null;
        }
      },
      write: (lang) => {
        try {
          localStorage.setItem(KEY, lang);
        } catch {
          // The choice still applies for this session.
        }
      },
    }),
  },
);

export type LabM34Language = 'en' | 'fr';

export const LAB_M34_LANGUAGES: readonly LabM34Language[] = ['en', 'fr'];

/** The chosen language, read once from the port at creation and written back on every choice. */
@Injectable({ providedIn: 'root' })
export class LabM34LanguageStore {
  private readonly storage = inject(LAB_M34_LANGUAGE_STORAGE);
  private readonly current = signal<LabM34Language>(this.initial());

  readonly lang = this.current.asReadonly();

  choose(lang: LabM34Language): void {
    this.current.set(lang);
    this.storage.write(lang);
  }

  private initial(): LabM34Language {
    const saved = this.storage.read();
    return LAB_M34_LANGUAGES.find((lang) => lang === saved) ?? 'en';
  }
}
