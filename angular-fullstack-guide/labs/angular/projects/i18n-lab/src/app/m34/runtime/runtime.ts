import { Component, inject, LOCALE_ID } from '@angular/core';

// Section 8 of module 34: the same messages in the runtime build (`-c production,runtime`, localize off),
// where `main.runtime.ts` loads the language's JSON before bootstrap. The links reload the page with another
// `?lang=`: a created component type keeps the messages it was created with.
@Component({
  selector: 'lab-m34-runtime',
  template: `
    <h2 i18n="@@m34.runtime.title">Runtime translation</h2>
    <p data-testid="greeting" i18n="@@m34.runtime.greeting">Hello {{ name }}, you have <b>{{ count }}</b> new messages</p>
    <p data-testid="locale-id">{{ localeId }}</p>
    <nav aria-label="Language">
      <a href="m34/runtime?lang=en" lang="en">English</a>
      <a href="m34/runtime?lang=fr" lang="fr">Français</a>
      <a href="m34/runtime?lang=ar" lang="ar">العربية</a>
    </nav>
  `,
})
export class LabM34Runtime {
  protected readonly localeId = inject(LOCALE_ID);
  protected readonly name = 'Ana';
  protected readonly count = 2;
}
