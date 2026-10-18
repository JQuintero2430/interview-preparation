import { Component, Injectable, inject, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  provideTransloco,
  provideTranslocoScope,
  Translation,
  TranslocoLoader,
  TranslocoOptions,
  TranslocoPipe,
  TranslocoService,
} from '@jsverse/transloco';
import { Observable, of } from 'rxjs';

// Section 9 claims for Transloco 8.4.0: an in-memory loader (no HTTP) records every path it is asked for, so
// each test can say which dictionaries were requested and when. Keys are flat strings; a scope's file is
// requested as `<scope>/<lang>` and merged under the scope's alias. `validation.required` is the one
// validation-message key (module 25's handoff).

const FILES: Record<string, Translation> = {
  en: { 'cart.title': 'Your cart', 'cart.empty': 'Your cart is empty', 'validation.required': 'This field is required.' },
  fr: { 'cart.title': 'Votre panier', 'validation.required': 'Ce champ est obligatoire.' },
  'admin-panel/en': { title: 'Admin area' },
  'admin-panel/fr': { title: 'Espace admin' },
};

@Injectable({ providedIn: 'root' })
class LabM34LoaderLog {
  readonly calls: string[] = [];
}

@Injectable()
class LabM34InMemoryTranslocoLoader implements TranslocoLoader {
  private readonly log = inject(LabM34LoaderLog);

  getTranslation(path: string): Observable<Translation> {
    this.log.calls.push(path);
    return of(FILES[path] ?? {});
  }
}

@Component({
  selector: 'lab-m34-transloco-cart',
  imports: [TranslocoPipe],
  template: `<h1>{{ 'cart.title' | transloco }}</h1>
    <p>{{ 'validation.required' | transloco }}</p>`,
})
class LabM34TranslocoCart {}

@Component({
  selector: 'lab-m34-transloco-admin',
  imports: [TranslocoPipe],
  providers: [provideTranslocoScope('admin-panel')],
  template: `<h2>{{ 'adminPanel.title' | transloco }}</h2>`,
})
class LabM34TranslocoAdmin {}

@Component({
  selector: 'lab-m34-transloco-shell',
  imports: [TranslocoPipe, LabM34TranslocoAdmin],
  template: `<h1>{{ 'cart.title' | transloco }}</h1>
    @if (showAdmin()) {
      <lab-m34-transloco-admin />
    }`,
})
class LabM34TranslocoShell {
  readonly showAdmin = signal(false);
}

@Component({
  selector: 'lab-m34-transloco-missing',
  imports: [TranslocoPipe],
  template: `<p>{{ 'cart.empty' | transloco }}</p>`,
})
class LabM34TranslocoMissing {}

function setUp(config: TranslocoOptions['config']): LabM34LoaderLog {
  TestBed.configureTestingModule({
    providers: [
      provideTransloco({
        config: { availableLangs: ['en', 'fr'], defaultLang: 'en', ...config },
        loader: LabM34InMemoryTranslocoLoader,
      }),
    ],
  });
  return TestBed.inject(LabM34LoaderLog);
}

async function render(type: new () => unknown): Promise<HTMLElement> {
  const fixture = TestBed.createComponent(type);
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
  return fixture.nativeElement;
}

function text(element: HTMLElement, selector: string): string | undefined {
  return element.querySelector(selector)?.textContent?.trim();
}

describe('Section 9: Transloco', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Section 9: Transloco renders the default language from its loader', async () => {
    const log = setUp({});

    const element = await render(LabM34TranslocoCart);

    expect(text(element, 'h1')).toBe('Your cart');
    expect(text(element, 'p')).toBe('This field is required.');
    expect(log.calls).toEqual(['en']);
  });

  it('Section 9: Transloco switches language without recreating the component', async () => {
    const log = setUp({ reRenderOnLangChange: true });
    const fixture = TestBed.createComponent(LabM34TranslocoCart);
    fixture.detectChanges();
    await fixture.whenStable();
    const heading = fixture.nativeElement.querySelector('h1');

    const transloco = TestBed.inject(TranslocoService);
    transloco.setActiveLang('fr');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('h1')).toBe(heading);
    expect(heading.textContent.trim()).toBe('Votre panier');
    expect(transloco.activeLang()).toBe('fr');
    expect(log.calls).toEqual(['en', 'fr']);
  });

  it('Section 9: Transloco keeps the first language on screen when reRenderOnLangChange is off', async () => {
    setUp({});
    const fixture = TestBed.createComponent(LabM34TranslocoCart);
    fixture.detectChanges();
    await fixture.whenStable();

    TestBed.inject(TranslocoService).setActiveLang('fr');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(text(fixture.nativeElement, 'h1')).toBe('Your cart');
  });

  it('Section 9: Transloco loads a scope only when a scoped component renders', async () => {
    const log = setUp({});
    const fixture = TestBed.createComponent(LabM34TranslocoShell);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(log.calls).toEqual(['en']);

    fixture.componentInstance.showAdmin.set(true);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(log.calls).toEqual(['en', 'admin-panel/en']);
    expect(text(fixture.nativeElement, 'h2')).toBe('Admin area');
  });

  it('Section 9: Transloco prefixes scoped keys with the scope alias', async () => {
    setUp({});
    const fixture = TestBed.createComponent(LabM34TranslocoShell);
    fixture.componentInstance.showAdmin.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(text(fixture.nativeElement, 'h2')).toBe('Admin area');
    const english = TestBed.inject(TranslocoService).getTranslation('en');

    expect(english['adminPanel.title']).toBe('Admin area');
    expect(Object.keys(english)).not.toContain('title');
    expect(Object.keys(english)).not.toContain('admin-panel.title');
  });

  it('Section 9: Transloco falls back to the fallback language for a missing key', async () => {
    const log = setUp({ defaultLang: 'fr', fallbackLang: 'en', missingHandler: { useFallbackTranslation: true } });

    const element = await render(LabM34TranslocoMissing);

    expect(text(element, 'p')).toBe('Your cart is empty');
    expect(log.calls).toEqual(['fr', 'en']);
  });

  it('Section 9: Transloco returns the key for a missing key unless useFallbackTranslation is on', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    setUp({ defaultLang: 'fr', fallbackLang: 'en' });

    const element = await render(LabM34TranslocoMissing);

    expect(text(element, 'p')).toBe('cart.empty');
    expect(warn).toHaveBeenCalledWith("%c Missing translation for 'cart.empty'", 'font-size: 12px; color: red');
  });
});
