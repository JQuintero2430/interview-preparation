import {
  Component,
  createEnvironmentInjector,
  EnvironmentInjector,
  importProvidersFrom,
  inject,
  Pipe,
  PipeTransform,
  Type,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CatalogList, CatalogStore } from '../legacy/catalog/catalog-list';
import { CATALOG_LOG, CatalogModule } from '../legacy/catalog/catalog.module';

// The same feature without a module: each class lists what it needs.
@Pipe({ name: 'm15Price' })
class Price implements PipeTransform {
  transform(cents: number): string {
    return `$${(cents / 100).toFixed(2)}`;
  }
}

@Component({
  selector: 'lab-m15-catalog-list-standalone',
  imports: [Price],
  template: `
    <ul>
      @for (item of store.items(); track item.name) {
        <li>{{ item.name }}: {{ item.cents | m15Price }}</li>
      }
    </ul>
  `,
})
class StandaloneCatalogList {
  protected readonly store = inject(CatalogStore);
}

function renderItems(component: Type<unknown>): string[] {
  const fixture = TestBed.createComponent(component);
  fixture.detectChanges();
  const items = (fixture.nativeElement as HTMLElement).querySelectorAll('ul > li');
  return Array.from(items, (li) => li.textContent?.trim() ?? '');
}

describe('Section 1: what NgModules did', () => {
  it('Section 1: a declared component renders what its module imports', () => {
    TestBed.configureTestingModule({ imports: [CatalogModule] });

    // *ngFor comes from CommonModule (imported), m15Price from the module's own declarations.
    expect(renderItems(CatalogList)).toEqual(['Pen: $1.50', 'Book: $12.99']);
  });

  it("Section 1: a module's providers are created in the injector that imports the module", () => {
    const root = TestBed.inject(EnvironmentInjector);
    const feature = createEnvironmentInjector([importProvidersFrom(CatalogModule)], root);

    expect(feature.get(CatalogStore)).toBeInstanceOf(CatalogStore);
    expect(() => root.get(CatalogStore)).toThrowError(/NG0201/);
    feature.destroy();
  });

  it('Section 1: the module constructor runs when its injector is created', () => {
    const log: string[] = [];
    TestBed.configureTestingModule({ providers: [{ provide: CATALOG_LOG, useValue: log }] });
    const root = TestBed.inject(EnvironmentInjector);

    const feature = createEnvironmentInjector([importProvidersFrom(CatalogModule)], root);

    // Nothing was injected from `feature` yet.
    expect(log).toEqual(['CatalogModule created']);
    feature.destroy();
  });

  it('Section 1: the standalone version renders the same items without a module', () => {
    TestBed.configureTestingModule({ imports: [CatalogModule] });
    const legacy = renderItems(CatalogList);
    TestBed.resetTestingModule();

    TestBed.configureTestingModule({ providers: [CatalogStore] });
    expect(renderItems(StandaloneCatalogList)).toEqual(legacy);
  });
});
