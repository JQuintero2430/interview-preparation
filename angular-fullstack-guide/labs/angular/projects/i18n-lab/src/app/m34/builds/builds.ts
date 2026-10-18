import { Component, inject, LOCALE_ID } from '@angular/core';
import { Router } from '@angular/router';

// Section 7 of module 34: the same page in every locale build. The heading is translated at build time,
// `LOCALE_ID` comes from the build (no provider), and the router URL never contains the locale folder,
// because the build's `<base href>` (`/fr/`, `/ar/`, `/en-US/`) is outside the router's view.
@Component({
  selector: 'lab-m34-builds',
  template: `
    <h2 i18n="@@m34.builds.title">Order details</h2>
    <dl>
      <dt i18n="@@m34.builds.url">Router URL</dt>
      <dd data-testid="router-url">{{ router.url }}</dd>
      <dt i18n="@@m34.builds.locale">Locale ID</dt>
      <dd data-testid="locale-id">{{ localeId }}</dd>
    </dl>
  `,
})
export class LabM34Builds {
  protected readonly router = inject(Router);
  protected readonly localeId = inject(LOCALE_ID);
}
