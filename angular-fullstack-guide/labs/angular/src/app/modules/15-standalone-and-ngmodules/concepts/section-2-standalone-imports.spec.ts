import { DecimalPipe, NgClass } from '@angular/common';
import { Component, isStandalone } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CatalogList } from '../legacy/catalog/catalog-list';
import { CatalogModule } from '../legacy/catalog/catalog.module';

// No `standalone` property: standalone by default.
@Component({ selector: 'lab-m15-badge', template: '<b>new</b>' })
class Badge {}

// The template scope is exactly this `imports` list.
@Component({
  selector: 'lab-m15-shelf',
  imports: [Badge, CatalogModule],
  template: '<lab-m15-badge /><lab-m15-catalog-list />',
})
class Shelf {}

@Component({
  selector: 'lab-m15-total',
  imports: [NgClass, DecimalPipe],
  template: `<p [ngClass]="'hot'">{{ 1234.5 | number }}</p>`,
})
class Total {}

describe('Section 2: standalone components and imports', () => {
  it('Section 2: a component without a standalone flag is standalone and a standalone false one is not', () => {
    expect(isStandalone(Badge)).toBe(true);
    expect(isStandalone(CatalogList)).toBe(false);
  });

  it("Section 2: a standalone component renders what it imports, including an NgModule's exports", () => {
    const fixture = TestBed.createComponent(Shelf);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;

    expect(host.querySelector('lab-m15-badge')?.textContent).toBe('new');
    // CatalogList is exported by CatalogModule, so the module import puts it in scope.
    expect(host.querySelectorAll('lab-m15-catalog-list li').length).toBe(2);
  });

  it('Section 2: a directive and a pipe imported directly work without CommonModule', () => {
    const fixture = TestBed.createComponent(Total);
    fixture.detectChanges();
    const p = (fixture.nativeElement as HTMLElement).querySelector('p');

    expect(p?.className).toBe('hot');
    expect(p?.textContent).toBe('1,234.5');
  });
});
