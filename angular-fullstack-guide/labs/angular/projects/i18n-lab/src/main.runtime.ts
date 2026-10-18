/// <reference types="@angular/localize" />

import { registerLocaleData } from '@angular/common';
import localeAr from '@angular/common/locales/ar';
import localeFr from '@angular/common/locales/fr';
import { loadTranslations } from '@angular/localize';

interface TranslationFile {
  readonly locale: string;
  readonly translations: Record<string, string>;
}

const LOCALE_DATA = { fr: localeFr, ar: localeAr } as const;

// (1) The language comes from the URL: ?lang=en|fr|ar, default en.
const requested = new URLSearchParams(location.search).get('lang');
const lang = requested === 'fr' || requested === 'ar' ? requested : 'en';

if (lang !== 'en') {
  // (2) Fetch the translation file relative to the base href.
  const response = await fetch(`i18n/${lang}.json`);
  if (!response.ok) throw new Error(`i18n/${lang}.json: HTTP ${response.status}`);
  const body: TranslationFile = await response.json();
  // (3) Load the translations, (4) switch the locale, (5) register its data.
  loadTranslations(body.translations);
  $localize.locale = lang;
  registerLocaleData(LOCALE_DATA[lang], lang);
}

// (6) Bootstrap only now, so every $localize call sees the translations.
await import('./bootstrap.runtime');
