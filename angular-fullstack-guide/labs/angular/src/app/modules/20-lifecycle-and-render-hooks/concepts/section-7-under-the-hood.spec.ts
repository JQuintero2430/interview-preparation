import {
  AfterContentInit,
  AfterViewChecked,
  AfterViewInit,
  ApplicationRef,
  Component,
  DoCheck,
  Injector,
  OnInit,
  afterEveryRender,
  afterNextRender,
  effect,
  signal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

const log: string[] = [];

// --- Declaring view: Parent > Child > Leaf, every hook that Section 7 reads is a ngDoCheck ---

@Component({ selector: 'lab-m20-s7-leaf', template: `leaf` })
class Leaf implements DoCheck {
  ngDoCheck(): void {
    log.push('leaf.doCheck');
  }
}

@Component({ selector: 'lab-m20-s7-child', imports: [Leaf], template: `<lab-m20-s7-leaf />` })
class Child implements DoCheck {
  ngDoCheck(): void {
    log.push('child.doCheck');
  }
}

@Component({
  selector: 'lab-m20-s7-parent',
  imports: [Child],
  template: `<lab-m20-s7-child />{{ w() }}`,
})
class Parent implements DoCheck {
  readonly w = signal(0);
  ngDoCheck(): void {
    log.push('parent.doCheck');
  }
}

@Component({ selector: 'lab-m20-s7-root', imports: [Parent], template: `<lab-m20-s7-parent />` })
class Root {}

// --- Registration order: A holds B in its content, C is A's sibling ---

@Component({ selector: 'lab-m20-s7-a', template: `<ng-content />` })
class A implements OnInit, AfterContentInit {
  ngOnInit(): void {
    log.push('a.onInit');
  }
  ngAfterContentInit(): void {
    log.push('a.afterContentInit');
  }
}

@Component({ selector: 'lab-m20-s7-b', template: `b` })
class B implements OnInit, AfterContentInit {
  ngOnInit(): void {
    log.push('b.onInit');
  }
  ngAfterContentInit(): void {
    log.push('b.afterContentInit');
  }
}

@Component({ selector: 'lab-m20-s7-c', template: `c` })
class C implements OnInit, AfterContentInit {
  ngOnInit(): void {
    log.push('c.onInit');
  }
  ngAfterContentInit(): void {
    log.push('c.afterContentInit');
  }
}

@Component({
  selector: 'lab-m20-s7-order-host',
  imports: [A, B, C],
  template: `<lab-m20-s7-a><lab-m20-s7-b /></lab-m20-s7-a><lab-m20-s7-c />`,
})
class OrderHost {}

// --- Effect position: Fx has an effect and an inner component with its own onInit ---

@Component({ selector: 'lab-m20-s7-inner', template: `inner` })
class Inner implements OnInit {
  ngOnInit(): void {
    log.push('inner.onInit');
  }
}

@Component({ selector: 'lab-m20-s7-fx', imports: [Inner], template: `<lab-m20-s7-inner />` })
class Fx implements DoCheck, AfterContentInit {
  readonly n = signal(1);
  constructor() {
    effect(() => log.push(`fx.effect n=${this.n()}`));
  }
  ngDoCheck(): void {
    log.push('fx.doCheck');
  }
  ngAfterContentInit(): void {
    log.push('fx.afterContentInit');
  }
}

@Component({ selector: 'lab-m20-s7-fx-host', imports: [Fx], template: `<lab-m20-s7-fx />` })
class FxHost {}

// --- Render queue: a hook registered in a constructor, and two components with render hooks ---

@Component({ selector: 'lab-m20-s7-late', template: `late` })
class Late implements AfterViewInit, AfterViewChecked {
  constructor() {
    log.push('late.ctor');
    afterNextRender(() => log.push('late.afterNextRender'));
    afterEveryRender(() => log.push('late.afterEveryRender'));
  }
  ngAfterViewInit(): void {
    log.push('late.afterViewInit');
  }
  ngAfterViewChecked(): void {
    log.push('late.afterViewChecked');
  }
}

@Component({ selector: 'lab-m20-s7-late-host', imports: [Late], template: `<lab-m20-s7-late />` })
class LateHost {}

@Component({
  selector: 'lab-m20-s7-queue-a',
  template: `{{ n() }}`,
})
class QueueA {
  readonly n = signal(0);
  constructor() {
    afterEveryRender(() => log.push('queue-a.render'));
  }
}

@Component({ selector: 'lab-m20-s7-queue-b', template: `b` })
class QueueB {
  constructor() {
    afterEveryRender(() => log.push('queue-b.render'));
  }
}

@Component({
  selector: 'lab-m20-s7-queue-host',
  imports: [QueueA, QueueB],
  template: `<lab-m20-s7-queue-a /><lab-m20-s7-queue-b />`,
})
class QueueHost {}

describe('Section 7: under the hood', () => {
  beforeEach(() => {
    log.length = 0;
  });

  it("Section 7: hooks of a child are called from the declaring view's pass even when the child's own view is not refreshed", () => {
    const fixture = TestBed.createComponent(Root);
    fixture.detectChanges();
    const parent: Parent = fixture.debugElement.query(By.directive(Parent)).componentInstance;
    log.length = 0;

    parent.w.set(1);
    fixture.detectChanges();

    expect(log).toEqual(['child.doCheck']);
  });

  it("Section 7: the content and view hooks are registered after the node's subtree", () => {
    TestBed.createComponent(OrderHost).detectChanges();

    expect(log.filter((line) => line.endsWith('.onInit'))).toEqual([
      'a.onInit',
      'b.onInit',
      'c.onInit',
    ]);
    expect(log.filter((line) => line.endsWith('.afterContentInit'))).toEqual([
      'b.afterContentInit',
      'a.afterContentInit',
      'c.afterContentInit',
    ]);
  });

  it('Section 7: an effect runs between ngDoCheck and ngAfterContentInit of its view', () => {
    TestBed.createComponent(FxHost).detectChanges();

    expect(log).toEqual(['fx.doCheck', 'fx.effect n=1', 'fx.afterContentInit', 'inner.onInit']);
  });

  it('Section 7: a render hook registered in a constructor first runs after the first render', () => {
    const fixture = TestBed.createComponent(LateHost);
    expect(log).toEqual(['late.ctor']);

    fixture.detectChanges();

    expect(log).toEqual([
      'late.ctor',
      'late.afterViewInit',
      'late.afterViewChecked',
      'late.afterNextRender',
      'late.afterEveryRender',
    ]);
  });

  it('Section 7: an idle tick runs no render hook and a pass that refreshes one view runs the whole queue', () => {
    const fixture = TestBed.createComponent(QueueHost);
    fixture.detectChanges();
    const a: QueueA = fixture.debugElement.query(By.directive(QueueA)).componentInstance;
    log.length = 0;

    TestBed.inject(ApplicationRef).tick();
    expect(log).toEqual([]);

    a.n.set(1);
    fixture.detectChanges();
    expect(log).toEqual(['queue-a.render', 'queue-b.render']);
  });

  it('Section 7: a render hook registered outside a view makes the next tick run the whole queue', () => {
    const fixture = TestBed.createComponent(QueueHost);
    fixture.detectChanges();
    const appRef = TestBed.inject(ApplicationRef);
    log.length = 0;

    afterNextRender(() => log.push('outside.next'), { injector: TestBed.inject(Injector) });
    appRef.tick();

    expect(log).toEqual(['queue-a.render', 'queue-b.render', 'outside.next']);
  });
});
