import { Component, Injectable, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  provideTransloco,
  provideTranslocoScope,
  Translation,
  TranslocoLoader,
  TranslocoPipe,
  TranslocoService,
} from '@jsverse/transloco';
import { Observable, of } from 'rxjs';
import { LAB_M34_LANGUAGES, LabM34Language, LabM34LanguageStore } from '../language-store';
import { LAB_M34_ADMIN_FILES, LAB_M34_ROOT_FILES } from '../translations';
import { LabM34RequestLog } from '../request-log';

/** Serves the in-memory dictionaries and logs each path; a scope's file is asked for as `<scope>/<lang>`. */
@Injectable()
export class LabM34TranslocoLoader implements TranslocoLoader {
  private readonly log = inject(LabM34RequestLog);

  getTranslation(path: string): Observable<Translation> {
    this.log.paths.push(path);
    const files = path.startsWith('admin/') ? LAB_M34_ADMIN_FILES : LAB_M34_ROOT_FILES;
    return of(files[path.replace('admin/', '')] ?? {});
  }
}

/** Registers Transloco with the two settings it needs here: a pipe that redraws on a language change, and a real fallback for a missing key. */
export function provideLabM34Transloco() {
  return provideTransloco({
    config: {
      availableLangs: [...LAB_M34_LANGUAGES],
      defaultLang: 'en',
      fallbackLang: 'en',
      reRenderOnLangChange: true,
      missingHandler: { useFallbackTranslation: true },
    },
    loader: LabM34TranslocoLoader,
  });
}

@Component({
  selector: 'lab-m34-transloco-admin',
  imports: [TranslocoPipe],
  providers: [provideTranslocoScope('admin')],
  template: `<h2 data-testid="admin-title">{{ 'admin.title' | transloco }}</h2>`,
})
export class LabM34TranslocoAdmin {}

@Component({
  selector: 'lab-m34-transloco-switch',
  imports: [ReactiveFormsModule, TranslocoPipe, LabM34TranslocoAdmin],
  template: `
    @for (lang of languages; track lang) {
      <button type="button" [attr.data-lang]="lang" (click)="choose(lang)">{{ lang }}</button>
    }
    <h1 data-testid="title">{{ 'cart.title' | transloco }}</h1>
    <p data-testid="empty">{{ 'cart.empty' | transloco }}</p>
    <label>
      {{ 'form.name' | transloco }}
      <input [formControl]="name" />
    </label>
    @if (name.hasError('required')) {
      <p data-testid="error">{{ 'validation.required' | transloco }}</p>
    }
    <button type="button" data-testid="open-admin" (click)="showAdmin.set(true)">
      {{ 'nav.admin' | transloco }}
    </button>
    @if (showAdmin()) {
      <lab-m34-transloco-admin />
    }
  `,
})
export class LabM34TranslocoSwitch {
  private readonly store = inject(LabM34LanguageStore);
  private readonly transloco = inject(TranslocoService);

  protected readonly languages = LAB_M34_LANGUAGES;
  protected readonly name = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required],
  });
  protected readonly showAdmin = signal(false);

  constructor() {
    if (this.transloco.getActiveLang() !== this.store.lang())
      this.transloco.setActiveLang(this.store.lang());
  }

  protected choose(lang: LabM34Language): void {
    this.store.choose(lang);
    this.transloco.setActiveLang(lang);
  }
}
