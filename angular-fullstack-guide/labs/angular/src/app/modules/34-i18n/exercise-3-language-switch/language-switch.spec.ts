import { ComponentFixture } from '@angular/core/testing';
import { LabM34SwitchHarness } from './harness';
import { LabM34LanguageStorage } from './language-store';
import { labM34NgxHarness } from './ngx-translate/harness';
import { labM34TranslocoHarness } from './transloco/harness';

class MemoryStorage implements LabM34LanguageStorage {
  saved: string | null = null;
  read = () => this.saved;
  write = (lang: string) => {
    this.saved = lang;
  };
}

function text(fixture: ComponentFixture<unknown>, testId: string): string | undefined {
  return fixture.nativeElement.querySelector(`[data-testid="${testId}"]`)?.textContent?.trim();
}

async function click(fixture: ComponentFixture<unknown>, selector: string): Promise<void> {
  fixture.nativeElement.querySelector(selector).click();
  await fixture.whenStable();
  fixture.detectChanges();
  await fixture.whenStable();
  fixture.detectChanges();
}

describe.each<{ library: string; harness: LabM34SwitchHarness }>([
  { library: 'Transloco', harness: labM34TranslocoHarness },
  { library: 'ngx-translate', harness: labM34NgxHarness },
])('Exercise 34.3: a language switcher ($library)', ({ harness }) => {
  it('shows the default language on start', async () => {
    const fixture = await harness.start(new MemoryStorage());

    expect(text(fixture, 'title')).toBe('Your cart');
    expect(harness.requests()).toEqual(['en']);
  });

  it('switches language without recreating the page', async () => {
    const fixture = await harness.start(new MemoryStorage());
    const title = fixture.nativeElement.querySelector('h1');
    const input = fixture.nativeElement.querySelector('input');

    await click(fixture, '[data-lang="fr"]');

    expect(fixture.nativeElement.querySelector('h1')).toBe(title);
    expect(fixture.nativeElement.querySelector('input')).toBe(input);
    expect(text(fixture, 'title')).toBe('Votre panier');
    expect(text(fixture, 'error')).toBe('Ce champ est obligatoire.');
  });

  it('loads the admin translations only when the admin view opens', async () => {
    const fixture = await harness.start(new MemoryStorage());

    expect(harness.requests()).toEqual(['en']);
    expect(text(fixture, 'admin-title')).toBeUndefined();

    await click(fixture, '[data-testid="open-admin"]');

    expect(new Set(harness.requests())).toEqual(new Set(['en', 'admin/en']));
    expect(text(fixture, 'admin-title')).toBe('Admin area');
  });

  it('falls back to English for a missing key', async () => {
    const fixture = await harness.start(new MemoryStorage());
    await click(fixture, '[data-lang="fr"]');

    expect(text(fixture, 'title')).toBe('Votre panier');
    expect(text(fixture, 'empty')).toBe('Your cart is empty');
  });

  it('restores the chosen language after a restart', async () => {
    const storage = new MemoryStorage();
    const first = await harness.start(storage);
    await click(first, '[data-lang="fr"]');

    expect(storage.saved).toBe('fr');

    const second = await harness.start(storage);

    expect(text(second, 'title')).toBe('Votre panier');
    expect(harness.requests()).toContain('fr');
  });
});
