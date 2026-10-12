// Each test reproduces one "Output" question from Module 21 and asserts the exact lines the answer prints.
// Every fixture sits inside a host and records "ran" names in a Set: the development check can evaluate an
// Eager template twice, so the tests assert which templates ran and never how many times.
// If Angular changes behaviour, this file fails first.
import { AsyncPipe } from '@angular/common';
import {
  afterEveryRender,
  ApplicationRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EnvironmentProviders,
  ErrorHandler,
  inject,
  Injectable,
  Input,
  input,
  NgZone,
  PendingTasks,
  provideCheckNoChangesConfig,
  Provider,
  signal,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

// Every Output test pushes into this recorder where the answer's snippet calls console.log.
const lines: string[] = [];
const log = (line: string): number => lines.push(line);
const ran = new Set<string>();

beforeEach(() => {
  lines.length = 0;
  ran.clear();
});

// Q21.05: a parent edits an object in place, then passes a new one, to an OnPush and an Eager child.
@Component({ selector: 'lab-m21-q05-push', template: `{{ tpl() }}n={{ o().n }}` })
class Q05Push {
  readonly o = input.required<{ n: number }>();

  protected tpl(): string {
    ran.add('push');
    return '';
  }
}

// Eager on purpose: an Eager view is checked whenever the walk reaches it.
@Component({
  selector: 'lab-m21-q05-eager',
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `{{ tpl() }}n={{ o().n }}`,
})
class Q05Eager {
  readonly o = input.required<{ n: number }>();

  protected tpl(): string {
    ran.add('eager');
    return '';
  }
}

@Component({
  selector: 'lab-m21-q05-owner',
  imports: [Q05Push, Q05Eager],
  template: `{{ tpl() }}<lab-m21-q05-push [o]="o" /><lab-m21-q05-eager [o]="o" />`,
})
class Q05Owner {
  readonly s = signal(0);
  o = { n: 1 };

  protected tpl(): string {
    ran.add('owner');
    return `s${this.s()}`;
  }
}

// Q21.06: three OnPush views that stay stale because nothing announces the write, and the fix of each.
const feed = new BehaviorSubject('none');

@Component({ selector: 'lab-m21-q06-subscribed', template: `{{ value }}` })
class Q06Subscribed {
  value = 'none';

  constructor() {
    feed.pipe(takeUntilDestroyed()).subscribe((next) => (this.value = next));
  }
}

@Component({
  selector: 'lab-m21-q06-piped',
  imports: [AsyncPipe],
  template: `{{ feed$ | async }}`,
})
class Q06Piped {
  protected readonly feed$ = feed;
}

@Injectable({ providedIn: 'root' })
class Q06MutatingUsers {
  readonly current = { name: 'Ann' };

  rename(name: string): void {
    this.current.name = name;
  }
}

@Injectable({ providedIn: 'root' })
class Q06SignalUsers {
  readonly current = signal({ name: 'Ann' });

  rename(name: string): void {
    this.current.update((user) => ({ ...user, name }));
  }
}

@Component({ selector: 'lab-m21-q06-mutated', template: `{{ users.current.name }}` })
class Q06Mutated {
  readonly users = inject(Q06MutatingUsers);
}

@Component({ selector: 'lab-m21-q06-signalled', template: `{{ users.current().name }}` })
class Q06Signalled {
  readonly users = inject(Q06SignalUsers);
}

// The decorator form, because the question names `@ViewChild`.
@Component({ selector: 'lab-m21-q06-badge', template: `{{ label }}` })
class Q06Badge {
  @Input() label = 'a';
}

@Component({
  selector: 'lab-m21-q06-owner-bug',
  imports: [Q06Badge],
  template: `<button type="button" (click)="rename()">go</button><lab-m21-q06-badge />`,
})
class Q06OwnerBug {
  @ViewChild(Q06Badge) badge!: Q06Badge;

  protected rename(): void {
    this.badge.label = 'b';
  }
}

@Component({
  selector: 'lab-m21-q06-owner-fix',
  imports: [Q06Badge],
  template: `<button type="button" (click)="label.set('b')">go</button
    ><lab-m21-q06-badge [label]="label()" />`,
})
class Q06OwnerFix {
  readonly label = signal('a');
}

@Component({
  selector: 'lab-m21-q06-host',
  imports: [Q06Subscribed, Q06Piped, Q06Mutated, Q06Signalled],
  template: `<lab-m21-q06-subscribed /><i>|</i><lab-m21-q06-piped /><i>|</i><lab-m21-q06-mutated
    /><i>|</i><lab-m21-q06-signalled />`,
})
class Q06Host {}

// Q21.14: a click in an OnPush button component, with an Eager and an OnPush sibling beside it.
@Component({
  selector: 'lab-m21-q14-btn',
  template: `<button type="button" (click)="clicks = clicks + 1">{{ tpl() }}</button>`,
})
class Q14Btn {
  clicks = 0;

  protected tpl(): string {
    ran.add('btn');
    return `clicks${this.clicks}`;
  }
}

// Eager on purpose: an Eager view is checked whenever the walk reaches it.
@Component({
  selector: 'lab-m21-q14-eager-sib',
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `{{ tpl() }}{{ field }}`,
})
class Q14EagerSib {
  field = 'a';

  protected tpl(): string {
    ran.add('eager-sib');
    return '';
  }
}

@Component({ selector: 'lab-m21-q14-push-sib', template: `{{ tpl() }}{{ field }}` })
class Q14PushSib {
  field = 'a';

  protected tpl(): string {
    ran.add('push-sib');
    return '';
  }
}

@Component({
  selector: 'lab-m21-q14-mid',
  imports: [Q14Btn, Q14EagerSib, Q14PushSib],
  template: `{{ tpl() }}<lab-m21-q14-btn /><lab-m21-q14-eager-sib /><lab-m21-q14-push-sib />`,
})
class Q14Mid {
  protected tpl(): string {
    ran.add('mid');
    return '';
  }
}

@Component({
  selector: 'lab-m21-q14-root',
  imports: [Q14Mid],
  template: `{{ tpl() }}<lab-m21-q14-mid />`,
})
class Q14Root {
  protected tpl(): string {
    ran.add('root');
    return '';
  }
}

// Q21.15: a signal written in a leaf, then markForCheck called from the same leaf.
@Component({
  selector: 'lab-m21-q15-leaf',
  template: `{{ tpl() }}{{ n() }}`,
})
class Q15Leaf {
  readonly n = signal(0);
  readonly cdr = inject(ChangeDetectorRef);

  protected tpl(): string {
    ran.add('leaf');
    return '';
  }
}

@Component({
  selector: 'lab-m21-q15-par',
  imports: [Q15Leaf],
  template: `{{ tpl() }}<lab-m21-q15-leaf />`,
})
class Q15Par {
  protected tpl(): string {
    ran.add('par');
    return '';
  }
}

@Component({ selector: 'lab-m21-q15-sib', template: `{{ tpl() }}` })
class Q15Sib {
  protected tpl(): string {
    ran.add('sib');
    return '';
  }
}

@Component({
  selector: 'lab-m21-q15-root',
  imports: [Q15Par, Q15Sib],
  template: `{{ tpl() }}<lab-m21-q15-par /><lab-m21-q15-sib />`,
})
class Q15Root {
  protected tpl(): string {
    ran.add('root');
    return '';
  }
}

// Q21.16: the content of @if and @for blocks reads a signal that only the blocks read.
@Component({
  selector: 'lab-m21-q16-blocks',
  template: `{{ outer() }}
    @if (visible) {
      <p>{{ ifBlock() }}{{ n() }}</p>
    }
    @for (row of rows; track row) {
      <i>{{ forBlock() }}{{ n() }}</i>
    }`,
})
class Q16Blocks {
  readonly n = signal(0);
  readonly visible = true;
  readonly rows = ['a'];

  protected outer(): string {
    ran.add('declaring');
    return '';
  }

  protected ifBlock(): string {
    ran.add('if-block');
    return '';
  }

  protected forBlock(): string {
    ran.add('for-block');
    return '';
  }
}

// Q21.18: three signal writes in one turn, with a render-hook counter.
@Component({ selector: 'lab-m21-q18-counter', template: `{{ count() }}` })
class Q18Counter {
  readonly count = signal(0);
  renders = 0;

  constructor() {
    afterEveryRender(() => {
      this.renders += 1;
    });
  }
}

// Q21.21: NgZone in a zoneless TestBed, next to a component that renders from a signal.
@Component({ selector: 'lab-m21-q21-counter', template: `{{ count() }}` })
class Q21Counter {
  readonly count = signal(0);
}

// Q21.25: a signal and a plain field in an OnPush view that holds its own ChangeDetectorRef.
@Component({ selector: 'lab-m21-q25-panel', template: `{{ count() }}|{{ plain }}` })
class Q25Panel {
  readonly count = signal(0);
  plain = 'a';
  readonly cdr = inject(ChangeDetectorRef);
}

// Q21.30: a plain-field write in an OnPush component, under three configurations of the development check.
@Component({ selector: 'lab-m21-q30-board', template: `{{ open }}|{{ count() }}` })
class Q30Board {
  open = 'a';
  readonly count = signal(0);
}

const NG0100 = /NG0100.*Previous value: '(\w)'/s;

const outcome = (run: () => void): string => {
  try {
    run();
    return 'threw nothing';
  } catch (error) {
    const match = NG0100.exec(String(error));
    return match ? `threw NG0100, Previous value: '${match[1]}'` : 'threw another error';
  }
};

const settleTimers = () => new Promise<void>((resolve) => setTimeout(resolve, 20));

describe('Q21 outputs', () => {
  it('Q21.05 an in-place edit reaches the Eager child and not the OnPush child, a new object reaches both', async () => {
    const fixture = TestBed.createComponent(Q05Owner);
    fixture.detectChanges();
    const owner = fixture.componentInstance;
    const textOf = (type: typeof Q05Push | typeof Q05Eager): string =>
      fixture.debugElement.query(By.directive(type)).nativeElement.textContent;
    const report = (step: string): void => {
      const names = ['owner', 'push', 'eager'].filter((name) => ran.has(name));
      log(`${step}: ran ${names.join(', ')}; push ${textOf(Q05Push)}, eager ${textOf(Q05Eager)}`);
      ran.clear();
    };
    ran.clear();

    owner.o.n = 2;
    owner.s.update((n) => n + 1);
    await fixture.whenStable();
    report('in-place edit');

    owner.o = { n: 3 };
    owner.s.update((n) => n + 1);
    await fixture.whenStable();
    report('new object');

    expect(lines).toEqual([
      'in-place edit: ran owner, eager; push n=1, eager n=2',
      'new object: ran owner, push, eager; push n=3, eager n=3',
    ]);
  });

  it('Q21.06 a subscription, a mutating service and a ViewChild write stay invisible, and each fix renders', async () => {
    feed.next('none');
    const fixture = TestBed.createComponent(Q06Host);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('none|none|Ann|Ann');

    feed.next('live');
    TestBed.inject(Q06MutatingUsers).rename('Bea');
    TestBed.inject(Q06SignalUsers).rename('Bea');
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toBe('none|live|Ann|Bea');

    const bug = TestBed.createComponent(Q06OwnerBug);
    const fix = TestBed.createComponent(Q06OwnerFix);
    for (const owner of [bug, fix]) {
      owner.detectChanges();
      owner.debugElement.query(By.css('button')).nativeElement.click();
      await owner.whenStable();
    }
    const badgeText = (owner: typeof bug | typeof fix): string =>
      owner.debugElement.query(By.directive(Q06Badge)).nativeElement.textContent;
    expect(badgeText(bug)).toBe('a');
    expect(badgeText(fix)).toBe('b');
  });

  it('Q21.14 a click refreshes the path to the root and the Eager sibling and skips the OnPush sibling', async () => {
    const fixture = TestBed.createComponent(Q14Root);
    fixture.detectChanges();
    const textOf = (type: typeof Q14EagerSib | typeof Q14PushSib): string =>
      fixture.debugElement.query(By.directive(type)).nativeElement.textContent;
    fixture.debugElement.query(By.directive(Q14EagerSib)).componentInstance.field = 'b';
    fixture.debugElement.query(By.directive(Q14PushSib)).componentInstance.field = 'b';
    ran.clear();

    fixture.debugElement.query(By.css('button')).nativeElement.click();
    await fixture.whenStable();

    const names = ['root', 'mid', 'btn', 'eager-sib', 'push-sib'];
    log(`ran: ${names.filter((name) => ran.has(name)).join(', ')}`);
    log(`did not run: ${names.filter((name) => !ran.has(name)).join(', ')}`);
    log(`eager-sib ${textOf(Q14EagerSib)}, push-sib ${textOf(Q14PushSib)}`);

    expect(lines).toEqual([
      'ran: root, mid, btn, eager-sib',
      'did not run: push-sib',
      'eager-sib b, push-sib a',
    ]);
  });

  it('Q21.15 a signal refreshes only its leaf and markForCheck refreshes the path to the root', async () => {
    const fixture = TestBed.createComponent(Q15Root);
    fixture.detectChanges();
    const leaf = fixture.debugElement.query(By.directive(Q15Leaf)).componentInstance as Q15Leaf;
    const names = ['root', 'par', 'leaf', 'sib'];
    const report = (step: string): void => {
      log(`${step}: ran ${names.filter((name) => ran.has(name)).join(', ')}`);
      ran.clear();
    };
    ran.clear();

    leaf.n.set(1);
    await fixture.whenStable();
    report('signal write');

    leaf.cdr.markForCheck();
    await fixture.whenStable();
    report('markForCheck');

    expect(lines).toEqual(['signal write: ran leaf', 'markForCheck: ran root, par, leaf']);
  });

  it('Q21.16 a signal read only inside an @if or @for block refreshes the declaring component and the blocks', async () => {
    const fixture = TestBed.createComponent(Q16Blocks);
    fixture.detectChanges();
    ran.clear();

    fixture.componentInstance.n.set(1);
    await fixture.whenStable();

    expect([...ran].sort()).toEqual(['declaring', 'for-block', 'if-block']);
    expect(fixture.nativeElement.textContent).toContain('1');
  });

  it('Q21.18 three signal writes in one turn render once, after the stable point', async () => {
    const fixture = TestBed.createComponent(Q18Counter);
    fixture.detectChanges();
    await fixture.whenStable();
    const counter = fixture.componentInstance;
    counter.renders = 0;
    const report = (step: string): void => {
      log(`${step}: ${fixture.nativeElement.textContent}, renders ${counter.renders}`);
    };

    counter.count.set(1);
    counter.count.set(2);
    counter.count.set(3);
    report('synchronously');

    await Promise.resolve();
    report('after a microtask');

    await fixture.whenStable();
    report('after whenStable');

    expect(lines).toEqual([
      'synchronously: 0, renders 0',
      'after a microtask: 0, renders 0',
      'after whenStable: 3, renders 1',
    ]);
  });

  it('Q21.20 an open pending task keeps the app unstable and whenStable pending, and run does the same until its promise settles', async () => {
    const app = TestBed.inject(ApplicationRef);
    const tasks = TestBed.inject(PendingTasks);
    const stable = () => firstValueFrom(app.isStable);
    let resolved = false;
    log(`start: ${await stable()}`);

    const done = tasks.add();
    void app.whenStable().then(() => {
      resolved = true;
    });
    await settleTimers();
    log(`task open: ${await stable()}, whenStable ${resolved ? 'resolved' : 'pending'}`);

    done();
    await app.whenStable();
    log(`task closed: ${await stable()}, whenStable ${resolved ? 'resolved' : 'pending'}`);

    let release: () => void = () => undefined;
    tasks.run(() => new Promise<void>((resolve) => (release = resolve)));
    log(`run open: ${await stable()}`);

    release();
    await app.whenStable();
    log(`run settled: ${await stable()}`);

    expect(lines).toEqual([
      'start: true',
      'task open: false, whenStable pending',
      'task closed: true, whenStable resolved',
      'run open: false',
      'run settled: true',
    ]);
  });

  it('Q21.21 NgZone is a no-op class zoneless: stable, silent observables, run and runOutsideAngular return their results', async () => {
    const zone = TestBed.inject(NgZone);
    let events = 0;
    zone.onMicrotaskEmpty.subscribe(() => (events += 1));
    zone.onStable.subscribe(() => (events += 1));
    zone.onUnstable.subscribe(() => (events += 1));
    const fixture = TestBed.createComponent(Q21Counter);
    fixture.detectChanges();

    fixture.componentInstance.count.set(1);
    await fixture.whenStable();

    log(`class: ${zone.constructor.name}`);
    log(`isStable: ${zone.isStable}, hasPendingMacrotasks: ${zone.hasPendingMacrotasks}`);
    log(`events after a signal-driven render: ${events}`);
    log(`run: ${zone.run(() => 42)}, runOutsideAngular: ${zone.runOutsideAngular(() => 43)}`);
    log(`isInAngularZone: ${NgZone.isInAngularZone()}`);

    expect(fixture.nativeElement.textContent).toBe('1');
    expect(lines).toEqual([
      'class: NoopNgZone',
      'isStable: true, hasPendingMacrotasks: false',
      'events after a signal-driven render: 0',
      'run: 42, runOutsideAngular: 43',
      'isInAngularZone: false',
    ]);
  });

  it('Q21.25 a detached view ignores signal writes, detectChanges renders it on demand and reattach renders the latest state', async () => {
    const fixture = TestBed.createComponent(Q25Panel);
    fixture.detectChanges();
    await fixture.whenStable();
    const panel = fixture.componentInstance;
    const report = (step: string): void => {
      log(`${step}: ${fixture.nativeElement.textContent}`);
    };

    panel.cdr.detach();
    panel.count.set(1);
    await fixture.whenStable();
    report('detached, signal 1');

    panel.cdr.detectChanges();
    report('detectChanges');

    panel.count.set(2);
    panel.plain = 'z';
    await fixture.whenStable();
    report('detached, signal 2 and plain z');

    panel.cdr.reattach();
    await fixture.whenStable();
    report('reattach');

    expect(lines).toEqual([
      'detached, signal 1: 0|a',
      'detectChanges: 1|a',
      'detached, signal 2 and plain z: 1|a',
      'reattach: 2|z',
    ]);
  });

  it('Q21.30 the default check is silent for a plain-field write in an OnPush component, the exhaustive check throws NG0100 and its interval reports without a tick', async () => {
    const mountBoard = async (providers: (Provider | EnvironmentProviders)[]) => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({ providers });
      const fixture = TestBed.createComponent(Q30Board);
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.componentInstance.open = 'x';
      return fixture;
    };

    const plain = await mountBoard([]);
    const defaultTick = outcome(() => TestBed.inject(ApplicationRef).tick());
    const defaultDetect = outcome(() => plain.detectChanges());
    await plain.whenStable();
    log(`default: tick ${defaultTick}, detectChanges ${defaultDetect}, text ${plain.nativeElement.textContent}`);

    const exhaustive = await mountBoard([provideCheckNoChangesConfig({ exhaustive: true })]);
    log(`exhaustive: tick ${outcome(() => TestBed.inject(ApplicationRef).tick())}`);
    log(`exhaustive: detectChanges ${outcome(() => exhaustive.detectChanges())}`);

    const reported: unknown[] = [];
    const timed = await mountBoard([
      provideCheckNoChangesConfig({ exhaustive: true, interval: 20 }),
      { provide: ErrorHandler, useValue: { handleError: (error: unknown) => reported.push(error) } },
    ]);
    await new Promise<void>((resolve) => setTimeout(resolve, 120));
    const first = NG0100.exec(String(reported[0]));
    log(
      `exhaustive with interval 20 and no tick: ${first ? `reported NG0100, Previous value: '${first[1]}'` : 'silent'}, text ${timed.nativeElement.textContent}`,
    );

    expect(lines).toEqual([
      'default: tick threw nothing, detectChanges threw nothing, text a|0',
      "exhaustive: tick threw NG0100, Previous value: 'a'",
      "exhaustive: detectChanges threw NG0100, Previous value: 'a'",
      "exhaustive with interval 20 and no tick: reported NG0100, Previous value: 'a', text a|0",
    ]);
  });
});
