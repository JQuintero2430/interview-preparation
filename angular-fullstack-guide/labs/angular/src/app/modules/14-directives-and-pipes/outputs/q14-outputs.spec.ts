// labs/angular/src/app/modules/14-directives-and-pipes/outputs/q14-outputs.spec.ts
// Each test reproduces one "Output" question from Module 14 and asserts the exact text the answer
// claims. If Angular changes behaviour, this file fails first.
import {
  Component,
  computed,
  Directive,
  ElementRef,
  inject,
  input,
  OnInit,
  Pipe,
  PipeTransform,
  signal,
  Type,
} from '@angular/core';
import {
  AsyncPipe,
  CurrencyPipe,
  DatePipe,
  DecimalPipe,
  I18nPluralPipe,
  KeyValue,
  KeyValuePipe,
  NgComponentOutlet,
  PercentPipe,
} from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

describe('Module 14 output questions', () => {
  it('Q14.03 nativeElement is an element on a div and a comment node on ng-template and ng-container', () => {
    const seen: Node[] = [];

    @Directive({ selector: '[labProbe]' })
    class Probe {
      constructor() {
        seen.push(inject(ElementRef<Node>).nativeElement);
      }
    }

    @Component({
      selector: 'lab-q03',
      imports: [Probe],
      template: `<div labProbe></div><ng-template labProbe></ng-template><ng-container labProbe />`,
    })
    class Q03 {}

    TestBed.createComponent(Q03).detectChanges();

    const printed = seen.map((node) => `[${node.nodeType} ${node.nodeName}]`).join('');
    expect(printed).toBe('[1 DIV][8 #comment][8 #comment]');
  });

  it('Q14.04 a binding overwrites a direct style write at the first check and the direct class stays', () => {
    @Directive({ selector: '[labDirect]' })
    class Direct {
      constructor() {
        const el: HTMLElement = inject(ElementRef).nativeElement;
        el.style.color = 'red';
        el.classList.add('direct');
      }
    }

    @Component({
      selector: 'lab-q04',
      imports: [Direct],
      template: `<p labDirect [style.color]="c()" [class.on]="flag()">text</p>`,
    })
    class Q04 {
      readonly c = signal('blue');
      readonly flag = signal(false);
    }

    const fixture = TestBed.createComponent(Q04);
    const p = (): HTMLElement => (fixture.nativeElement as HTMLElement).querySelector('p')!;
    const snap = (): string => `style="${p().getAttribute('style')}" class="${p().getAttribute('class')}"`;
    const lines: string[] = [];

    fixture.detectChanges();
    lines.push(snap());
    fixture.componentInstance.c.set('purple');
    fixture.componentInstance.flag.set(true);
    fixture.detectChanges();
    lines.push(snap());
    fixture.componentInstance.c.set('');
    fixture.componentInstance.flag.set(false);
    fixture.detectChanges();
    lines.push(snap());

    expect(lines).toEqual([
      'style="color: blue;" class="direct"',
      'style="color: purple;" class="direct on"',
      'style="" class="direct"',
    ]);
  });

  it('Q14.10 host directive constructors and inputs run first and the host bindings of the component win', () => {
    const log: string[] = [];

    @Directive({
      selector: '[labBase]',
      host: { role: 'menu', '[style.color]': "'red'" },
    })
    class Base implements OnInit {
      readonly menuId = input('none');
      constructor() {
        log.push('ctor Base');
      }
      ngOnInit(): void {
        log.push(`init Base id=${this.menuId()}`);
      }
    }

    @Component({
      selector: 'lab-q10',
      template: '',
      hostDirectives: [{ directive: Base, inputs: ['menuId: id'] }],
      host: { role: 'navigation', '[style.color]': "'blue'" },
    })
    class Q10 implements OnInit {
      private readonly base = inject(Base);
      constructor() {
        log.push(`ctor Q10 has Base=${this.base instanceof Base}`);
      }
      ngOnInit(): void {
        log.push('init Q10');
      }
    }

    @Component({ selector: 'lab-q10-plain', template: '', hostDirectives: [Base] })
    class Plain {}

    const element = (host: Type<unknown>): HTMLElement => {
      const fixture = TestBed.createComponent(host);
      fixture.detectChanges();
      return fixture.nativeElement.firstElementChild as HTMLElement;
    };

    @Component({ selector: 'lab-q10-host', imports: [Q10], template: `<lab-q10 id="top" />` })
    class Q10Host {}

    @Component({ selector: 'lab-q10-plain-host', imports: [Plain], template: `<lab-q10-plain />` })
    class PlainHost {}

    const own = element(Q10Host);
    const printed = [...log, `${own.getAttribute('role')} ${own.style.color}`];
    const plain = element(PlainHost);
    printed.push(`${plain.getAttribute('role')} ${plain.style.color}`);

    expect(printed).toEqual([
      'ctor Base',
      'ctor Q10 has Base=true',
      'init Base id=top',
      'init Q10',
      'navigation blue',
      'menu red',
    ]);
  });

  it('Q14.15 a key that disappears from the inputs object leaves undefined, not the default', () => {
    @Component({ selector: 'lab-q15-widget', template: `W1[{{ label() }}|{{ n() }}]` })
    class Widget {
      readonly label = input('L0');
      readonly n = input(0);
    }

    @Component({
      selector: 'lab-q15',
      imports: [NgComponentOutlet],
      template: `<ng-container *ngComponentOutlet="widget; inputs: config()" />`,
    })
    class Dashboard {
      // A template cannot name a class, so the class is exposed as a member.
      protected readonly widget = Widget;
      readonly config = signal<Record<string, unknown>>({ label: 'L1', n: 1 });
    }

    const fixture = TestBed.createComponent(Dashboard);
    const shown = (): string => (fixture.nativeElement as HTMLElement).textContent ?? '';
    const lines: string[] = [];

    fixture.detectChanges();
    lines.push(shown());
    fixture.componentInstance.config.set({ label: 'L2' });
    fixture.detectChanges();
    lines.push(shown());
    fixture.componentInstance.config.set({ n: 7 });
    fixture.detectChanges();
    lines.push(shown());

    expect(lines).toEqual(['W1[L1|1]', 'W1[L2|]', 'W1[|7]']);
  });

  it('Q14.18 after an unrelated change, an in-place push and a replaced array the four forms run this often', () => {
    const runs = { pure: 0, impure: 0, method: 0, computed: 0 };

    @Pipe({ name: 'labQ18Sum' })
    class Sum implements PipeTransform {
      transform(items: readonly number[]): number {
        runs.pure++;
        return items.reduce((a, b) => a + b, 0);
      }
    }

    @Pipe({ name: 'labQ18SumLive', pure: false })
    class SumLive implements PipeTransform {
      transform(items: readonly number[]): number {
        runs.impure++;
        return items.reduce((a, b) => a + b, 0);
      }
    }

    @Component({
      selector: 'lab-q18',
      imports: [Sum, SumLive],
      template: `
        <p>{{ list() | labQ18Sum }}|{{ list() | labQ18SumLive }}|{{ byMethod() }}|{{ total() }}</p>
        <i>{{ tick() }}</i>
      `,
    })
    class Q18 {
      readonly list = signal([1, 2, 3]);
      readonly tick = signal(0);
      readonly total = computed(() => {
        runs.computed++;
        return this.list().reduce((a, b) => a + b, 0);
      });

      protected byMethod(): number {
        runs.method++;
        return this.list().reduce((a, b) => a + b, 0);
      }
    }

    const fixture = TestBed.createComponent(Q18);
    const lines: string[] = [];
    // Prints the runs since the last call, then the four texts.
    const report = (label: string): void => {
      const shown = (fixture.nativeElement as HTMLElement).querySelector('p')?.textContent;
      lines.push(`${label}: pure=${runs.pure} impure=${runs.impure} method=${runs.method} computed=${runs.computed} ${shown}`);
      runs.pure = runs.impure = runs.method = runs.computed = 0;
    };

    fixture.detectChanges();
    report('first');
    fixture.componentInstance.tick.set(1);
    fixture.detectChanges();
    report('unrelated');
    fixture.componentInstance.list().push(4);
    fixture.componentInstance.tick.set(2);
    fixture.detectChanges();
    report('push');
    fixture.componentInstance.list.update((l) => [...l]);
    fixture.detectChanges();
    report('replace');

    expect(lines).toEqual([
      'first: pure=1 impure=1 method=1 computed=1 6|6|6|6',
      'unrelated: pure=0 impure=1 method=1 computed=0 6|6|6|6',
      'push: pure=0 impure=1 method=1 computed=0 6|10|10|6',
      'replace: pure=1 impure=1 method=1 computed=1 10|10|10|10',
    ]);
  });

  it('Q14.20 an arrow function passed to a pure pipe keeps its first result, an impure pipe shows the new one', () => {
    let pureRuns = 0;

    @Pipe({ name: 'labQ20Where' })
    class Where implements PipeTransform {
      transform(items: readonly number[], keep: (n: number) => boolean): number[] {
        pureRuns++;
        return items.filter(keep);
      }
    }

    @Pipe({ name: 'labQ20WhereLive', pure: false })
    class WhereLive implements PipeTransform {
      transform(items: readonly number[], keep: (n: number) => boolean): number[] {
        return items.filter(keep);
      }
    }

    @Component({
      selector: 'lab-q20',
      imports: [Where, WhereLive],
      template: `{{ (items() | labQ20Where: (n => n > min())).length }}|{{ (items() | labQ20WhereLive: (n => n > min())).length }}`,
    })
    class Q20 {
      readonly items = signal([1, 2, 3]);
      readonly min = signal(0);
    }

    const fixture = TestBed.createComponent(Q20);
    const lines: string[] = [];

    fixture.detectChanges();
    lines.push(`${fixture.nativeElement.textContent} pureRuns=${pureRuns}`);
    fixture.componentInstance.min.set(1);
    fixture.detectChanges();
    lines.push(`${fixture.nativeElement.textContent} pureRuns=${pureRuns}`);

    expect(lines).toEqual(['3|3 pureRuns=1', '3|2 pureRuns=1']);
  });

  it('Q14.22 date, currency, number, percent, keyvalue and i18nPlural render these lines with en-US data', () => {
    const byNumericKey = (a: KeyValue<string, number>, b: KeyValue<string, number>): number =>
      Number(a.key) - Number(b.key);

    @Component({
      selector: 'lab-q22',
      imports: [DatePipe, CurrencyPipe, DecimalPipe, PercentPipe, KeyValuePipe, I18nPluralPipe],
      template: `
        <p>{{ day | date: 'yyyy-MM-dd HH:mm' : 'UTC' }}</p>
        <p>{{ 1234.5 | currency: 'EUR' }}</p>
        <p>{{ 5 | number: '3.1-1' }}</p>
        <p>{{ 0.256 | percent: '1.1-1' }}</p>
        <p>@for (e of keys | keyvalue; track e.key) {{{ e.key }} }</p>
        <p>@for (e of keys | keyvalue: byNumericKey; track e.key) {{{ e.key }} }</p>
        <p>{{ 0 | i18nPlural: plural }}</p>
        <p>{{ 5 | i18nPlural: plural }}</p>
      `,
    })
    class Q22 {
      protected readonly day = new Date(Date.UTC(2024, 6, 8, 15, 30));
      protected readonly keys: Record<string, number> = { 10: 1, 9: 1, 2: 1 };
      protected readonly byNumericKey = byNumericKey;
      protected readonly plural = { '=0': 'none', '=1': 'one item', other: '# items' };
    }

    const fixture = TestBed.createComponent(Q22);
    fixture.detectChanges();
    const printed = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('p')).map((p) =>
      (p.textContent ?? '').trim(),
    );

    expect(printed).toEqual([
      '2024-07-08 15:30',
      '€1,234.50',
      '005.0',
      '25.6%',
      '10 2 9',
      '2 9 10',
      'none',
      '5 items',
    ]);
  });

  it('Q14.25 an impure pipe and a method run together: not for a sibling signal, once per own event or own signal', () => {
    const runs = { pipe: 0, method: 0 };

    @Pipe({ name: 'labQ25Live', pure: false })
    class Live implements PipeTransform {
      transform(value: number): number {
        runs.pipe++;
        return value;
      }
    }

    @Component({
      selector: 'lab-q25-own',
      imports: [Live],
      template: `
        <button (click)="clicks.update((n) => n + 1)">click</button>
        <p>{{ version() | labQ25Live }}|{{ describe() }}</p>
      `,
    })
    class Own {
      readonly version = signal(0);
      protected readonly clicks = signal(0);

      protected describe(): string {
        runs.method++;
        return 'own';
      }
    }

    @Component({ selector: 'lab-q25-sibling', template: `{{ value() }}` })
    class Sibling {
      readonly value = signal(0);
    }

    @Component({ selector: 'lab-q25', imports: [Own, Sibling], template: `<lab-q25-own /><lab-q25-sibling />` })
    class Q25 {}

    const fixture = TestBed.createComponent(Q25);
    const lines: string[] = [];
    const record = (): void => {
      fixture.detectChanges();
      lines.push(`${runs.pipe} ${runs.method}`);
    };

    record();
    fixture.debugElement.query(By.directive(Sibling)).componentInstance.value.set(1);
    record();
    fixture.debugElement.query(By.css('button')).nativeElement.click();
    record();
    fixture.debugElement.query(By.directive(Own)).componentInstance.version.set(1);
    record();

    expect(lines).toEqual(['1 1', '1 1', '2 2', '3 3']);
  });

  it('Q14.27 three async pipes subscribe three times, a swap moves all three, destroy closes the rest', async () => {
    const counts = { subs: 0, unsubs: 0 };

    class Cold {
      private live: ((value: number) => void)[] = [];

      subscribe(observer: { next(value: number): void }): { unsubscribe(): void } {
        counts.subs++;
        this.live.push(observer.next);
        return {
          unsubscribe: () => {
            counts.unsubs++;
            this.live = this.live.filter((next) => next !== observer.next);
          },
        };
      }

      emit(value: number): void {
        this.live.forEach((next) => next(value));
      }
    }

    @Component({
      selector: 'lab-q27',
      imports: [AsyncPipe],
      template: `<p>[{{ src() | async }}][{{ src() | async }}][{{ src() | async }}]</p>`,
    })
    class Q27 {
      readonly src = signal(new Cold());
    }

    const fixture = TestBed.createComponent(Q27);
    const lines: string[] = [];
    const record = async (): Promise<void> => {
      await fixture.whenStable();
      lines.push(`subs=${counts.subs} unsubs=${counts.unsubs} ${fixture.nativeElement.textContent}`);
    };

    const first = fixture.componentInstance.src();
    fixture.detectChanges();
    await record();
    first.emit(1);
    await record();
    fixture.componentInstance.src.set(new Cold());
    await record();
    fixture.destroy();
    lines.push(`subs=${counts.subs} unsubs=${counts.unsubs}`);

    expect(lines).toEqual([
      'subs=3 unsubs=0 [][][]',
      'subs=3 unsubs=0 [1][1][1]',
      'subs=6 unsubs=3 [][][]',
      'subs=6 unsubs=6',
    ]);
  });
});
