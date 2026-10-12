// Each test reproduces one "Output" question from Module 20 and asserts the exact lines the answer prints.
// Other questions may add a test named after them for the runtime claim their answer makes.
// If Angular changes behaviour, this file fails first. Every fixture sits inside a host: a root fixture
// component's own hooks are not re-run by a second detectChanges.
import {
  AfterContentChecked,
  AfterContentInit,
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Directive,
  DoCheck,
  ChangeDetectorRef,
  DestroyRef,
  ElementRef,
  Injector,
  KeyValueDiffers,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  Type,
  afterEveryRender,
  afterNextRender,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Subject } from 'rxjs';

// Every Output test pushes into this recorder where the answer's snippet calls console.log.
const lines: string[] = [];
const log = (line: string): number => lines.push(line);

beforeEach(() => {
  lines.length = 0;
});

// Q20.02: constructors and hooks of Parent > Child (with a projected Sib) > Leaf (the child's view component).
@Directive()
abstract class Recorded
  implements
    OnChanges,
    OnInit,
    DoCheck,
    AfterContentInit,
    AfterContentChecked,
    AfterViewInit,
    AfterViewChecked
{
  protected abstract readonly name: string;
  ngOnChanges(): void {
    log(`${this.name}.onChanges`);
  }
  ngOnInit(): void {
    log(`${this.name}.onInit`);
  }
  ngDoCheck(): void {
    log(`${this.name}.doCheck`);
  }
  ngAfterContentInit(): void {
    log(`${this.name}.afterContentInit`);
  }
  ngAfterContentChecked(): void {
    log(`${this.name}.afterContentChecked`);
  }
  ngAfterViewInit(): void {
    log(`${this.name}.afterViewInit`);
  }
  ngAfterViewChecked(): void {
    log(`${this.name}.afterViewChecked`);
  }
}

@Component({ selector: 'lab-m20-q02-leaf', template: `leaf` })
class Q02Leaf extends Recorded {
  protected readonly name = 'leaf';
  readonly v = input(0);
  constructor() {
    super();
    log('leaf.ctor');
  }
}

@Component({ selector: 'lab-m20-q02-sib', template: `sib` })
class Q02Sib extends Recorded {
  protected readonly name = 'sib';
  constructor() {
    super();
    log('sib.ctor');
  }
}

@Component({
  selector: 'lab-m20-q02-child',
  imports: [Q02Leaf],
  template: `<ng-content /><lab-m20-q02-leaf [v]="v()" />`,
})
class Q02Child extends Recorded {
  protected readonly name = 'child';
  readonly v = input(0);
  constructor() {
    super();
    log('child.ctor');
    afterNextRender(() => log('child.afterNextRender'));
    afterEveryRender(() => log('child.afterEveryRender'));
  }
}

@Component({
  selector: 'lab-m20-q02-parent',
  imports: [Q02Child, Q02Sib],
  template: `<lab-m20-q02-child [v]="1"><lab-m20-q02-sib /></lab-m20-q02-child>`,
})
class Q02Parent extends Recorded {
  protected readonly name = 'parent';
  constructor() {
    super();
    log('parent.ctor');
  }
}

@Component({ selector: 'lab-m20-q02-host', imports: [Q02Parent], template: `<lab-m20-q02-parent />` })
class Q02Host {}

// Q20.04: ngOnChanges for a bound, a static and an unbound input, and a required input read in the constructor.
let instances = 0;

@Component({ selector: 'lab-m20-q04-item', template: `item` })
class Q04Item implements OnChanges, OnInit {
  readonly n = input(0);
  readonly label = input('none');
  readonly id = ++instances;

  ngOnChanges(changes: SimpleChanges<Q04Item>): void {
    const part = (key: 'n' | 'label') => {
      const c = changes[key];
      return c ? `${key} ${c.previousValue} -> ${c.currentValue} first=${c.firstChange}` : null;
    };
    log(`#${this.id} onChanges ${[part('label'), part('n')].filter(Boolean).join('; ')}`);
  }

  ngOnInit(): void {
    log(`#${this.id} onInit`);
  }
}

@Component({ selector: 'lab-m20-q04-strict', template: `strict` })
class Q04Strict implements OnInit {
  readonly r = input.required<string>();

  constructor() {
    // The compiler rejects `this.r()` here with NG8118 (Q17.28); the cast hides the read from the
    // compiler and not from the runtime.
    const read = (this as unknown as { r: () => string }).r;
    try {
      log(`ctor r ${read()}`);
    } catch (error) {
      log(`ctor r threw ${(error as Error).message}`);
    }
  }

  ngOnInit(): void {
    log(`init r ${this.r()}`);
  }
}

@Component({
  selector: 'lab-m20-q04-host',
  imports: [Q04Item, Q04Strict],
  template: `
    <lab-m20-q04-item [n]="5" label="static" />
    <lab-m20-q04-item />
    <lab-m20-q04-strict r="static" />
  `,
})
class Q04Host {}

// Q20.05: the three faults of the reviewed component, and the fix for the leak.
const ticks = new Subject<number>();

@Component({ selector: 'lab-m20-q05-review', template: `{{ label }}` })
class Q05Review implements OnInit, AfterViewInit {
  readonly id = input(0);
  protected readonly label = `item ${this.id()}`;

  ngOnInit(): void {
    try {
      inject(Injector);
    } catch (error) {
      log(`ngOnInit inject threw ${(error as Error).message.slice(0, 6)}`);
    }
  }

  ngAfterViewInit(): void {
    ticks.subscribe((value) => log(`tick ${value}`));
  }
}

@Component({ selector: 'lab-m20-q05-fixed', template: `fixed` })
class Q05Fixed {
  constructor() {
    ticks.pipe(takeUntilDestroyed()).subscribe((value) => log(`fixed tick ${value}`));
  }
}

@Component({
  selector: 'lab-m20-q05-host',
  imports: [Q05Review, Q05Fixed],
  template: `
    @if (on()) {
      <lab-m20-q05-review [id]="7" />
      <lab-m20-q05-fixed />
    }
  `,
})
class Q05Host {
  readonly on = signal(true);
}

// Q20.07: one component whose derived state, effect and template read the same signal input.
@Component({ selector: 'lab-m20-q07-reactive', template: `{{ doubled() }}{{ mark() }}` })
class Q07Reactive implements OnChanges, DoCheck {
  readonly n = input(1);
  readonly doubled = computed(() => this.n() * 2);

  constructor() {
    effect(() => {
      log(`effect n=${this.n()}`);
    });
  }

  ngOnChanges(changes: SimpleChanges<Q07Reactive>): void {
    log(`onChanges ${changes.n?.previousValue} -> ${changes.n?.currentValue}`);
  }
  ngDoCheck(): void {
    log('doCheck');
  }
  mark(): string {
    log('template');
    return '';
  }
}

@Component({
  selector: 'lab-m20-q07-host',
  imports: [Q07Reactive],
  template: `<lab-m20-q07-reactive [n]="n()" />`,
})
class Q07Host {
  readonly n = signal(1);
}

// Q20.09: a child that diffs an object its host edits in place. The plain child leaves the view alone; the
// marking child asks to be checked when the differ sees a change.
@Component({ selector: 'lab-m20-q09-child', template: `{{ o()['b'] }}` })
class Q09Child implements DoCheck {
  readonly o = input.required<Record<string, number>>();
  private readonly differ = inject(KeyValueDiffers).find({}).create<string, number>();

  ngDoCheck(): void {
    log('doCheck');
    if (this.differ.diff(this.o())) {
      log('diff saw a change');
    }
  }
}

@Component({ selector: 'lab-m20-q09-marking', template: `{{ o()['b'] }}` })
class Q09Marking implements DoCheck {
  readonly o = input.required<Record<string, number>>();
  private readonly differ = inject(KeyValueDiffers).find({}).create<string, number>();
  private readonly cdr = inject(ChangeDetectorRef);

  ngDoCheck(): void {
    if (this.differ.diff(this.o())) {
      this.cdr.markForCheck();
    }
  }
}

@Component({
  selector: 'lab-m20-q09-host',
  imports: [Q09Child, Q09Marking],
  template: `<lab-m20-q09-child [o]="o()" /><lab-m20-q09-marking [o]="o()" />{{ tick() }}`,
})
class Q09Host {
  readonly o = signal<Record<string, number>>({ a: 1, b: 1 });
  readonly tick = signal(0);
}

// Q20.11: three components register phase callbacks and plain callbacks. B is created first, A registers all four
// phases and two afterNextRender callbacks, C registers one plain callback.
@Component({ selector: 'lab-m20-q11-b', template: `b` })
class Q11B {
  constructor() {
    afterEveryRender({ read: () => log('B.read') });
    afterEveryRender({ write: () => log('B.write') });
  }
}

@Component({ selector: 'lab-m20-q11-a', template: `a` })
class Q11A {
  constructor() {
    afterEveryRender({
      earlyRead: () => {
        log('A.earlyRead');
        return 'A-E';
      },
      write: (fromEarly: string) => {
        log(`A.write got ${fromEarly}`);
        return 'A-W';
      },
      mixedReadWrite: (fromWrite: string) => {
        log(`A.mixed got ${fromWrite}`);
        return 'A-M';
      },
      read: (fromMixed: string) => {
        log(`A.read got ${fromMixed}`);
      },
    });
    afterNextRender(() => log('A.nextRender plain'));
    afterNextRender({ read: () => log('A.nextRender read') });
  }
}

@Component({ selector: 'lab-m20-q11-c', template: `c` })
class Q11C {
  constructor() {
    afterEveryRender(() => log('C.plain'));
  }
}

@Component({
  selector: 'lab-m20-q11-host',
  imports: [Q11B, Q11A, Q11C],
  template: `<lab-m20-q11-b /><lab-m20-q11-a /><lab-m20-q11-c />`,
})
class Q11Host {}

// Q20.13: what a widget can see of its own template in each place it could be created.
@Component({ selector: 'lab-m20-q13-widget', template: `<span>{{ text() }}</span>` })
class Q13Widget implements OnInit, AfterViewInit {
  readonly text = signal('ready');
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  constructor() {
    this.seen('constructor');
    afterNextRender(() => this.seen('afterNextRender'));
  }

  ngOnInit(): void {
    this.seen('ngOnInit');
  }

  ngAfterViewInit(): void {
    this.seen('ngAfterViewInit');
  }

  private seen(place: string): void {
    log(`${place}: ${this.element.querySelector('span')?.textContent ?? 'no span'}`);
  }
}

@Component({ selector: 'lab-m20-q13-host', imports: [Q13Widget], template: `<lab-m20-q13-widget />` })
class Q13Host {}

// Q20.14: every teardown route of one component, registered in a known order and removed by an @if.
const q14Source = new Subject<number>();

@Component({ selector: 'lab-m20-q14-teardown', template: `{{ tick() }}` })
class Q14Teardown implements OnDestroy {
  readonly tick = signal(0);
  private readonly ref = inject(DestroyRef);

  constructor() {
    this.ref.onDestroy(() => log('onDestroy cb1'));
    q14Source.pipe(takeUntilDestroyed()).subscribe({
      next: (value) => log(`next ${value}`),
      complete: () => log('completed by takeUntilDestroyed'),
    });
    this.ref.onDestroy(() => log('onDestroy cb2'));
    effect((onCleanup) => {
      this.tick();
      onCleanup(() => log('effect cleanup'));
    });
  }

  ngOnDestroy(): void {
    log('ngOnDestroy');
  }
}

@Component({
  selector: 'lab-m20-q14-host',
  imports: [Q14Teardown],
  template: `@if (on()) {<lab-m20-q14-teardown />}`,
})
class Q14Host {
  readonly on = signal(true);
}

// Q20.17: late async work that registers a cleanup, unguarded and guarded, on a component that may be gone.
@Component({ selector: 'lab-m20-q17-late', template: `late` })
class Q17Late {
  private readonly ref = inject(DestroyRef);

  async work(guarded: boolean): Promise<void> {
    await Promise.resolve();
    if (guarded && this.ref.destroyed) {
      log(`guarded: skipped, destroyed=${this.ref.destroyed}`);
      return;
    }
    try {
      this.ref.onDestroy(() => log('cleanup ran'));
      log('registered');
    } catch (error) {
      log(`unguarded: ${(error as Error).message}`);
    }
  }
}

// Q20.20: a child that writes into its parent in ngOnInit, under three parents.
abstract class Q20Parent {
  abstract write(): void;
}

@Component({ selector: 'lab-m20-q20-child', template: `child` })
class Q20Child implements OnInit {
  private readonly parent = inject(Q20Parent);

  ngOnInit(): void {
    this.parent.write();
  }
}

@Component({
  selector: 'lab-m20-q20-eager',
  imports: [Q20Child],
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [{ provide: Q20Parent, useExisting: forwardRef(() => Q20Eager) }],
  template: `<h1>{{ title }}</h1><lab-m20-q20-child />`,
})
class Q20Eager extends Q20Parent {
  title = 'initial';
  write(): void {
    this.title = 'changed';
  }
}

@Component({
  selector: 'lab-m20-q20-default',
  imports: [Q20Child],
  providers: [{ provide: Q20Parent, useExisting: forwardRef(() => Q20Default) }],
  template: `<h1>{{ title }}</h1><lab-m20-q20-child />`,
})
class Q20Default extends Q20Parent {
  title = 'initial';
  write(): void {
    this.title = 'changed';
  }
}

@Component({
  selector: 'lab-m20-q20-signal',
  imports: [Q20Child],
  providers: [{ provide: Q20Parent, useExisting: forwardRef(() => Q20Signal) }],
  template: `<h1>{{ title() }}</h1><lab-m20-q20-child />`,
})
class Q20Signal extends Q20Parent {
  readonly title = signal('initial');
  write(): void {
    this.title.set('changed');
  }
}

function q20Outcome(label: string, parent: Type<Q20Parent>): void {
  TestBed.resetTestingModule();
  const fixture = TestBed.createComponent(parent);
  try {
    fixture.detectChanges();
    log(`${label}: no error, the screen shows ${fixture.nativeElement.querySelector('h1').textContent}`);
  } catch (error) {
    log(`${label}: ${(error as Error).message}`);
  }
}

// Q20.23: only the parent's signal changes, in the tree of Q20.02 with a signal added to the parent's template.
@Component({
  selector: 'lab-m20-q23-parent',
  imports: [Q02Child, Q02Sib],
  template: `<lab-m20-q02-child [v]="1"><lab-m20-q02-sib /></lab-m20-q02-child>{{ w() }}`,
})
class Q23Parent extends Recorded {
  protected readonly name = 'parent';
  readonly w = signal(0);
}

@Component({ selector: 'lab-m20-q23-host', imports: [Q23Parent], template: `<lab-m20-q23-parent />` })
class Q23Host {}

describe('Output questions of Module 20', () => {
  it('Q20.02 the constructors, then the hooks down the tree and back up, then the render hooks', () => {
    TestBed.createComponent(Q02Host).detectChanges();
    expect(lines).toEqual([
      'parent.ctor',
      'child.ctor',
      'sib.ctor',
      'leaf.ctor',
      'parent.onInit',
      'parent.doCheck',
      'parent.afterContentInit',
      'parent.afterContentChecked',
      'child.onChanges',
      'child.onInit',
      'child.doCheck',
      'sib.onInit',
      'sib.doCheck',
      'sib.afterContentInit',
      'sib.afterContentChecked',
      'child.afterContentInit',
      'child.afterContentChecked',
      'leaf.onChanges',
      'leaf.onInit',
      'leaf.doCheck',
      'leaf.afterContentInit',
      'leaf.afterContentChecked',
      'leaf.afterViewInit',
      'leaf.afterViewChecked',
      'sib.afterViewInit',
      'sib.afterViewChecked',
      'child.afterViewInit',
      'child.afterViewChecked',
      'parent.afterViewInit',
      'parent.afterViewChecked',
      'child.afterNextRender',
      'child.afterEveryRender',
    ]);
  });

  it('Q20.04 ngOnChanges reports the bound and the static input, skips the unbound one, and the constructor read of a required input throws NG0950', () => {
    instances = 0;
    TestBed.createComponent(Q04Host).detectChanges();
    expect(lines).toEqual([
      'ctor r threw NG0950: Input "r" is required but no value is available yet. Find more at https://v22.angular.dev/errors/NG0950',
      '#1 onChanges label undefined -> static first=true; n undefined -> 5 first=true',
      '#1 onInit',
      '#2 onInit',
      'init r static',
    ]);
  });

  it('Q20.05 the constructor reads the default, ngOnInit cannot inject, and only takeUntilDestroyed ends the subscription', () => {
    const fixture = TestBed.createComponent(Q05Host);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('item 0');
    expect(lines).toEqual(['ngOnInit inject threw NG0203']);

    ticks.next(1);
    expect(lines).toEqual(['ngOnInit inject threw NG0203', 'fixed tick 1', 'tick 1']);

    fixture.componentInstance.on.set(false);
    fixture.detectChanges();
    expect(ticks.observed).toBe(true);
    ticks.next(2);
    expect(lines.slice(3)).toEqual(['tick 2']);
    expect(ticks.observers.length).toBe(1);
  });

  it('Q20.07 an input change runs onChanges, ngDoCheck, the effect and then the template', () => {
    const fixture = TestBed.createComponent(Q07Host);
    fixture.detectChanges();
    lines.length = 0;
    fixture.componentInstance.n.set(2);
    fixture.detectChanges();
    expect(lines).toEqual(['onChanges 1 -> 2', 'doCheck', 'effect n=2', 'template']);
  });

  it('Q20.09 an in-place edit reaches neither ngDoCheck nor the text, a refresh of the host runs ngDoCheck only, and replacing the object updates the text', () => {
    const fixture = TestBed.createComponent(Q09Host);
    fixture.detectChanges();
    const text = (selector: string): string =>
      fixture.nativeElement.querySelector(selector).textContent;
    expect(lines).toEqual(['doCheck', 'diff saw a change']);
    expect([text('lab-m20-q09-child'), text('lab-m20-q09-marking')]).toEqual(['1', '1']);

    lines.length = 0;
    fixture.componentInstance.o()['b'] = 2;
    fixture.detectChanges();
    expect(lines).toEqual([]);
    expect([text('lab-m20-q09-child'), text('lab-m20-q09-marking')]).toEqual(['1', '1']);

    fixture.componentInstance.tick.set(1);
    fixture.detectChanges();
    expect(lines).toEqual(['doCheck', 'diff saw a change']);
    expect([text('lab-m20-q09-child'), text('lab-m20-q09-marking')]).toEqual(['1', '2']);

    fixture.componentInstance.o.set({ a: 1, b: 3 });
    fixture.detectChanges();
    expect([text('lab-m20-q09-child'), text('lab-m20-q09-marking')]).toEqual(['3', '3']);
  });

  it('Q20.11 the phases run across components one phase at a time and each phase receives the previous result', () => {
    TestBed.createComponent(Q11Host).detectChanges();
    expect(lines).toEqual([
      'A.earlyRead',
      'B.write',
      'A.write got A-E',
      'A.mixed got A-W',
      'A.nextRender plain',
      'C.plain',
      'B.read',
      'A.read got A-M',
      'A.nextRender read',
    ]);
  });

  it('Q20.13 only the render callback and ngAfterViewInit see the written template', () => {
    TestBed.createComponent(Q13Host).detectChanges();
    expect(lines).toEqual([
      'constructor: no span',
      'ngOnInit: ',
      'ngAfterViewInit: ready',
      'afterNextRender: ready',
    ]);
  });

  it('Q20.14 ngOnDestroy, then the DestroyRef callbacks with the stream completion, then the effect cleanup', () => {
    const fixture = TestBed.createComponent(Q14Host);
    fixture.detectChanges();
    q14Source.next(1);
    expect(lines).toEqual(['next 1']);

    lines.length = 0;
    fixture.componentInstance.on.set(false);
    fixture.detectChanges();
    expect(lines).toEqual([
      'ngOnDestroy',
      'onDestroy cb1',
      'completed by takeUntilDestroyed',
      'onDestroy cb2',
      'effect cleanup',
    ]);

    lines.length = 0;
    q14Source.next(2);
    expect(lines).toEqual([]);
  });

  it('Q20.17 a callback registered after destruction throws NG0911 unless a destroyed check comes first', async () => {
    const unguarded = TestBed.createComponent(Q17Late);
    const pendingUnguarded = unguarded.componentInstance.work(false);
    unguarded.destroy();
    await pendingUnguarded;

    const guarded = TestBed.createComponent(Q17Late);
    const pendingGuarded = guarded.componentInstance.work(true);
    guarded.destroy();
    await pendingGuarded;

    const alive = TestBed.createComponent(Q17Late);
    await alive.componentInstance.work(true);
    alive.destroy();

    expect(lines).toEqual([
      'unguarded: NG0911: View has already been destroyed.',
      'guarded: skipped, destroyed=true',
      'registered',
      'cleanup ran',
    ]);
  });

  it('Q20.20 a plain field throws in an Eager parent, stays stale in a default parent, and a signal renders', () => {
    q20Outcome('eager', Q20Eager);
    q20Outcome('default', Q20Default);
    q20Outcome('signal', Q20Signal);
    expect(lines).toEqual([
      "eager: NG0100: ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked. Previous value: 'initial'. Current value: 'changed'. Expression location: _Q20Eager component. Find more at https://v22.angular.dev/errors/NG0100",
      'default: no error, the screen shows initial',
      'signal: no error, the screen shows changed',
    ]);
  });

  it("Q20.23 a signal read only by the parent's template runs the check hooks of the child and the projected child, and nothing of the parent or the leaf", () => {
    const fixture = TestBed.createComponent(Q23Host);
    fixture.detectChanges();
    const parent: Q23Parent = fixture.debugElement.query(By.directive(Q23Parent)).componentInstance;
    lines.length = 0;
    parent.w.set(1);
    fixture.detectChanges();
    expect(lines).toEqual([
      'child.doCheck',
      'sib.doCheck',
      'sib.afterContentChecked',
      'child.afterContentChecked',
      'sib.afterViewChecked',
      'child.afterViewChecked',
      'child.afterEveryRender',
    ]);
  });
});
