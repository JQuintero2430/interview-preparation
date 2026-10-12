import { Component, computed, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Item, Row } from './row';
import { SortableList } from './sortable-list';

const seed: readonly Item[] = [
  { id: 'a', title: 'cherry' },
  { id: 'b', title: 'apple' },
  { id: 'c', title: 'banana' },
];

// Anti-pattern: the same list keyed by position. It exists only to show what `track $index` costs.
@Component({
  selector: 'lab-m18-e2-by-index-list',
  imports: [Row],
  template: `
    <ul>
      @for (item of sorted(); track $index) {
        <li [attr.data-id]="item.id"><lab-m18-e2-row [item]="item" /></li>
      }
    </ul>
  `,
})
class ByIndexList {
  readonly items = signal<readonly Item[]>(seed);
  readonly descending = signal(false);
  protected readonly sorted = computed(() => {
    const direction = this.descending() ? -1 : 1;
    return [...this.items()].sort((a, b) => direction * a.title.localeCompare(b.title));
  });
}

function render(): ComponentFixture<SortableList> {
  const fixture = TestBed.createComponent(SortableList);
  fixture.componentInstance.items.set(seed);
  fixture.detectChanges();
  return fixture;
}

const nodesOf = (fixture: ComponentFixture<unknown>): HTMLElement[] =>
  Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('li'));

const ids = (fixture: ComponentFixture<unknown>): (string | undefined)[] =>
  nodesOf(fixture).map((li) => li.dataset['id']);

const inputOf = (li: HTMLElement): HTMLInputElement => li.querySelector('input') as HTMLInputElement;

const rowsOf = (fixture: ComponentFixture<unknown>): Row[] =>
  fixture.debugElement.queryAll(By.directive(Row)).map((row) => row.componentInstance as Row);

// Types into every row's input, as the user would: the value is DOM state, not a binding.
function typeInAll(fixture: ComponentFixture<unknown>): void {
  for (const li of nodesOf(fixture)) inputOf(li).value = `typed-${li.dataset['id']}`;
}

describe('E18.2 A sortable list that keeps row state', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sorting keeps each row's typed text with its id", () => {
    const fixture = render();
    expect(ids(fixture)).toEqual(['b', 'c', 'a']);
    typeInAll(fixture);

    fixture.componentInstance.descending.set(true);
    fixture.detectChanges();

    expect(ids(fixture)).toEqual(['a', 'c', 'b']);
    for (const li of nodesOf(fixture)) {
      expect(inputOf(li).value).toBe(`typed-${li.dataset['id']}`);
    }
  });

  it('a refresh with new objects and the same ids recreates no row', () => {
    const fixture = render();
    const nodes = nodesOf(fixture);
    const rows = rowsOf(fixture);
    typeInAll(fixture);

    fixture.componentInstance.refresh(
      seed.map((item) => ({ ...item, title: item.id === 'b' ? 'apple pie' : item.title })),
    );
    fixture.detectChanges();

    expect(nodesOf(fixture)).toEqual(nodes);
    expect(rowsOf(fixture)).toEqual(rows);
    expect(nodes[0].textContent).toContain('apple pie');
    expect(inputOf(nodes[0]).value).toBe('typed-b');
  });

  it('removing a row removes only its node', () => {
    const fixture = render();
    const [b, c, a] = nodesOf(fixture);

    fixture.componentInstance.remove('c');
    fixture.detectChanges();

    expect(nodesOf(fixture)).toEqual([b, a]);
    expect(c.isConnected).toBe(false);
  });

  it('track $index is shown to lose the text (a second component in the spec, labelled the anti-pattern)', () => {
    const fixture = TestBed.createComponent(ByIndexList);
    fixture.detectChanges();
    expect(ids(fixture)).toEqual(['b', 'c', 'a']);
    typeInAll(fixture);

    fixture.componentInstance.descending.set(true);
    fixture.detectChanges();

    expect(ids(fixture)).toEqual(['a', 'c', 'b']);
    // The text stays at its position: 'typed-b' now sits beside row a, and 'typed-a' beside row b.
    expect(nodesOf(fixture).map((li) => inputOf(li).value)).toEqual(['typed-b', 'typed-c', 'typed-a']);
  });

  it('duplicate ids warn NG0955 on update', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const fixture = render();
    fixture.componentInstance.refresh([...seed, { id: 'a', title: 'fig' }]);
    fixture.detectChanges();
    // The duplicate arrives as a new row, so nothing is compared yet.
    expect(warn).not.toHaveBeenCalled();
    fixture.componentInstance.add({ id: 'd', title: 'date' });
    fixture.detectChanges();

    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0][0])).toMatch(/^NG0955: The provided track expression resulted in duplicated keys /);
  });

  it('the row view count equals the item count after any sequence of operations', () => {
    const fixture = render();
    let seedValue = 7;
    const next = (limit: number): number => {
      seedValue = (seedValue * 1103515245 + 12345) % 2147483648;
      return seedValue % limit;
    };
    const list = fixture.componentInstance;

    for (let step = 0; step < 40; step++) {
      const current = list.items();
      const operation = next(4);
      if (operation === 0) list.add({ id: `n${step}`, title: `item ${next(100)}` });
      else if (operation === 1 && current.length > 0) list.remove(current[next(current.length)].id);
      else if (operation === 2) list.refresh(current.map((item) => ({ ...item })));
      else list.descending.update((value) => !value);
      fixture.detectChanges();

      expect(rowsOf(fixture)).toHaveLength(list.items().length);
      expect(nodesOf(fixture)).toHaveLength(list.items().length);
    }
  });
});
