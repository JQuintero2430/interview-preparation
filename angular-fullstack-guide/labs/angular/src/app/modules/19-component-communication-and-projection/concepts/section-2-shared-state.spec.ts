import { Component, Injectable, inject, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Subject } from 'rxjs';

// --- A root service holding a signal: writer and reader share one instance ---

@Injectable({ providedIn: 'root' })
class Counter {
  readonly #count = signal(0);
  readonly count = this.#count.asReadonly();

  increment(): void {
    this.#count.update((n) => n + 1);
  }
}

@Component({
  selector: 'lab-m19-s2-writer',
  template: `<button (click)="counter.increment()">add</button><b id="writer">{{ counter.count() }}</b>`,
})
class Writer {
  protected readonly counter = inject(Counter);
}

@Component({
  selector: 'lab-m19-s2-reader',
  template: `<i id="reader">{{ counter.count() }}</i>`,
})
class Reader {
  protected readonly counter = inject(Counter);
}

@Component({
  selector: 'lab-m19-s2-sync-host',
  imports: [Writer, Reader],
  template: `<lab-m19-s2-writer /><lab-m19-s2-reader />`,
})
class SyncHost {}

// --- A component-level provider: one instance per component ---

@Injectable()
class LocalState {
  readonly count = signal(0);
}

@Component({
  selector: 'lab-m19-s2-local',
  providers: [LocalState],
  template: `{{ state.count() }}`,
})
class Local {
  readonly state = inject(LocalState);
}

@Component({
  selector: 'lab-m19-s2-local-host',
  imports: [Local],
  template: `<lab-m19-s2-local /><lab-m19-s2-local />`,
})
class LocalHost {}

// --- inject(Parent) from a projected child resolves along the declaring template ---

@Component({
  selector: 'lab-m19-s2-wrap',
  template: `<ng-content />`,
})
class Wrap {}

@Component({
  selector: 'lab-m19-s2-inner',
  template: ``,
})
class Inner {
  readonly wrap = inject(Wrap, { optional: true });
}

@Component({
  selector: 'lab-m19-s2-wrap-host',
  imports: [Wrap, Inner],
  template: `<lab-m19-s2-wrap><lab-m19-s2-inner /></lab-m19-s2-wrap><lab-m19-s2-inner />`,
})
class WrapHost {}

@Component({
  selector: 'lab-m19-s2-deep',
  template: ``,
})
class Deep {
  readonly shell = inject(Shell, { optional: true });
  readonly frame = inject(Frame, { optional: true });
}

@Component({
  selector: 'lab-m19-s2-frame',
  template: `<ng-content />`,
})
class Frame {}

@Component({
  selector: 'lab-m19-s2-shell',
  imports: [Frame],
  template: `<lab-m19-s2-frame><ng-content /></lab-m19-s2-frame>`,
})
class Shell {}

@Component({
  selector: 'lab-m19-s2-shell-host',
  imports: [Shell, Deep],
  template: `<lab-m19-s2-shell><lab-m19-s2-deep /></lab-m19-s2-shell>`,
})
class ShellHost {}

// --- asReadonly: readers get a Signal without set ---

class Store {
  readonly #value = signal(0);
  readonly value = this.#value.asReadonly();

  bump(): void {
    this.#value.update((n) => n + 1);
  }
}

describe('Section 2: sharing state beyond the tree', () => {
  it('Section 2: two components read one root service signal', () => {
    const fixture = TestBed.createComponent(SyncHost);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('#writer')!.textContent).toBe('0');
    expect(root.querySelector('#reader')!.textContent).toBe('0');

    root.querySelector('button')!.click();
    fixture.detectChanges();
    expect(root.querySelector('#writer')!.textContent).toBe('1');
    expect(root.querySelector('#reader')!.textContent).toBe('1');
  });

  it('Section 2: a component-level provider gives each component its own instance', () => {
    const fixture = TestBed.createComponent(LocalHost);
    fixture.detectChanges();
    const [first, second] = fixture.debugElement.queryAll(By.directive(Local)).map((d) => d.componentInstance as Local);
    expect(first.state).not.toBe(second.state);

    first.state.count.set(4);
    expect(second.state.count()).toBe(0);
    expect(TestBed.inject(LocalState, null)).toBeNull();
  });

  it('Section 2: a projected child injects the wrapper component that declares it', () => {
    const fixture = TestBed.createComponent(WrapHost);
    fixture.detectChanges();
    const wrap = fixture.debugElement.query(By.directive(Wrap)).componentInstance as Wrap;
    const [inside, outside] = fixture.debugElement.queryAll(By.directive(Inner)).map((d) => d.componentInstance as Inner);
    expect(inside.wrap).toBe(wrap);
    expect(outside.wrap).toBeNull();
  });

  it('Section 2: a projected child resolves tokens along the template that declares it, not where it renders', () => {
    const fixture = TestBed.createComponent(ShellHost);
    fixture.detectChanges();
    const shell = fixture.debugElement.query(By.directive(Shell)).componentInstance as Shell;
    const deep = fixture.debugElement.query(By.directive(Deep)).componentInstance as Deep;
    expect(deep.shell).toBe(shell);
    expect(deep.frame).toBeNull();
  });

  it('Section 2: asReadonly exposes no set', () => {
    const store = new Store();
    expect('set' in store.value).toBe(false);

    const attempt = () =>
      // @ts-expect-error asReadonly returns a Signal, which has no set method
      store.value.set(1);
    expect(attempt).toThrow(TypeError);

    store.bump();
    expect(store.value()).toBe(1);
  });

  it('Section 2: a Subject has no current value and keeps delivering until unsubscribed', () => {
    const bus = new Subject<number>();
    const early: number[] = [];
    const late: number[] = [];
    const subscription = bus.subscribe((n) => early.push(n));

    bus.next(1);
    bus.subscribe((n) => late.push(n));
    bus.next(2);
    expect(early).toEqual([1, 2]);
    expect(late).toEqual([2]);

    subscription.unsubscribe();
    bus.next(3);
    expect(early).toEqual([1, 2]);
    expect(late).toEqual([2, 3]);
  });
});
