import { Component, Injectable, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  provideChildTranslateService,
  provideTranslateLoader,
  provideTranslateService,
  TranslateLoader,
  TranslatePipe,
  TranslateService,
  TranslationObject,
} from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { LAB_M34_LANGUAGES, LabM34Language, LabM34LanguageStore } from '../language-store';
import { LAB_M34_ADMIN_FILES, LAB_M34_ROOT_FILES } from '../translations';
import { LabM34RequestLog } from '../request-log';

/** Serves the root dictionaries in memory and logs each language it is asked for. */
@Injectable()
export class LabM34NgxRootLoader extends TranslateLoader {
  private readonly log = inject(LabM34RequestLog);

  getTranslation(lang: string): Observable<TranslationObject> {
    this.log.paths.push(lang);
    return of(LAB_M34_ROOT_FILES[lang] ?? {});
  }
}

/** Serves the admin dictionaries in memory and logs each as `admin/<lang>`. */
@Injectable()
export class LabM34NgxAdminLoader extends TranslateLoader {
  private readonly log = inject(LabM34RequestLog);

  getTranslation(lang: string): Observable<TranslationObject> {
    this.log.paths.push(`admin/${lang}`);
    return of(LAB_M34_ADMIN_FILES[lang] ?? {});
  }
}

/** Registers ngx-translate starting in English; `fallbackLang` alone makes a missing key read English. */
export function provideLabM34Ngx() {
  return provideTranslateService({
    lang: 'en',
    fallbackLang: 'en',
    loader: provideTranslateLoader(LabM34NgxRootLoader),
  });
}

@Component({
  selector: 'lab-m34-ngx-admin',
  imports: [TranslatePipe],
  providers: [
    provideChildTranslateService({ loader: provideTranslateLoader(LabM34NgxAdminLoader) }),
  ],
  template: `<h2 data-testid="admin-title">{{ 'title' | translate }}</h2>`,
})
export class LabM34NgxAdmin {}

@Component({
  selector: 'lab-m34-ngx-switch',
  imports: [ReactiveFormsModule, TranslatePipe, LabM34NgxAdmin],
  template: `
    @for (lang of languages; track lang) {
      <button type="button" [attr.data-lang]="lang" (click)="choose(lang)">{{ lang }}</button>
    }
    <h1 data-testid="title">{{ 'cart.title' | translate }}</h1>
    <p data-testid="empty">{{ 'cart.empty' | translate }}</p>
    <label>
      {{ 'form.name' | translate }}
      <input [formControl]="name" />
    </label>
    @if (name.hasError('required')) {
      <p data-testid="error">{{ 'validation.required' | translate }}</p>
    }
    <button type="button" data-testid="open-admin" (click)="showAdmin.set(true)">
      {{ 'nav.admin' | translate }}
    </button>
    @if (showAdmin()) {
      <lab-m34-ngx-admin />
    }
  `,
})
export class LabM34NgxSwitch {
  private readonly store = inject(LabM34LanguageStore);
  private readonly translate = inject(TranslateService);

  protected readonly languages = LAB_M34_LANGUAGES;
  protected readonly name = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required],
  });
  protected readonly showAdmin = signal(false);

  constructor() {
    if (this.translate.getCurrentLang() !== this.store.lang())
      this.translate.use(this.store.lang());
  }

  protected choose(lang: LabM34Language): void {
    this.store.choose(lang);
    this.translate.use(lang);
  }
}
