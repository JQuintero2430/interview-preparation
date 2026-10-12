import {
  Component,
  Directive,
  EventEmitter,
  Input,
  NgModule,
  Output,
  input,
  output,
} from '@angular/core';
import { describeComponents, type CatalogEntry, type ComponentEntry } from './component-catalog';

@Component({
  selector: 'lab-product-card',
  template: `<p>{{ heading() }}: {{ price() }}</p>`,
})
class ProductCard {
  readonly price = input.required<number>();
  readonly heading = input('', { alias: 'title' });
  readonly added = output<number>();
  readonly removed = output<number>({ alias: 'deleted' });
}

// Legacy contrast: decorator inputs and outputs, declared in an NgModule (standalone: false).
@Component({
  selector: 'lab-legacy-badge',
  template: `<span>{{ color }}</span>`,
  standalone: false,
})
class LegacyBadge {
  @Input('tone') color = 'grey';
  @Output() dismissed = new EventEmitter<void>();
}

@NgModule({ declarations: [LegacyBadge] })
export class LegacyBadgeModule {}

@Component({
  selector: 'lab-panel',
  template: `<ng-content select="header" /><ng-content />`,
})
class Panel {}

@Directive({ selector: '[labHighlight]' })
class Highlight {}

class PriceFormatter {}

function entryFor(entries: CatalogEntry[], selector: string): ComponentEntry {
  const entry = entries.find((e) => !('error' in e) && e.selector === selector);
  if (entry === undefined || 'error' in entry) {
    throw new Error(`no component entry for ${selector}`);
  }
  return entry;
}

describe('E12.1 describeComponents', () => {
  const catalog = describeComponents([ProductCard, Highlight, LegacyBadge, PriceFormatter, Panel]);

  it("reports a component's selector, standalone flag and class name", () => {
    const card = entryFor(catalog, 'lab-product-card');
    expect(card.name).toBe(ProductCard.name);
    expect(card.standalone).toBe(true);
    expect(entryFor(catalog, 'lab-legacy-badge').standalone).toBe(false);
    // The name is whatever the build left on the class: this test build renames compiled classes.
    expect(ProductCard.name).toBe('_ProductCard');
  });

  it('lists signal inputs and decorator inputs with their public (aliased) name and an isSignal flag', () => {
    expect(entryFor(catalog, 'lab-product-card').inputs).toEqual([
      { property: 'price', publicName: 'price', isSignal: true },
      { property: 'heading', publicName: 'title', isSignal: true },
    ]);
    expect(entryFor(catalog, 'lab-legacy-badge').inputs).toEqual([
      { property: 'color', publicName: 'tone', isSignal: false },
    ]);
  });

  it('lists outputs (signal output() and @Output) by public name', () => {
    expect(entryFor(catalog, 'lab-product-card').outputs).toEqual(['added', 'deleted']);
    expect(entryFor(catalog, 'lab-legacy-badge').outputs).toEqual(['dismissed']);
  });

  it('reports the ng-content selectors of a projecting component', () => {
    expect(entryFor(catalog, 'lab-panel').contentSlots).toEqual(['header', '*']);
  });

  it('sorts the entries by selector', () => {
    const selectors = catalog.flatMap((entry) => ('error' in entry ? [] : [entry.selector]));
    expect(selectors).toEqual(['lab-legacy-badge', 'lab-panel', 'lab-product-card']);
  });

  it('yields { name, error: "not a component" } for a directive or a plain class instead of throwing', () => {
    expect(catalog.slice(3)).toEqual([
      { name: Highlight.name, error: 'not a component' },
      { name: 'PriceFormatter', error: 'not a component' },
    ]);
  });
});
