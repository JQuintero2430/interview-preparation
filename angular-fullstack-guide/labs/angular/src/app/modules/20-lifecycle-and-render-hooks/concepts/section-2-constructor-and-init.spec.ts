import {
  Component,
  Injector,
  OnChanges,
  OnInit,
  SimpleChanges,
  inject,
  input,
  signal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

const log: string[] = [];

function attempt(label: string, read: () => unknown): void {
  try {
    log.push(`${label} ok ${String(read())}`);
  } catch (error) {
    log.push(`${label} threw ${(error as Error).message}`);
  }
}

// --- What the constructor and ngOnInit can see ---

@Component({ selector: 'lab-m20-s2-probe', template: `probe` })
class Probe implements OnInit {
  readonly n = input(0);
  readonly r = input.required<string>();
  readonly fromField = inject(Injector);

  constructor() {
    attempt('ctor n', () => this.n());
    // The compiler already rejects `this.r()` here with NG8118 (Q17.28). The cast hides the read from
    // the compiler and not from the runtime, which is what this test needs to observe.
    const requiredRead = (this as unknown as { r: () => string }).r;
    attempt('ctor r', requiredRead);
    attempt('ctor field', () => typeof this.fromField.get === 'function');
    attempt('ctor inject', () => typeof inject(Injector).get === 'function');
  }

  ngOnInit(): void {
    attempt('init n', () => this.n());
    attempt('init r', () => this.r());
    attempt('init inject', () => inject(Injector));
  }
}

@Component({
  selector: 'lab-m20-s2-probe-host',
  imports: [Probe],
  template: `<lab-m20-s2-probe [n]="5" r="static" />`,
})
class ProbeHost {}

// --- ngOnChanges: first and later changes, and the unbound instance ---

let instances = 0;

@Component({ selector: 'lab-m20-s2-changes', template: `changes` })
class Changes implements OnChanges, OnInit {
  readonly n = input(0);
  readonly label = input('none');
  readonly id = ++instances;

  ngOnChanges(changes: SimpleChanges<Changes>): void {
    const describe = (key: 'n' | 'label') => {
      const c = changes[key];
      return c ? `${key} ${c.previousValue} -> ${c.currentValue} first=${c.firstChange}` : null;
    };
    log.push(
      `#${this.id} onChanges ${[describe('label'), describe('n')].filter(Boolean).join('; ')}`,
    );
  }

  ngOnInit(): void {
    log.push(`#${this.id} onInit`);
  }
}

@Component({
  selector: 'lab-m20-s2-changes-host',
  imports: [Changes],
  template: `
    <lab-m20-s2-changes [n]="n()" label="static" />
    <lab-m20-s2-changes />
  `,
})
class ChangesHost {
  readonly n = signal(1);
}

// --- The record is keyed by the property name, not the alias ---

let aliasKeys: string[] = [];

@Component({ selector: 'lab-m20-s2-aliased', template: `aliased` })
class Aliased implements OnChanges {
  readonly n = input(0, { alias: 'count' });

  ngOnChanges(changes: SimpleChanges<Aliased>): void {
    // @ts-expect-error 'nn' is not a member of Aliased, so the generic form rejects the misspelling
    void changes.nn;
    const current: number | undefined = changes.n?.currentValue;
    aliasKeys = [...Object.keys(changes), `n=${current}`];
  }
}

@Component({
  selector: 'lab-m20-s2-aliased-host',
  imports: [Aliased],
  template: `<lab-m20-s2-aliased [count]="3" />`,
})
class AliasedHost {}

describe('Section 2: constructor, ngOnInit and inputs', () => {
  beforeEach(() => {
    log.length = 0;
    instances = 0;
    aliasKeys = [];
  });

  it('Section 2: a signal input holds its default in the constructor and its bound value in ngOnInit', () => {
    TestBed.createComponent(ProbeHost).detectChanges();
    expect(log).toContain('ctor n ok 0');
    expect(log).toContain('init n ok 5');
  });

  it('Section 2: a required input read in the constructor throws NG0950', () => {
    TestBed.createComponent(ProbeHost).detectChanges();
    expect(log).toContain(
      'ctor r threw NG0950: Input "r" is required but no value is available yet. Find more at https://v22.angular.dev/errors/NG0950',
    );
    expect(log).toContain('init r ok static');
  });

  it('Section 2: inject works in the constructor and throws NG0203 in ngOnInit', () => {
    TestBed.createComponent(ProbeHost).detectChanges();
    expect(log).toContain('ctor field ok true');
    expect(log).toContain('ctor inject ok true');
    expect(log).toContain(
      'init inject threw NG0203: The `Injector` token injection failed. `inject()` function must be called from an injection context such as a constructor, a factory function, a field initializer, or a function used with `runInInjectionContext`. Find more at https://v22.angular.dev/errors/NG0203',
    );
  });

  it('Section 2: ngOnChanges reports first and later changes and is skipped for an unbound input', () => {
    const fixture = TestBed.createComponent(ChangesHost);
    fixture.detectChanges();
    expect(log).toEqual([
      '#1 onChanges label undefined -> static first=true; n undefined -> 1 first=true',
      '#1 onInit',
      '#2 onInit',
    ]);

    log.length = 0;
    fixture.componentInstance.n.set(2);
    fixture.detectChanges();
    expect(log).toEqual(['#1 onChanges n 1 -> 2 first=false']);
  });

  it('Section 2: the SimpleChanges record is keyed by the property name', () => {
    TestBed.createComponent(AliasedHost).detectChanges();
    expect(aliasKeys).toEqual(['n', 'n=3']);
  });
});
