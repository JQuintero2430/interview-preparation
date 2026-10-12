import { Component, input, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

interface Row {
  readonly id: number;
  readonly name: string;
}

// Counts constructor calls, so a spec can tell a kept view from a recreated one.
const stats = { branch: 0, row: 0 };

@Component({
  selector: 'lab-m18-s9-branch',
  template: `<p id="branch">{{ name() }}</p>`,
})
class BranchView {
  readonly name = input.required<string>();

  constructor() {
    stats.branch++;
  }
}

@Component({
  selector: 'lab-m18-s9-row',
  template: `<span>{{ row().name }}</span>`,
})
class RowView {
  readonly row = input.required<Row>();

  constructor() {
    stats.row++;
  }
}

@Component({
  selector: 'lab-m18-s9-if',
  imports: [BranchView],
  template: `
    @if (user(); as u) {
      <lab-m18-s9-branch [name]="u" />
    }
  `,
})
class IfHost {
  readonly user = signal<string | null>('Ann');
}

@Component({
  selector: 'lab-m18-s9-for',
  imports: [RowView],
  template: `
    @for (row of rows(); track row.id) {
      <lab-m18-s9-row [row]="row" />
    }
  `,
})
class ForHost {
  readonly rows = signal<Row[]>([
    { id: 1, name: 'a' },
    { id: 2, name: 'b' },
    { id: 3, name: 'c' },
  ]);
}

describe('Section 9: under the hood', () => {
  beforeEach(() => {
    stats.branch = 0;
    stats.row = 0;
  });

  it('Section 9: an @if alias change keeps the branch view', () => {
    const fixture = TestBed.createComponent(IfHost);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    const first = root.querySelector('lab-m18-s9-branch');
    expect(stats.branch).toBe(1);

    fixture.componentInstance.user.set('Bob');
    fixture.detectChanges();
    expect(root.querySelector('lab-m18-s9-branch')).toBe(first);
    expect(root.querySelector('#branch')?.textContent).toBe('Bob');
    expect(stats.branch).toBe(1);

    fixture.componentInstance.user.set(null);
    fixture.detectChanges();
    expect(root.querySelector('lab-m18-s9-branch')).toBeNull();
    fixture.componentInstance.user.set('Cy');
    fixture.detectChanges();
    expect(stats.branch).toBe(2);
  });

  it('Section 9: a keyed reorder moves nodes without recreating them', () => {
    const fixture = TestBed.createComponent(ForHost);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    const before = Array.from(root.querySelectorAll('lab-m18-s9-row'));
    expect(stats.row).toBe(3);

    // New objects with the same ids, in a new order.
    fixture.componentInstance.rows.set([
      { id: 3, name: 'c' },
      { id: 1, name: 'a' },
      { id: 2, name: 'b' },
    ]);
    fixture.detectChanges();
    const after = Array.from(root.querySelectorAll('lab-m18-s9-row'));
    expect(after.map((node) => node.textContent)).toEqual(['c', 'a', 'b']);
    expect(after[0]).toBe(before[2]);
    expect(after[1]).toBe(before[0]);
    expect(after[2]).toBe(before[1]);
    expect(stats.row).toBe(3);
  });
});
