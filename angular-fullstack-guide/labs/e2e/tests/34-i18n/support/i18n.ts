// Shared helpers for module 34 (HOUSE-31). Read-only to every module-34 task.
// They target the builds of the `i18n-lab` project served by server/i18n-server.mjs on port 4600.
// Every module-34 browser context sets `locale` and `timezoneId` explicitly (the machine's own would leak into the output).
import { readFile } from 'node:fs/promises';
import type { Page } from '@playwright/test';

/** The lab's own site. */
export const I18N_ORIGIN = 'http://localhost:4600';
/** The locale folders of the per-locale build, in the order the server knows them. */
export const LOCALES = ['en-US', 'fr', 'ar'] as const;
export type I18nLocale = (typeof LOCALES)[number];

/** Root of the builds: `i18n-lab/` and `i18n-lab-runtime/` sit here. */
const DIST = new URL('../../../../angular/dist/', import.meta.url);

/** The URL of a page of one locale build, e.g. `localeUrl('fr', 'm34/pipes')`. */
export function localeUrl(locale: I18nLocale, path = ''): string {
  return `${I18N_ORIGIN}/${locale}/${path.replace(/^\//, '')}`;
}

/** The URL of a page of the runtime build in one language, e.g. `runtimeUrl('fr')` is `/runtime/?lang=fr`. */
export function runtimeUrl(lang: 'en' | 'fr' | 'ar', path = ''): string {
  return `${I18N_ORIGIN}/runtime/${path.replace(/^\//, '')}?lang=${lang}`;
}

/** One console message: its type (`log`, `warning`, `error`, ...) and text. */
export interface ConsoleMessage {
  type: string;
  text: string;
}

/** Records every console message of the page; the array fills as messages arrive. */
export function consoleMessages(page: Page): ConsoleMessage[] {
  const messages: ConsoleMessage[] = [];
  page.on('console', (message) => void messages.push({ type: message.type(), text: message.text() }));
  return messages;
}

/**
 * Reads a file of a build, relative to `labs/angular/dist`
 * (e.g. `distFile('i18n-lab/browser/fr/index.html')`). Returns the bytes; call `.toString('utf8')` for text.
 */
export async function distFile(path: string): Promise<Buffer> {
  try {
    return await readFile(new URL(path, DIST));
  } catch {
    throw new Error(`dist/${path} is missing: run the e2e suite (its web server builds i18n-lab) or "npx ng build i18n-lab"`);
  }
}

/** Every character above U+007E as `U+XXXX`, joined by spaces: readable in assertions and failure messages. */
export function codePoints(text: string): string {
  return [...text]
    .filter((char) => char.codePointAt(0)! > 0x7e)
    .map((char) => `U+${char.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0')}`)
    .join(' ');
}
