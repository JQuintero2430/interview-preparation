import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

interface Row {
  readonly id: number;
  readonly label: string;
}

const rowsOf = (...ids: number[]): Row[] => ids.map((id) => ({ id, label: `row ${id}` }));

// --- track by id, by identity and by $index over the same data ---

@Component({
  selector: 'lab-m18-s2-by-id',
  template: `
    <ul>
      @for (r of rows(); track r.id) {
        <li [attr.data-id]="r.id"><input [attr.aria-label]="r.label" />{{ r.label }}</li>
      }
    </ul>
  `,
})
class ById {
  readonly rows = signal<Row[]>(rowsOf(1, 2, 3));
}

@Component({
  selector: 'lab-m18-s2-by-identity',
  template: `
    <ul>
      @for (r of rows(); track r) {
        <li [attr.data-id]="r.id"><input [attr.aria-label]="r.label" />{{ r.label }}</li>
      }
    </ul>
  `,
})
class ByIdentity {
  readonly rows = signal<Row[]>(rowsOf(1, 2, 3));
}

@Component({
  selector: 'lab-m18-s2-by-index',
  template: `
    <ul>
      @for (r of rows(); track $index) {
        <li [attr.data-id]="r.id"><input [attr.aria-label]="r.label" />{{ r.label }}</li>
      }
    </ul>
  `,
})
class ByIndex {
  readonly rows = signal<Row[]>(rowsOf(1, 2, 3));
}

// --- Context variables, aliases and @empty ---

@Component({
  selector: 'lab-m18-s2-context',
  template: `
    @for (
      r of rows();
      track r.id;
      let i = $index, n = $count, first = $first, last = $last, even = $even, odd = $odd
    ) {
      <p>{{ i }}/{{ n }} {{ first }} {{ last }} {{ even }} {{ odd }}</p>
    } @empty {
      <p id="empty">no rows</p>
    }
    @for (a of outer; track a; let oi = $index) {
      @for (b of inner; track b; let j = $index) {
        <i>{{ oi }}{{ j }}{{ a }}{{ b }}</i>
      }
    }
  `,
})
class Context {
  readonly rows = signal<Row[]>(rowsOf(7, 8, 9));
  protected readonly outer = ['x', 'y'];
  protected readonly inner = ['p', 'q'];
}

// --- What @for can iterate ---

@Component({
  selector: 'lab-m18-s2-iterables',
  template: `@for (x of items(); track $index) {<i>{{ show(x) }}</i>}`,
})
class Iterables {
  readonly items = signal<Iterable<unknown> | null | undefined>([]);
  protected show(x: unknown): string {
    return Array.isArray(x) ? x.join('=') : String(x);
  }
}

// --- A track expression that uses the component instance ---

@Component({
  selector: 'lab-m18-s2-this',
  template: `
    @for (r of rows(); track keyOf(r)) {
      <li>{{ r.label }}</li>
    }
    @for (r of rows(); track this.keyOf(r)) {
      <p>{{ r.label }}</p>
    }
  `,
})
class UsesThis {
  readonly rows = signal<Row[]>(rowsOf(1, 2));
  readonly calls: string[] = [];
  private readonly prefix = 'k-';
  protected keyOf(r: Row): string {
    this.calls.push(`${this.prefix}${r.id}`);
    return `${this.prefix}${r.id}`;
  }
}

function render<T>(type: new () => T) {
  const fixture = TestBed.createComponent(type);
  fixture.detectChanges();
  return fixture;
}

const items = (root: HTMLElement): HTMLElement[] => Array.from(root.querySelectorAll('li'));
const texts = (root: HTMLElement, selector: string): string[] =>
  Array.from(root.querySelectorAll(selector)).map((e) => e.textContent?.trim() ?? '');

describe('Section 2: @for', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Section 2: track by id keeps DOM nodes when objects are replaced', () => {
    const fixture = render(ById);
    const root: HTMLElement = fixture.nativeElement;
    const before = new Map(items(root).map((li) => [li.dataset['id'], li]));

    // New objects, same ids, reversed: the nodes must follow the ids.
    fixture.componentInstance.rows.set(
      [3, 2, 1].map((id) => ({ id, label: `fresh ${id}` })),
    );
    fixture.detectChanges();

    const after = items(root);
    expect(after.map((li) => li.dataset['id'])).toEqual(['3', '2', '1']);
    for (const li of after) {
      expect(li).toBe(before.get(li.dataset['id']));
    }
    expect(texts(root, 'li')).toEqual(['fresh 3', 'fresh 2', 'fresh 1']);
  });

  it('Section 2: track by identity recreates every node for new objects and NG0956 warns', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const fixture = render(ByIdentity);
    const root: HTMLElement = fixture.nativeElement;
    const before = items(root);
    expect(warn).not.toHaveBeenCalled();

    fixture.componentInstance.rows.set(rowsOf(1, 2, 3));
    fixture.detectChanges();

    const after = items(root);
    expect(after).toHaveLength(3);
    expect(after.some((li) => before.includes(li))).toBe(false);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0][0])).toMatch(
      /^NG0956: The configured tracking expression \(track by identity\) caused re-creation of the entire collection of size 3\. /,
    );

    // The same objects in another order keep their nodes: identity is the key.
    const kept = fixture.componentInstance.rows();
    fixture.componentInstance.rows.set([kept[2], kept[0], kept[1]]);
    fixture.detectChanges();
    expect(items(root)).toEqual([after[2], after[0], after[1]]);
  });

  it('Section 2: track by $index keeps nodes at their position', () => {
    const fixture = render(ByIndex);
    const root: HTMLElement = fixture.nativeElement;
    const before = items(root);
    const firstInput = root.querySelector('input') as HTMLInputElement;
    firstInput.value = 'typed';

    fixture.componentInstance.rows.set(rowsOf(3, 2, 1));
    fixture.detectChanges();

    expect(items(root)).toEqual(before);
    expect(texts(root, 'li')).toEqual(['row 3', 'row 2', 'row 1']);
    // The typed text stays at position 0, now beside row 3.
    expect((root.querySelector('input') as HTMLInputElement).value).toBe('typed');

    // Under track r.id the same typed text follows its row.
    const byId = render(ById);
    const idRoot: HTMLElement = byId.nativeElement;
    (idRoot.querySelector('input') as HTMLInputElement).value = 'typed';
    byId.componentInstance.rows.set(rowsOf(3, 2, 1));
    byId.detectChanges();
    const typedValues = Array.from(idRoot.querySelectorAll('input')).map((i) => i.value);
    expect(typedValues).toEqual(['', '', 'typed']);
  });

  it('Section 2: context variables and nested aliases', () => {
    const fixture = render(Context);
    const root: HTMLElement = fixture.nativeElement;
    expect(texts(root, 'p')).toEqual([
      '0/3 true false true false',
      '1/3 false false false true',
      '2/3 false true true false',
    ]);
    expect(texts(root, 'i')).toEqual(['00xp', '01xq', '10yp', '11yq']);

    fixture.componentInstance.rows.set([]);
    fixture.detectChanges();
    expect(texts(root, 'p')).toEqual(['no rows']);
  });

  it('Section 2: @for renders Set, Map, string and generator values, and nothing for null', () => {
    const fixture = render(Iterables);
    const root: HTMLElement = fixture.nativeElement;
    const rendered = (value: Iterable<unknown> | null | undefined): string[] => {
      fixture.componentInstance.items.set(value);
      fixture.detectChanges();
      return texts(root, 'i');
    };
    function* generated(): Generator<number> {
      yield 1;
      yield 2;
    }

    expect(rendered(new Set(['a', 'b', 'a']))).toEqual(['a', 'b']);
    expect(rendered(new Map([['k', 1]]))).toEqual(['k=1']);
    expect(rendered('a😀')).toEqual(['a', '😀']);
    expect(rendered(generated())).toEqual(['1', '2']);
    expect(rendered(null)).toEqual([]);
    expect(rendered(undefined)).toEqual([]);
  });

  it('Section 2: NG0955 is warned on update for duplicate keys', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const fixture = TestBed.createComponent(ById);
    fixture.componentInstance.rows.set(rowsOf(1, 2, 1));
    fixture.detectChanges();
    // First render: the duplicate is not reported.
    expect(warn).not.toHaveBeenCalled();

    fixture.componentInstance.rows.set(rowsOf(1, 2, 1, 4));
    fixture.detectChanges();
    expect(warn).toHaveBeenCalledTimes(1);
    const message = String(warn.mock.calls[0][0]);
    expect(message).toMatch(
      /^NG0955: The provided track expression resulted in duplicated keys for a given collection\. /,
    );
    expect(message).toContain('Duplicated keys were: \nkey "1" at index "0" and "2".');
  });

  it('Section 2: @empty renders for an empty collection', () => {
    const fixture = render(Context);
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('#empty')).toBeNull();

    fixture.componentInstance.rows.set([]);
    fixture.detectChanges();
    expect(root.querySelector('#empty')?.textContent).toBe('no rows');

    fixture.componentInstance.rows.set(rowsOf(1));
    fixture.detectChanges();
    expect(root.querySelector('#empty')).toBeNull();
  });

  it('Section 2: a track method runs with the component instance as this', () => {
    const fixture = render(UsesThis);
    const root: HTMLElement = fixture.nativeElement;
    // Both loops rendered, so every call found this.prefix on the component.
    expect(texts(root, 'li')).toEqual(['row 1', 'row 2']);
    expect(texts(root, 'p')).toEqual(['row 1', 'row 2']);
    expect(fixture.componentInstance.calls).toEqual(['k-1', 'k-2', 'k-1', 'k-2']);
  });
});
