import { Component, Injectable, inject, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  provideChildTranslateService,
  provideTranslateLoader,
  provideTranslateService,
  translate,
  TranslateLoader,
  TranslatePipe,
  TranslateService,
  TranslationObject,
} from '@ngx-translate/core';
import { Observable, of } from 'rxjs';

// Section 9 claims for ngx-translate 18.0.0: two in-memory loaders (no HTTP), one for the root service and one
// for a lazy feature's child service, write to one call log. Keys are dotted paths into nested JSON.
// `validation.required` is the one validation-message key (module 25's handoff).

const ROOT_FILES: Record<string, TranslationObject> = {
  en: {
    cart: { title: 'Your cart', empty: 'Your cart is empty' },
    validation: { required: 'This field is required.' },
  },
  fr: { cart: { title: 'Votre panier' }, validation: { required: 'Ce champ est obligatoire.' } },
};

const ADMIN_FILES: Record<string, TranslationObject> = {
  en: { admin: { title: 'Admin area' } },
  fr: { admin: { title: 'Espace admin' } },
};

@Injectable({ providedIn: 'root' })
class LabM34NgxLoaderLog {
  readonly calls: string[] = [];
}

@Injectable()
class LabM34RootTranslateLoader extends TranslateLoader {
  private readonly log = inject(LabM34NgxLoaderLog);

  getTranslation(lang: string): Observable<TranslationObject> {
    this.log.calls.push(lang);
    return of(ROOT_FILES[lang] ?? {});
  }
}

@Injectable()
class LabM34AdminTranslateLoader extends TranslateLoader {
  private readonly log = inject(LabM34NgxLoaderLog);

  getTranslation(lang: string): Observable<TranslationObject> {
    this.log.calls.push(`admin/${lang}`);
    return of(ADMIN_FILES[lang] ?? {});
  }
}

@Component({
  selector: 'lab-m34-ngx-cart',
  imports: [TranslatePipe],
  template: `<h1>{{ 'cart.title' | translate }}</h1>
    <p>{{ 'validation.required' | translate }}</p>`,
})
class LabM34NgxCart {}

@Component({
  selector: 'lab-m34-ngx-admin',
  imports: [TranslatePipe],
  providers: [provideChildTranslateService({ loader: provideTranslateLoader(LabM34AdminTranslateLoader) })],
  template: `<h2>{{ 'admin.title' | translate }}</h2>
    <p>{{ 'cart.title' | translate }}</p>`,
})
class LabM34NgxAdmin {}

@Component({
  selector: 'lab-m34-ngx-shell',
  imports: [TranslatePipe, LabM34NgxAdmin],
  template: `<h1>{{ 'cart.title' | translate }}</h1>
    @if (showAdmin()) {
      <lab-m34-ngx-admin />
    }`,
})
class LabM34NgxShell {
  readonly showAdmin = signal(false);
}

@Component({
  selector: 'lab-m34-ngx-signal',
  template: `<h1>{{ title() }}</h1>`,
})
class LabM34NgxSignal {
  protected readonly title = translate('cart.title');
}

@Component({
  selector: 'lab-m34-ngx-missing',
  imports: [TranslatePipe],
  template: `<p>{{ 'cart.empty' | translate }}</p>`,
})
class LabM34NgxMissing {}

function setUp(lang: string, fallbackLang?: string): LabM34NgxLoaderLog {
  TestBed.configureTestingModule({
    providers: [provideTranslateService({ lang, fallbackLang, loader: provideTranslateLoader(LabM34RootTranslateLoader) })],
  });
  return TestBed.inject(LabM34NgxLoaderLog);
}

function text(element: HTMLElement, selector: string): string | undefined {
  return element.querySelector(selector)?.textContent?.trim();
}

describe('Section 9: ngx-translate', () => {
  it('Section 9: ngx-translate renders the current language through the pipe', async () => {
    const log = setUp('en');
    const fixture = TestBed.createComponent(LabM34NgxCart);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(text(fixture.nativeElement, 'h1')).toBe('Your cart');
    expect(text(fixture.nativeElement, 'p')).toBe('This field is required.');
    expect(log.calls).toEqual(['en']);
  });

  it('Section 9: ngx-translate switches language with use()', async () => {
    const log = setUp('en');
    const fixture = TestBed.createComponent(LabM34NgxCart);
    fixture.detectChanges();
    await fixture.whenStable();
    const heading = fixture.nativeElement.querySelector('h1');

    const translateService = TestBed.inject(TranslateService);
    translateService.use('fr');
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('h1')).toBe(heading);
    expect(heading.textContent.trim()).toBe('Votre panier');
    expect(translateService.currentLang()).toBe('fr');
    expect(log.calls).toEqual(['en', 'fr']);
  });

  it('Section 9: a child service loads its feature translations on first use', async () => {
    const log = setUp('en');
    const fixture = TestBed.createComponent(LabM34NgxShell);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(log.calls).toEqual(['en']);

    fixture.componentInstance.showAdmin.set(true);
    await fixture.whenStable();

    expect(log.calls).toEqual(['en', 'admin/en']);
    expect(text(fixture.nativeElement, 'h2')).toBe('Admin area');
    expect(text(fixture.nativeElement, 'p')).toBe('Your cart');
  });

  it("Section 9: ngx-translate's translate() signal follows the language", async () => {
    setUp('en');
    const fixture = TestBed.createComponent(LabM34NgxSignal);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(text(fixture.nativeElement, 'h1')).toBe('Your cart');

    TestBed.inject(TranslateService).use('fr');
    await fixture.whenStable();

    expect(text(fixture.nativeElement, 'h1')).toBe('Votre panier');
  });

  it('Section 9: ngx-translate returns the key for a missing translation by default', async () => {
    setUp('fr');
    const fixture = TestBed.createComponent(LabM34NgxMissing);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(text(fixture.nativeElement, 'p')).toBe('cart.empty');
    expect(TestBed.inject(TranslateService).instant('cart.empty')).toBe('cart.empty');
  });

  it('Section 9: ngx-translate uses the fallback language for a missing key once fallbackLang is set', async () => {
    const log = setUp('fr', 'en');
    const fixture = TestBed.createComponent(LabM34NgxMissing);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(text(fixture.nativeElement, 'p')).toBe('Your cart is empty');
    expect(log.calls).toEqual(['fr', 'en']);
  });
});
