import { Component, importProvidersFrom, inject, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CatalogStore } from '../legacy/catalog/catalog-list';
import { CATALOG_LOG, CatalogModule } from '../legacy/catalog/catalog.module';
import { API_CONFIG, ApiModule } from '../legacy/shared/api.module';

// Standalone using an NgModule library: its exports for the template, its providers for DI.
@Component({
  selector: 'lab-m15-catalog-page',
  imports: [CatalogModule],
  template: '<h2>Catalog</h2><lab-m15-catalog-list />',
})
class CatalogPage {}

// A standalone parent that renders the page in its template.
@Component({
  selector: 'lab-m15-shop',
  imports: [CatalogPage],
  template: '<lab-m15-catalog-page />',
})
class Shop {}

// The other direction: an NgModule imports a standalone component.
@Component({ selector: 'lab-m15-star', template: '*' })
class Star {}

// Legacy: declared by CardModule, whose scope includes the imported Star.
@Component({ selector: 'lab-m15-legacy-card', standalone: false, template: 'card <lab-m15-star />' })
class LegacyCard {}

@NgModule({ declarations: [LegacyCard], imports: [Star], exports: [LegacyCard, Star] })
class CardModule {}

// Templates from the module import, configuration from forRoot at the environment level.
@Component({
  selector: 'lab-m15-api-page',
  imports: [ApiModule],
  template: '<lab-m15-api-status /> {{ config.url }}',
})
class ApiPage {
  protected readonly config = inject(API_CONFIG);
}

function withLog(): string[] {
  const log: string[] = [];
  TestBed.configureTestingModule({ providers: [{ provide: CATALOG_LOG, useValue: log }] });
  return log;
}

function text(element: HTMLElement): string {
  return element.textContent?.replace(/\s+/g, ' ').trim() ?? '';
}

describe('Section 6: interop', () => {
  it("Section 6: a standalone component uses an NgModule's exported component", () => {
    const fixture = TestBed.createComponent(CatalogPage);
    fixture.detectChanges();

    const items = (fixture.nativeElement as HTMLElement).querySelectorAll('lab-m15-catalog-list li');

    // CatalogList is CatalogModule's export; its CatalogStore comes from the module's providers.
    expect(Array.from(items, (li) => text(li as HTMLElement))).toEqual(['Pen: $1.50', 'Book: $12.99']);
  });

  it("Section 6: a module's providers imported by a standalone component live in a standalone injector, not the root", () => {
    const log = withLog();

    const fixture = TestBed.createComponent(CatalogPage);

    expect(log).toEqual(['CatalogModule created']);
    expect(fixture.componentRef.injector.get(CatalogStore)).toBeInstanceOf(CatalogStore);
    expect(() => TestBed.inject(CatalogStore)).toThrowError(/NG0201/);
  });

  it("Section 6: two instances of that component share the standalone injector's service", () => {
    const log = withLog();

    const first = TestBed.createComponent(CatalogPage);
    const second = TestBed.createComponent(CatalogPage);

    expect(second.componentRef.injector.get(CatalogStore)).toBe(first.componentRef.injector.get(CatalogStore));
    expect(log).toEqual(['CatalogModule created']);
  });

  it('Section 6: a component rendered in a template uses the standalone injector of the root component that imports it', () => {
    const log = withLog();

    const fixture = TestBed.createComponent(Shop);
    fixture.detectChanges();
    const page = fixture.debugElement.query(By.directive(CatalogPage));

    // Shop's injector collected CatalogModule through CatalogPage's imports; the page made none.
    expect(page.injector.get(CatalogStore)).toBe(fixture.componentRef.injector.get(CatalogStore));
    expect(log).toEqual(['CatalogModule created']);
  });

  it('Section 6: an NgModule-declared component renders a standalone component the module imports', () => {
    TestBed.configureTestingModule({ imports: [CardModule] });
    const fixture = TestBed.createComponent(LegacyCard);
    fixture.detectChanges();

    expect(text(fixture.nativeElement)).toBe('card *');
  });

  it('Section 6: importProvidersFrom with forRoot in an environment injector configures an NgModule library', () => {
    TestBed.configureTestingModule({ providers: [importProvidersFrom(ApiModule.forRoot({ url: '/v2' }))] });
    const fixture = TestBed.createComponent(ApiPage);
    fixture.detectChanges();

    expect(text(fixture.nativeElement)).toBe('api /v2');
  });
});
