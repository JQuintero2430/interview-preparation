import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DoCheck,
  KeyValueDiffers,
  OnChanges,
  OnInit,
  SimpleChanges,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

const log: string[] = [];

// --- A component whose derived state, effect and template all read one signal input ---

@Component({ selector: 'lab-m20-s3-reactive', template: `{{ doubled() }}{{ mark() }}` })
class Reactive implements OnChanges, OnInit, DoCheck {
  readonly n = input(1);
  readonly doubled = computed(() => this.n() * 2);

  constructor() {
    effect(() => {
      log.push(`effect n=${this.n()}`);
    });
  }

  ngOnChanges(changes: SimpleChanges<Reactive>): void {
    log.push(`onChanges ${changes.n?.previousValue} -> ${changes.n?.currentValue}`);
  }
  ngOnInit(): void {
    log.push('onInit');
  }
  ngDoCheck(): void {
    log.push('doCheck');
  }
  mark(): string {
    log.push('template');
    return '';
  }
}

@Component({
  selector: 'lab-m20-s3-reactive-host',
  imports: [Reactive],
  template: `<lab-m20-s3-reactive [n]="n()" />`,
})
class ReactiveHost {
  readonly n = signal(1);
}

// --- ngDoCheck diffing an object that its host mutates in place ---

@Component({ selector: 'lab-m20-s3-diff', template: `{{ o()['b'] }}` })
class Diff implements DoCheck {
  readonly o = input.required<Record<string, number>>();
  private readonly differ = inject(KeyValueDiffers).find({}).create<string, number>();

  ngDoCheck(): void {
    log.push('doCheck');
    if (this.differ.diff(this.o())) {
      log.push('diff saw a change');
    }
  }
}

@Component({
  selector: 'lab-m20-s3-eager-host',
  imports: [Diff],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `<lab-m20-s3-diff [o]="o" />`,
})
class EagerHost {
  o: Record<string, number> = { a: 1, b: 1 };
}

@Component({
  selector: 'lab-m20-s3-plain-host',
  imports: [Diff],
  template: `<lab-m20-s3-diff [o]="o" />`,
})
class PlainHost {
  o: Record<string, number> = { a: 1, b: 1 };
}

@Component({
  selector: 'lab-m20-s3-signal-host',
  imports: [Diff],
  template: `<lab-m20-s3-diff [o]="o()" />{{ tick() }}`,
})
class SignalHost {
  readonly o = signal<Record<string, number>>({ a: 1, b: 1 });
  readonly tick = signal(0);
}

// --- A signal read in ngOnInit is not a dependency of anything ---

const shared = signal(0);

@Component({ selector: 'lab-m20-s3-reader', template: `reader` })
class Reader implements OnInit {
  ngOnInit(): void {
    log.push(`init read ${shared()}`);
  }
}

@Component({
  selector: 'lab-m20-s3-hook-host',
  imports: [Reader],
  template: `<lab-m20-s3-reader />{{ mark() }}`,
})
class HookHost {
  mark(): string {
    log.push('host template');
    return '';
  }
}

@Component({
  selector: 'lab-m20-s3-template-host',
  template: `{{ shared() }}{{ mark() }}`,
})
class TemplateHost {
  readonly shared = shared;
  mark(): string {
    log.push('host template');
    return '';
  }
}

// --- A plain field and a signal written after the view was checked, in two OnPush components ---

@Component({ selector: 'lab-m20-s3-stale-plain', template: `{{ value }}` })
class StalePlain implements AfterViewInit {
  value = 'a';

  ngAfterViewInit(): void {
    this.value = 'b';
  }
}

@Component({ selector: 'lab-m20-s3-stale-signal', template: `{{ value() }}` })
class StaleSignal implements AfterViewInit {
  readonly value = signal('a');

  ngAfterViewInit(): void {
    this.value.set('b');
  }
}

describe('Section 3: which hooks still matter with signals', () => {
  beforeEach(() => {
    log.length = 0;
    shared.set(0);
  });

  it('Section 3: ngOnChanges still runs for a signal input and a computed derives the same value', async () => {
    const fixture = TestBed.createComponent(ReactiveHost);
    fixture.detectChanges();
    expect(log).toContain('onChanges undefined -> 1');
    expect(fixture.nativeElement.textContent).toContain('2');

    log.length = 0;
    fixture.componentInstance.n.set(20);
    fixture.detectChanges();
    expect(log).toContain('onChanges 1 -> 20');
    expect(fixture.nativeElement.textContent).toContain('40');
  });

  it('Section 3: an effect over an input runs after ngDoCheck and again on each change', () => {
    const fixture = TestBed.createComponent(ReactiveHost);
    fixture.detectChanges();
    expect(log.filter((line) => line === 'effect n=1').length).toBe(1);
    expect(log.indexOf('onInit')).toBeLessThan(log.indexOf('doCheck'));
    expect(log.indexOf('doCheck')).toBeLessThan(log.indexOf('effect n=1'));

    log.length = 0;
    fixture.componentInstance.n.set(2);
    fixture.detectChanges();
    expect(log.filter((line) => line.startsWith('effect')).length).toBe(1);
    expect(log.indexOf('doCheck')).toBeLessThan(log.indexOf('effect n=2'));
  });

  it('Section 3: a bound-input update runs onChanges, doCheck, the effect and then the template', () => {
    const fixture = TestBed.createComponent(ReactiveHost);
    fixture.detectChanges();
    expect(log).toEqual([
      'onChanges undefined -> 1',
      'onInit',
      'doCheck',
      'effect n=1',
      'template',
    ]);

    log.length = 0;
    fixture.componentInstance.n.set(2);
    fixture.detectChanges();
    expect(log).toEqual(['onChanges 1 -> 2', 'doCheck', 'effect n=2', 'template']);
  });

  it('Section 3: a plain mutation with no signal write does not run ngDoCheck', () => {
    for (const Host of [EagerHost, PlainHost]) {
      log.length = 0;
      const fixture = TestBed.createComponent(Host);
      fixture.detectChanges();
      expect(log).toEqual(['doCheck', 'diff saw a change']);

      log.length = 0;
      fixture.componentInstance.o['b'] = 2;
      fixture.detectChanges();
      expect(log).toEqual([]);
    }
  });

  it('Section 3: replacing the object or writing a signal reaches the child', () => {
    const fixture = TestBed.createComponent(SignalHost);
    fixture.detectChanges();

    log.length = 0;
    fixture.componentInstance.o.set({ a: 1, b: 2 });
    fixture.detectChanges();
    expect(log).toEqual(['doCheck', 'diff saw a change']);
    expect(fixture.nativeElement.textContent).toContain('2');

    // An in-place edit nobody announces is seen only when something else refreshes the declaring view.
    log.length = 0;
    fixture.componentInstance.o()['b'] = 5;
    fixture.detectChanges();
    expect(log).toEqual([]);
    fixture.componentInstance.tick.set(1);
    fixture.detectChanges();
    expect(log).toEqual(['doCheck', 'diff saw a change']);
  });

  it('Section 3: a signal read in ngOnInit is not tracked', () => {
    const hooked = TestBed.createComponent(HookHost);
    hooked.detectChanges();
    expect(log).toEqual(['init read 0', 'host template']);
    log.length = 0;
    shared.set(1);
    hooked.detectChanges();
    expect(log).toEqual([]);

    // Control: the same signal read by the host's template is tracked.
    log.length = 0;
    shared.set(0);
    const tracked = TestBed.createComponent(TemplateHost);
    tracked.detectChanges();
    log.length = 0;
    shared.set(1);
    tracked.detectChanges();
    expect(log).toEqual(['host template']);
  });

  it('Section 3: a plain field written after the view was checked stays stale in an OnPush component and a signal updates it', () => {
    const plain = TestBed.createComponent(StalePlain);
    plain.detectChanges();
    expect(plain.componentInstance.value).toBe('b');
    expect(plain.nativeElement.textContent).toBe('a');

    const signalled = TestBed.createComponent(StaleSignal);
    signalled.detectChanges();
    expect(signalled.nativeElement.textContent).toBe('b');
  });
});
