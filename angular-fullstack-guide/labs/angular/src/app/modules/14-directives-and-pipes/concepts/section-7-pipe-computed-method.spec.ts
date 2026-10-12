import { Component, computed, Pipe, PipeTransform, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

// Counters live outside the classes so the tests can read them; each test resets them.
const calls = { method: 0, pure: 0, impure: 0, computed: 0, ownMethod: 0, ownImpure: 0 };

function reset(): void {
  calls.method = calls.pure = calls.impure = calls.computed = 0;
  calls.ownMethod = calls.ownImpure = 0;
}

// --- The same derived value written four ways ---

@Pipe({ name: 'labS7Sum' })
class SumPipe implements PipeTransform {
  transform(items: readonly number[]): number {
    calls.pure++;
    return items.reduce((a, b) => a + b, 0);
  }
}

@Pipe({ name: 'labS7SumLive', pure: false })
class SumLivePipe implements PipeTransform {
  transform(items: readonly number[]): number {
    calls.impure++;
    return items.reduce((a, b) => a + b, 0);
  }
}

@Component({
  selector: 'lab-s7-sum-host',
  imports: [SumPipe, SumLivePipe],
  template: `
    <p id="method">{{ sumByMethod() }}</p>
    <p id="pure">{{ list() | labS7Sum }}</p>
    <p id="impure">{{ list() | labS7SumLive }}</p>
    <p id="computed">{{ sum() }}</p>
    <p id="tick">{{ tick() }}</p>
  `,
})
class SumHost {
  readonly list = signal<number[]>([1, 2, 3]);
  readonly tick = signal(0);
  readonly sum = computed(() => {
    calls.computed++;
    return this.list().reduce((a, b) => a + b, 0);
  });

  protected sumByMethod(): number {
    calls.method++;
    return this.list().reduce((a, b) => a + b, 0);
  }
}

// --- An impure pipe and a method next to a sibling ---

@Pipe({ name: 'labS7Own', pure: false })
class OwnPipe implements PipeTransform {
  transform(value: number): number {
    calls.ownImpure++;
    return value;
  }
}

@Component({
  selector: 'lab-s7-own',
  imports: [OwnPipe],
  template: `
    <button (click)="clicks.update((n) => n + 1)">click</button>
    <p>{{ version() | labS7Own }}|{{ describe() }}</p>
  `,
})
class OwnComponent {
  readonly version = signal(0);
  protected readonly clicks = signal(0);

  protected describe(): string {
    calls.ownMethod++;
    return 'own';
  }
}

@Component({
  selector: 'lab-s7-sibling',
  template: `{{ value() }}`,
})
class SiblingComponent {
  readonly value = signal(0);
}

@Component({
  selector: 'lab-s7-pair-host',
  imports: [OwnComponent, SiblingComponent],
  template: `<lab-s7-own /><lab-s7-sibling />`,
})
class PairHost {}

function mount<T>(type: new () => T) {
  const fixture = TestBed.createComponent(type);
  fixture.detectChanges();
  return fixture;
}

function text(root: HTMLElement, selector: string): string {
  return root.querySelector(selector)?.textContent ?? '';
}

function snapshot(): number[] {
  return [calls.method, calls.pure, calls.impure, calls.computed];
}

describe('Section 7: pipe, computed or method call', () => {
  beforeEach(reset);

  it('Section 7: after an unrelated signal change a method runs again, a pure pipe and a computed do not', () => {
    const fixture = mount(SumHost);
    expect(snapshot()).toEqual([1, 1, 1, 1]);

    fixture.componentInstance.tick.set(1);
    fixture.detectChanges();
    // Method and impure pipe ran again; pure pipe and computed kept their result.
    expect(snapshot()).toEqual([2, 1, 2, 1]);
  });

  it('Section 7: after an in-place push the pure pipe and the computed keep the old result', () => {
    const fixture = mount(SumHost);
    const host = fixture.componentInstance;

    host.list().push(4);
    host.tick.set(1);
    fixture.detectChanges();

    expect(text(fixture.nativeElement, '#pure')).toBe('6');
    expect(text(fixture.nativeElement, '#computed')).toBe('6');
    expect(text(fixture.nativeElement, '#method')).toBe('10');
    expect(text(fixture.nativeElement, '#impure')).toBe('10');
  });

  it('Section 7: replacing the array recomputes the pure pipe and the computed once', () => {
    const fixture = mount(SumHost);
    const host = fixture.componentInstance;

    host.list.update((l) => [...l, 4]);
    fixture.detectChanges();

    expect(snapshot()).toEqual([2, 2, 2, 2]);
    expect(text(fixture.nativeElement, '#pure')).toBe('10');
    expect(text(fixture.nativeElement, '#computed')).toBe('10');
  });

  it('Section 7: a computed re-runs when the signal value is replaced inside the same view', () => {
    const fixture = mount(SumHost);
    const host = fixture.componentInstance;

    host.list.set([10, 20]);
    fixture.detectChanges();

    expect(calls.computed).toBe(2);
    expect(text(fixture.nativeElement, '#computed')).toBe('30');
  });

  it('Section 7: under OnPush a sibling signal change checks neither an impure pipe nor a method, an own change checks both', () => {
    const fixture = mount(PairHost);
    expect([calls.ownImpure, calls.ownMethod]).toEqual([1, 1]);

    fixture.debugElement.query(By.directive(SiblingComponent)).componentInstance.value.set(1);
    fixture.detectChanges();
    expect([calls.ownImpure, calls.ownMethod]).toEqual([1, 1]);

    fixture.debugElement.query(By.css('button')).nativeElement.click();
    fixture.detectChanges();
    expect([calls.ownImpure, calls.ownMethod]).toEqual([2, 2]);

    fixture.debugElement.query(By.directive(OwnComponent)).componentInstance.version.set(1);
    fixture.detectChanges();
    expect([calls.ownImpure, calls.ownMethod]).toEqual([3, 3]);
  });
});
