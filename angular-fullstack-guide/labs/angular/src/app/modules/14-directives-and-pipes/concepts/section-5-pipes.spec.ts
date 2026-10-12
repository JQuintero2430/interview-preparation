import {
  Component,
  inject,
  InjectionToken,
  LOCALE_ID,
  Pipe,
  PipeTransform,
  signal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

// Counters live outside the classes so the tests can read them; each test resets them.
const calls = { join: 0, impure: 0, add: 0, opt: 0, where: 0, created: 0 };

function reset(): void {
  calls.join = calls.impure = calls.add = calls.opt = calls.where = calls.created = 0;
}

// --- A pure pipe, an impure pipe and per-usage instances ---

@Pipe({ name: 'labS5Join' })
class JoinPipe implements PipeTransform {
  constructor() {
    calls.created++;
  }

  transform(items: readonly number[]): string {
    calls.join++;
    return items.join(',');
  }
}

@Pipe({ name: 'labS5JoinLive', pure: false })
class JoinLivePipe implements PipeTransform {
  transform(items: readonly number[]): string {
    calls.impure++;
    return items.join(',');
  }
}

@Component({
  selector: 'lab-s5-pure-host',
  imports: [JoinPipe],
  template: `<p id="list">{{ list() | labS5Join }}</p><p id="tick">{{ tick() }}</p>`,
})
class PureHost {
  readonly list = signal<number[]>([1, 2, 3]);
  readonly tick = signal(0);
}

@Component({
  selector: 'lab-s5-five-host',
  imports: [JoinPipe],
  template: `
    <p>{{ list() | labS5Join }}</p>
    <p>{{ list() | labS5Join }}</p>
    <p>{{ list() | labS5Join }}</p>
    <p>{{ list() | labS5Join }}</p>
    <p>{{ list() | labS5Join }}</p>
  `,
})
class FiveHost {
  readonly list = signal<number[]>([1, 2, 3]);
}

@Component({
  selector: 'lab-s5-impure-host',
  imports: [JoinLivePipe],
  template: `<p id="list">{{ list() | labS5JoinLive }}</p><p id="tick">{{ tick() }}</p>`,
})
class ImpureHost {
  readonly list = signal<number[]>([1, 2, 3]);
  readonly tick = signal(0);
}

// --- Literal arguments ---

@Pipe({ name: 'labS5Add' })
class AddPipe implements PipeTransform {
  transform(n: number, extra: readonly number[]): number {
    calls.add++;
    return n + extra.length;
  }
}

@Pipe({ name: 'labS5Opt' })
class OptPipe implements PipeTransform {
  transform(options: { a: number }, n: number): number {
    calls.opt++;
    return options.a + n;
  }
}

@Component({
  selector: 'lab-s5-literal-host',
  imports: [AddPipe, OptPipe],
  template: `
    <p id="a">{{ n() | labS5Add: [1, 2] }}</p>
    <p id="o">{{ { a: 1 } | labS5Opt: n() }}</p>
    <p id="tick">{{ tick() }}</p>
  `,
})
class LiteralHost {
  readonly n = signal(1);
  readonly tick = signal(0);
}

// --- Injection in a pipe ---

const ROOT = new InjectionToken<string>('lab-s5-root', { factory: () => 'R' });
const COMP = new InjectionToken<string>('lab-s5-comp');
const VIEW = new InjectionToken<string>('lab-s5-view');

@Pipe({ name: 'labS5Who' })
class WhoPipe implements PipeTransform {
  private readonly root = inject(ROOT);
  private readonly locale = inject(LOCALE_ID);
  private readonly comp = inject(COMP);
  private readonly view = inject(VIEW);

  transform(value: string): string {
    return `${value}:${this.root}:${this.locale}:cp=${this.comp}:vp=${this.view}`;
  }
}

@Component({
  selector: 'lab-s5-who-host',
  imports: [WhoPipe],
  providers: [{ provide: COMP, useValue: 'C' }],
  viewProviders: [{ provide: VIEW, useValue: 'V' }],
  template: `{{ 'x' | labS5Who }}`,
})
class WhoHost {}

// --- Precedence ---

@Pipe({ name: 'labS5Upper' })
class UpperPipe implements PipeTransform {
  transform(value: string): string {
    return value.toUpperCase();
  }
}

@Component({
  selector: 'lab-s5-precedence-host',
  imports: [UpperPipe],
  template: `[{{ yes() ? 'yes' : 'no' | labS5Upper }}][{{ (yes() ? 'yes' : 'no') | labS5Upper }}][{{ 'a' + 'b' | labS5Upper }}]`,
})
class PrecedenceHost {
  readonly yes = signal(true);
}

// --- An arrow function passed to a pure pipe ---

@Pipe({ name: 'labS5Where' })
class WherePipe implements PipeTransform {
  transform(items: readonly number[], predicate: (item: number) => boolean): number[] {
    calls.where++;
    return items.filter(predicate);
  }
}

@Component({
  selector: 'lab-s5-arrow-host',
  imports: [WherePipe],
  template: `{{ (items() | labS5Where: (i => i > min())).length }}`,
})
class ArrowHost {
  readonly items = signal([1, 2, 3]);
  readonly min = signal(0);
}

function mount<T>(type: new () => T) {
  const fixture = TestBed.createComponent(type);
  fixture.detectChanges();
  return fixture;
}

function text(root: HTMLElement, selector: string): string {
  return root.querySelector(selector)?.textContent ?? '';
}

describe('Section 5: pipes', () => {
  beforeEach(reset);

  it('Section 5: a pure pipe runs again only when an argument changes by reference', () => {
    const fixture = mount(PureHost);
    const host = fixture.componentInstance;
    expect(calls.join).toBe(1);

    host.tick.set(1);
    fixture.detectChanges();
    expect(calls.join).toBe(1);

    // Same array, mutated in place: the pipe cannot see it.
    host.list().push(4);
    host.tick.set(2);
    fixture.detectChanges();
    expect(calls.join).toBe(1);
    expect(text(fixture.nativeElement, '#list')).toBe('1,2,3');

    host.list.update((l) => [...l]);
    fixture.detectChanges();
    expect(calls.join).toBe(2);
    expect(text(fixture.nativeElement, '#list')).toBe('1,2,3,4');
  });

  it('Section 5: every usage of a pipe gets its own instance', () => {
    const fixture = mount(FiveHost);
    expect(calls.created).toBe(5);
    expect(calls.join).toBe(5);
    expect(fixture.nativeElement.querySelectorAll('p').length).toBe(5);
  });

  it('Section 5: an impure pipe runs on every check of its view', () => {
    const fixture = mount(ImpureHost);
    const host = fixture.componentInstance;
    expect(calls.impure).toBe(1);

    host.tick.set(1);
    fixture.detectChanges();
    expect(calls.impure).toBe(2);

    // The in-place push is visible to the impure pipe.
    host.list().push(4);
    host.tick.set(2);
    fixture.detectChanges();
    expect(calls.impure).toBe(3);
    expect(text(fixture.nativeElement, '#list')).toBe('1,2,3,4');
  });

  it('Section 5: a literal argument does not make a pure pipe run again', () => {
    const fixture = mount(LiteralHost);
    const host = fixture.componentInstance;
    expect([calls.add, calls.opt]).toEqual([1, 1]);

    host.tick.set(1);
    fixture.detectChanges();
    expect([calls.add, calls.opt]).toEqual([1, 1]);

    host.n.set(5);
    fixture.detectChanges();
    expect([calls.add, calls.opt]).toEqual([2, 2]);
    expect(text(fixture.nativeElement, '#a')).toBe('7');
    expect(text(fixture.nativeElement, '#o')).toBe('6');
  });

  it('Section 5: a pipe can inject root, component and view providers', () => {
    const fixture = mount(WhoHost);
    expect(fixture.nativeElement.textContent).toBe('x:R:en-US:cp=C:vp=V');
  });

  it('Section 5: the pipe operator binds looser than plus and tighter than the conditional', () => {
    const fixture = mount(PrecedenceHost);
    expect(fixture.nativeElement.textContent).toBe('[yes][YES][AB]');
  });

  it('Section 5: an arrow function passed to a pure pipe is not recreated when the signal it reads changes', () => {
    const fixture = mount(ArrowHost);
    const host = fixture.componentInstance;
    expect(fixture.nativeElement.textContent).toBe('3');
    expect(calls.where).toBe(1);

    host.min.set(1);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('3');
    expect(calls.where).toBe(1);
  });
});
