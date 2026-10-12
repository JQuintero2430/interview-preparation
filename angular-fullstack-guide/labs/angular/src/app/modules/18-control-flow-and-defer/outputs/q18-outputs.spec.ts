// labs/angular/src/app/modules/18-control-flow-and-defer/outputs/q18-outputs.spec.ts
// Each test reproduces one "Output" question from Module 18 and asserts the exact lines the answer
// prints. A Bug hunt question may add a test named after it for the runtime text its answer quotes.
// If Angular changes behaviour, this file fails first.
import { Component, input, signal, Type, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MigratedRow, migratedRowStats, Row } from '../concepts/migrated/migrated-row';
import { legacyRowStats } from '../legacy/migration-sample/legacy-row';
import { LegacyRows } from '../legacy/migration-sample/legacy-rows';
import { LabM18Load20 } from './fixtures/lab-m18-load-20';
import { LabM18Load120 } from './fixtures/lab-m18-load-120';

// Q18.02: six conditions through @if.
@Component({
  selector: 'lab-m18-q02-truthiness',
  template: `
    @for (c of cases; track c.label) {
      @if (c.value) {
        <p>{{ c.label }} renders</p>
      } @else {
        <p>{{ c.label }} is skipped</p>
      }
    }
  `,
})
class Truthiness {
  protected readonly cases: { label: string; value: unknown }[] = [
    { label: '[]', value: [] },
    { label: `'0'`, value: '0' },
    { label: '{}', value: {} },
    { label: '0', value: 0 },
    { label: `''`, value: '' },
    { label: 'NaN', value: NaN },
  ];
}

// Q18.05: the same list replaced by new objects, in reverse order, under three track expressions.
interface Item {
  readonly id: number;
}

const items = (...ids: number[]): Item[] => ids.map((id) => ({ id }));

@Component({
  selector: 'lab-m18-q05-item',
  template: `<ul>@for (item of items(); track item) {<li>{{ item.id }}</li>}</ul>`,
})
class TrackItem {
  readonly items = signal(items(1, 2, 3));
}

@Component({
  selector: 'lab-m18-q05-id',
  template: `<ul>@for (item of items(); track item.id) {<li>{{ item.id }}</li>}</ul>`,
})
class TrackId {
  readonly items = signal(items(1, 2, 3));
}

@Component({
  selector: 'lab-m18-q05-index',
  template: `<ul>@for (item of items(); track $index) {<li>{{ item.id }}</li>}</ul>`,
})
class TrackIndex {
  readonly items = signal(items(1, 2, 3));
}

// Q18.06: the six context variables, @empty, and a nested @for with aliases.
@Component({
  selector: 'lab-m18-q06-context',
  template: `
    @for (r of rows(); track r; let i = $index, n = $count) {
      <p>{{ i }}/{{ n }} {{ r }} first={{ $first }} last={{ $last }} even={{ $even }} odd={{ $odd }}</p>
    } @empty {
      <p>nothing</p>
    }
  `,
})
class ContextVariables {
  readonly rows = signal<string[]>(['a', 'b', 'c']);
}

@Component({
  selector: 'lab-m18-q06-grid',
  template: `
    @for (row of grid; track row.name; let r = $index) {
      @for (cell of row.cells; track cell; let c = $index) {
        <p>{{ row.name }}{{ cell }}: r={{ r }} c={{ c }} $index={{ $index }}</p>
      }
    }
  `,
})
class Grid {
  protected readonly grid = [
    { name: 'x', cells: ['p', 'q'] },
    { name: 'y', cells: ['p', 'q'] },
  ];
}

@Component({
  selector: 'lab-m18-q06-iterables',
  template: `
    @for (x of items(); track $index; let n = $count) {
      <i>{{ n }}:{{ x }}:{{ $last }}</i>
    } @empty {
      <b>empty</b>
    }
  `,
})
class CountedIterables {
  readonly items = signal<Iterable<unknown> | null | undefined>([]);
}

// Q18.07: the reviewed @for blocks (an editable list tracked by $index, an uninvoked track function
// and a key that repeats).
interface Order {
  readonly id: number;
  readonly customer: string;
}

const orders = (...rows: [number, string][]): Order[] => rows.map(([id, customer]) => ({ id, customer }));

@Component({
  selector: 'lab-m18-q07-review',
  template: `
    <ul id="by-index">
      @for (o of orders(); track $index) {
        <li><input [attr.aria-label]="'note ' + o.id" />{{ o.id }}</li>
      }
    </ul>
    <ul id="by-function">
      @for (o of orders(); track trackById) {
        <li>{{ o.id }}</li>
      }
    </ul>
    <ul id="by-customer">
      @for (o of orders(); track o.customer) {
        <li>{{ o.id }}</li>
      }
    </ul>
  `,
})
class ReviewedOrders {
  readonly orders = signal(orders([1, 'a'], [2, 'b'], [3, 'a']));
  protected trackById(_index: number, order: Order): number {
    return order.id;
  }
}

// Q18.08: @switch with strict equality, no fall through, grouped cases and an optional @default.
@Component({
  selector: 'lab-m18-q08-cases',
  template: `
    @switch (value()) {
      @case (1) {
        <p>number 1</p>
      }
      @case ('1') {
        <p>string 1</p>
      }
      @case (2)
      @case (3) {
        <p>two or three</p>
      }
    }
  `,
})
class Cases {
  readonly value = signal<number | string>(1);
}

@Component({
  selector: 'lab-m18-q08-default',
  template: `
    @switch (value()) {
      @case (1) {
        <p>number 1</p>
      }
      @default {
        <p>other</p>
      }
    }
  `,
})
class WithDefault {
  readonly value = signal<number | string>(1);
}

// Q18.12: one @defer with @loading (after 40ms; minimum 100ms) over a 120 ms and a 20 ms load.
@Component({
  selector: 'lab-m18-q12-load-120',
  imports: [LabM18Load120],
  template: `
    @defer (on immediate) {
      <lab-m18-load-120 />
    } @loading (after 40ms; minimum 100ms) {
      <p id="loading">loading</p>
    }
  `,
})
class Load120Host {}

@Component({
  selector: 'lab-m18-q12-load-20',
  imports: [LabM18Load20],
  template: `
    @defer (on immediate) {
      <lab-m18-load-20 />
    } @loading (after 40ms; minimum 100ms) {
      <p id="loading">loading</p>
    }
  `,
})
class Load20Host {}

// Q18.22: the migrated form of the legacy sample, written out with `track row.id`. The legacy form is
// the sample under legacy/migration-sample (*ngFor with trackBy), reused as it is.
@Component({
  selector: 'lab-m18-q22-keyed-rows',
  imports: [MigratedRow],
  template: `
    @for (row of rows(); track row.id) {
      <div><lab-m18-migrated-row [row]="row" /></div>
    }
  `,
})
class KeyedRows {
  readonly rows = signal<Row[]>([
    { id: 1, name: 'a' },
    { id: 2, name: 'b' },
  ]);
}

// Q18.24: an @if with an alias and an @else; the branch child counts its constructor calls.
const aliasStats = { constructed: 0 };

@Component({
  selector: 'lab-m18-q24-branch',
  template: `{{ name() }}`,
})
class AliasBranch {
  readonly name = input.required<string>();

  constructor() {
    aliasStats.constructed++;
  }
}

@Component({
  selector: 'lab-m18-q24-alias',
  imports: [AliasBranch],
  template: `
    @if (user(); as u) {
      <lab-m18-q24-branch [name]="u" />
    } @else {
      <p id="guest">guest</p>
    }
  `,
})
class AliasHost {
  readonly user = signal<string | null>('Ann');
}

type Seen = Partial<Record<'loading' | 'content', number>>;

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

// Detects changes every few milliseconds and records when each sub-block is first seen.
async function watch(fixture: ComponentFixture<unknown>, windowMs: number): Promise<Seen> {
  const root: HTMLElement = fixture.nativeElement;
  const seen: Seen = {};
  const start = performance.now();
  const sample = () => {
    fixture.detectChanges();
    const at = performance.now() - start;
    for (const id of ['loading', 'content'] as const) {
      if (seen[id] === undefined && root.querySelector(`#${id}`)) {
        seen[id] = at;
      }
    }
  };
  sample();
  while (performance.now() - start < windowMs) {
    await sleep(4);
    sample();
  }
  return seen;
}

// What the user saw, in the order each sub-block first appeared.
const sequence = (seen: Seen): string =>
  ['nothing', ...(Object.entries(seen) as [string, number][]).sort((a, b) => a[1] - b[1]).map(([id]) => id)].join(', ');

// A margin for timers: a callback may run a few milliseconds early against a second clock.
const SLACK = 10;

interface Host {
  readonly items: ReturnType<typeof signal<Item[]>>;
}

// Renders, stamps every <li> with the id it showed (state no binding sets), replaces the items with
// new objects 3, 2, 1 and describes each row of the new list by its stamp.
function rowsAfterReplacement(type: new () => Host): string {
  const fixture = TestBed.createComponent(type);
  fixture.detectChanges();
  const root: HTMLElement = fixture.nativeElement;
  for (const li of Array.from(root.querySelectorAll('li'))) {
    li.dataset['was'] = li.textContent ?? '';
  }
  fixture.componentInstance.items.set(items(3, 2, 1));
  fixture.detectChanges();
  return Array.from(root.querySelectorAll('li'))
    .map((li) => `${li.textContent} (${li.dataset['was'] === undefined ? 'new' : `was ${li.dataset['was']}`})`)
    .join(', ');
}

interface RowsHost {
  readonly rows: WritableSignal<Row[]>;
}

// Renders two rows, stamps each <div>, changes the id of the first row in place (same object, same
// position, a new array) and says for each <div> whether it still carries its stamp (kept) or not (new).
function rowsAfterIdEdit(type: Type<RowsHost>, stats: { constructed: number }): string {
  stats.constructed = 0;
  const fixture = TestBed.createComponent(type);
  fixture.detectChanges();
  const root: HTMLElement = fixture.nativeElement;
  for (const div of Array.from(root.querySelectorAll('div'))) {
    div.dataset['stamp'] = 'yes';
  }
  const { rows } = fixture.componentInstance;
  rows()[0].id = 99;
  rows.update((all) => [...all]);
  fixture.detectChanges();
  const shown = Array.from(root.querySelectorAll('div'))
    .map((div, index) => `row ${index} ${div.dataset['stamp'] === undefined ? 'new' : 'kept'}`)
    .join(', ');
  return `${shown}; constructed ${stats.constructed}`;
}

describe('Q18: Output answers', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Q18.02 [], "0" and {} render and 0, "" and NaN do not', () => {
    const fixture = TestBed.createComponent(Truthiness);
    fixture.detectChanges();
    const lines = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('p')).map(
      (p) => p.textContent,
    );
    expect(lines).toEqual([
      '[] renders',
      `'0' renders`,
      '{} renders',
      '0 is skipped',
      `'' is skipped`,
      'NaN is skipped',
    ]);
  });

  it('Q18.05 new objects with the same ids: only track item recreates the rows, and NG0956 warns once', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    expect(`track item:    ${rowsAfterReplacement(TrackItem)}`).toBe(
      'track item:    3 (new), 2 (new), 1 (new)',
    );
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0][0])).toMatch(/^NG0956: .*collection of size 3\. /);

    expect(`track item.id: ${rowsAfterReplacement(TrackId)}`).toBe(
      'track item.id: 3 (was 3), 2 (was 2), 1 (was 1)',
    );
    expect(`track $index:  ${rowsAfterReplacement(TrackIndex)}`).toBe(
      'track $index:  3 (was 1), 2 (was 2), 1 (was 3)',
    );
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('Q18.06 the context variables, @empty and the nested aliases print these lines', () => {
    const lines = (root: HTMLElement): string[] =>
      Array.from(root.querySelectorAll('p')).map((p) => p.textContent ?? '');

    const context = TestBed.createComponent(ContextVariables);
    context.detectChanges();
    const printed = lines(context.nativeElement);
    context.componentInstance.rows.set([]);
    context.detectChanges();
    printed.push(...lines(context.nativeElement));

    const grid = TestBed.createComponent(Grid);
    grid.detectChanges();
    printed.push(...lines(grid.nativeElement));

    expect(printed).toEqual([
      '0/3 a first=true last=false even=true odd=false',
      '1/3 b first=false last=false even=false odd=true',
      '2/3 c first=false last=true even=true odd=false',
      'nothing',
      'xp: r=0 c=0 $index=0',
      'xq: r=0 c=1 $index=1',
      'yp: r=1 c=0 $index=0',
      'yq: r=1 c=1 $index=1',
    ]);
  });

  it('Q18.06 $count and $last also work for a Set and a generator, and @empty renders for null, undefined and an empty string', () => {
    const fixture = TestBed.createComponent(CountedIterables);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    const rendered = (value: Iterable<unknown> | null | undefined): string[] => {
      fixture.componentInstance.items.set(value);
      fixture.detectChanges();
      return Array.from(root.querySelectorAll('i, b')).map((e) => e.textContent ?? '');
    };
    function* generated(): Generator<number> {
      yield 1;
      yield 2;
    }

    expect(rendered(new Set(['a', 'b']))).toEqual(['2:a:false', '2:b:true']);
    expect(rendered(generated())).toEqual(['2:1:false', '2:2:true']);
    expect(rendered(null)).toEqual(['empty']);
    expect(rendered(undefined)).toEqual(['empty']);
    expect(rendered('')).toEqual(['empty']);
  });

  it('Q18.07 duplicate keys, an uninvoked track function included, warn on the first update and not on the first render', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const fixture = TestBed.createComponent(ReviewedOrders);
    fixture.detectChanges();
    expect(warn).not.toHaveBeenCalled();

    fixture.componentInstance.orders.set(orders([3, 'a'], [2, 'b'], [1, 'a']));
    fixture.detectChanges();

    const head =
      'NG0955: The provided track expression resulted in duplicated keys for a given collection. ' +
      'Adjust the tracking expression such that it uniquely identifies all the items in the collection. ' +
      'Duplicated keys were: \n';
    const tail = ' Find more at https://v22.angular.dev/errors/NG0955';
    expect(warn.mock.calls.map((call) => String(call[0]))).toEqual([
      `${head}key "trackById" at index "0" and "1", \nkey "trackById" at index "1" and "2".${tail}`,
      `${head}key "a" at index "0" and "2".${tail}`,
    ]);
  });

  it('Q18.07 track $index leaves the typed text at position 0, beside another order', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const fixture = TestBed.createComponent(ReviewedOrders);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    (root.querySelector('#by-index input') as HTMLInputElement).value = 'typed';

    fixture.componentInstance.orders.set(orders([3, 'a'], [2, 'b'], [1, 'a']));
    fixture.detectChanges();

    const rows = Array.from(root.querySelectorAll('#by-index li')).map(
      (li) => `${(li.querySelector('input') as HTMLInputElement).value}|${li.textContent}`,
    );
    expect(rows).toEqual(['typed|3', '|2', '|1']);
  });

  it('Q18.08 a @switch uses strict equality, renders one case, shares a body between consecutive cases and shows nothing or the @default', () => {
    const shown = (root: HTMLElement): string => root.querySelector('p')?.textContent ?? 'nothing';
    const lines: string[] = [];

    const cases = TestBed.createComponent(Cases);
    cases.detectChanges();
    for (const [label, value] of [
      ['1', 1],
      [`'1'`, '1'],
      ['3', 3],
      ['99', 99],
    ] as const) {
      cases.componentInstance.value.set(value);
      cases.detectChanges();
      expect(cases.nativeElement.querySelectorAll('p')).toHaveLength(label === '99' ? 0 : 1);
      lines.push(`${label} -> ${shown(cases.nativeElement)}`);
    }

    const withDefault = TestBed.createComponent(WithDefault);
    withDefault.componentInstance.value.set(99);
    withDefault.detectChanges();
    lines.push(`99 with @default -> ${shown(withDefault.nativeElement)}`);

    expect(lines).toEqual([
      '1 -> number 1',
      `'1' -> string 1`,
      '3 -> two or three',
      '99 -> nothing',
      '99 with @default -> other',
    ]);
  });

  it('Q18.12 a 120 ms load shows nothing, then loading, then the content, and a 20 ms load shows nothing, then the content', async () => {
    const slow = await watch(TestBed.createComponent(Load120Host), 400);
    const quick = await watch(TestBed.createComponent(Load20Host), 300);

    expect([`120 ms load: ${sequence(slow)}`, `20 ms load: ${sequence(quick)}`]).toEqual([
      '120 ms load: nothing, loading, content',
      '20 ms load: nothing, content',
    ]);
    // Windows, not exact times: loading no earlier than `after`, the content no earlier than the
    // moment `minimum` releases the loading block (40 + 100).
    expect(slow.loading).toBeGreaterThanOrEqual(40 - SLACK);
    expect(slow.content).toBeGreaterThanOrEqual(40 + 100 - SLACK);
  });

  it('Q18.22 an id edited in place keeps the row under @for with track row.id and recreates it under *ngFor with trackBy', () => {
    expect(`*ngFor + trackBy:    ${rowsAfterIdEdit(LegacyRows, legacyRowStats)}`).toBe(
      '*ngFor + trackBy:    row 0 new, row 1 kept; constructed 3',
    );
    expect(`@for + track row.id: ${rowsAfterIdEdit(KeyedRows, migratedRowStats)}`).toBe(
      '@for + track row.id: row 0 kept, row 1 kept; constructed 2',
    );
  });

  it('Q18.24 an alias change keeps the @if branch, and only leaving truthiness destroys it and creates a new one', () => {
    aliasStats.constructed = 0;
    const fixture = TestBed.createComponent(AliasHost);
    const root: HTMLElement = fixture.nativeElement;
    let previous: Element | null = null;
    const lines: string[] = [];
    const record = (label: string, user: string | null) => {
      fixture.componentInstance.user.set(user);
      fixture.detectChanges();
      const branch = root.querySelector('lab-m18-q24-branch');
      if (branch === null) {
        lines.push(`${label} ${root.querySelector('#guest')?.textContent} shown, constructed ${aliasStats.constructed}`);
        return;
      }
      const sameness = previous === null ? '' : branch === previous ? ', same node' : ', new node';
      lines.push(`${label} branch shows ${branch.textContent}, constructed ${aliasStats.constructed}${sameness}`);
      previous = branch;
    };

    record('user Ann: ', 'Ann');
    record('user Bob: ', 'Bob');
    record('user null:', null);
    record('user Cy:  ', 'Cy');

    expect(lines).toEqual([
      'user Ann:  branch shows Ann, constructed 1',
      'user Bob:  branch shows Bob, constructed 1, same node',
      'user null: guest shown, constructed 1',
      'user Cy:   branch shows Cy, constructed 2, new node',
    ]);
  });
});
