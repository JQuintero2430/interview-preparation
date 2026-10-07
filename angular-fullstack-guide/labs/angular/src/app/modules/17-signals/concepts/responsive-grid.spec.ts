import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { columnsFor, ResponsiveGrid } from './responsive-grid';

@Component({
  imports: [ResponsiveGrid],
  template: `<lab-responsive-grid [items]="items()" />`,
})
class Host {
  readonly items = signal<readonly string[]>(['a', 'b', 'c']);
}

describe('ResponsiveGrid (afterRenderEffect phases)', () => {
  it('columnsFor clamps between 1 and the item count', () => {
    expect(columnsFor(0, 3)).toBe(1);
    expect(columnsFor(500, 3)).toBe(3);
    expect(columnsFor(500, 10)).toBe(3);
  });

  it('writes the column count after rendering, and re-runs the write phase when items change', async () => {
    const fixture = TestBed.createComponent(Host);
    const grid = (fixture.nativeElement as HTMLElement).querySelector('lab-responsive-grid') as HTMLElement;
    // jsdom has no layout engine, so give the host a width before the first render.
    Object.defineProperty(grid, 'clientWidth', { get: () => 500 });
    await fixture.whenStable();
    expect(grid.style.getPropertyValue('--columns')).toBe('3'); // 500 / 160 -> 3 columns, 3 items
    fixture.componentInstance.items.set(['only one']);
    await fixture.whenStable();
    expect(grid.style.getPropertyValue('--columns')).toBe('1'); // write phase re-ran: items() changed
  });
});
