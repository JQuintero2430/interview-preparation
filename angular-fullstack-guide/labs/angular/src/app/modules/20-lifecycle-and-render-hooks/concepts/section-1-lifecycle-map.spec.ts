import {
  AfterContentChecked,
  AfterContentInit,
  AfterViewChecked,
  AfterViewInit,
  Component,
  Directive,
  DoCheck,
  OnChanges,
  OnDestroy,
  OnInit,
  afterEveryRender,
  afterNextRender,
  input,
  signal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

// --- A recorder and a base class that logs every hook under the component's name (the bare @Directive() lets the compiler accept hooks on an abstract base) ---

const log: string[] = [];

@Directive()
abstract class Recorded
  implements
    OnChanges,
    OnInit,
    DoCheck,
    AfterContentInit,
    AfterContentChecked,
    AfterViewInit,
    AfterViewChecked,
    OnDestroy
{
  protected abstract readonly name: string;

  ngOnChanges(): void {
    log.push(`${this.name}.onChanges`);
  }
  ngOnInit(): void {
    log.push(`${this.name}.onInit`);
  }
  ngDoCheck(): void {
    log.push(`${this.name}.doCheck`);
  }
  ngAfterContentInit(): void {
    log.push(`${this.name}.afterContentInit`);
  }
  ngAfterContentChecked(): void {
    log.push(`${this.name}.afterContentChecked`);
  }
  ngAfterViewInit(): void {
    log.push(`${this.name}.afterViewInit`);
  }
  ngAfterViewChecked(): void {
    log.push(`${this.name}.afterViewChecked`);
  }
  ngOnDestroy(): void {
    log.push(`${this.name}.onDestroy`);
  }
}

// --- The tree: Root > Parent > Child (with a projected Sib) > Leaf. All components are OnPush (the v22 default). ---

@Component({ selector: 'lab-m20-s1-leaf', template: `leaf` })
class Leaf extends Recorded {
  protected readonly name = 'leaf';
  readonly v = input(0);
  constructor() {
    super();
    log.push('leaf.ctor');
  }
}

@Component({ selector: 'lab-m20-s1-sib', template: `sib` })
class Sib extends Recorded {
  protected readonly name = 'sib';
  constructor() {
    super();
    log.push('sib.ctor');
  }
}

@Component({
  selector: 'lab-m20-s1-child',
  imports: [Leaf],
  template: `<ng-content /><lab-m20-s1-leaf [v]="v()" />`,
})
class Child extends Recorded {
  protected readonly name = 'child';
  readonly v = input(0);
  constructor() {
    super();
    log.push('child.ctor');
    afterNextRender(() => log.push('child.afterNextRender'));
    afterEveryRender(() => log.push('child.afterEveryRender'));
  }
}

@Component({
  selector: 'lab-m20-s1-parent',
  imports: [Child, Sib],
  template: `<lab-m20-s1-child [v]="v()"><lab-m20-s1-sib /></lab-m20-s1-child>{{ w() }}`,
})
class Parent extends Recorded {
  protected readonly name = 'parent';
  readonly v = signal(1);
  readonly w = signal(0);
  constructor() {
    super();
    log.push('parent.ctor');
  }
}

// The component under test sits inside this host: a root fixture component's own hooks are not re-run
// by a second detectChanges, so the host keeps every hook of Parent observable.
@Component({
  selector: 'lab-m20-s1-root',
  imports: [Parent],
  template: `@if (on()) {
      <lab-m20-s1-parent />
    }
    {{ r() }}`,
})
class Root {
  readonly on = signal(true);
  readonly r = signal(0);
}

// A component with one bound input and one static attribute, to read the order of ngOnChanges and ngOnInit.
@Component({ selector: 'lab-m20-s1-pair', template: `pair` })
class Pair extends Recorded {
  protected readonly name = 'pair';
  readonly n = input(0);
}

@Component({
  selector: 'lab-m20-s1-pair-host',
  imports: [Pair],
  template: `<lab-m20-s1-pair [n]="5" />`,
})
class PairHost {}

function renderTree() {
  const fixture = TestBed.createComponent(Root);
  fixture.detectChanges();
  const parent: Parent = fixture.debugElement.query(By.directive(Parent)).componentInstance;
  return { fixture, parent, root: fixture.componentInstance };
}

const FIRST_RENDER = [
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
];

describe('Section 1: the lifecycle map', () => {
  beforeEach(() => {
    log.length = 0;
  });

  it('Section 1: constructors run before any hook and the hooks run in the documented groups', () => {
    renderTree();
    expect(log.slice(0, 4)).toEqual(['parent.ctor', 'child.ctor', 'sib.ctor', 'leaf.ctor']);
    expect(log.slice(4).every((line) => !line.endsWith('.ctor'))).toBe(true);
    expect(log).toEqual(FIRST_RENDER);
  });

  it('Section 1: the pre-order hooks go down the tree and the after hooks come back up', () => {
    renderTree();
    const at = (line: string) => log.indexOf(line);
    for (const hook of ['onInit', 'doCheck']) {
      expect(at(`parent.${hook}`)).toBeLessThan(at(`child.${hook}`));
      expect(at(`child.${hook}`)).toBeLessThan(at(`leaf.${hook}`));
    }
    // The projected Sib is a node of the parent's template, after Child: its check hooks follow Child's.
    expect(at('child.doCheck')).toBeLessThan(at('sib.onInit'));
    for (const hook of ['afterViewInit', 'afterViewChecked']) {
      expect(at(`leaf.${hook}`)).toBeLessThan(at(`child.${hook}`));
      expect(at(`child.${hook}`)).toBeLessThan(at(`parent.${hook}`));
    }
    expect(at('sib.afterViewInit')).toBeLessThan(at('child.afterViewInit'));
    expect(at('sib.afterContentInit')).toBeLessThan(at('child.afterContentInit'));
    // The render hooks come after every view hook of every component.
    expect(at('parent.afterViewChecked')).toBeLessThan(at('child.afterNextRender'));
  });

  it('Section 1: ngOnChanges runs before ngOnInit', () => {
    renderTree();
    expect(log.indexOf('child.onChanges')).toBeLessThan(log.indexOf('child.onInit'));
    expect(log.indexOf('leaf.onChanges')).toBeLessThan(log.indexOf('leaf.onInit'));
    expect(log).not.toContain('parent.onChanges');

    log.length = 0;
    const host = TestBed.createComponent(PairHost);
    host.detectChanges();
    expect(log.slice(0, 2)).toEqual(['pair.onChanges', 'pair.onInit']);
  });

  it("Section 1: a signal read only by the parent's template runs the child's check hooks and not the parent's own", () => {
    const { fixture, parent } = renderTree();
    log.length = 0;
    parent.w.set(1);
    fixture.detectChanges();
    expect(log).toEqual([
      'child.doCheck',
      'sib.doCheck',
      'sib.afterContentChecked',
      'child.afterContentChecked',
      'sib.afterViewChecked',
      'child.afterViewChecked',
      'child.afterEveryRender',
    ]);
    expect(fixture.nativeElement.textContent).toContain('1');
  });

  it("Section 1: a signal read only by the root template runs the parent's check hooks and not its children's", () => {
    const { fixture, root } = renderTree();
    log.length = 0;
    root.r.set(1);
    fixture.detectChanges();
    expect(log).toEqual([
      'parent.doCheck',
      'parent.afterContentChecked',
      'parent.afterViewChecked',
      'child.afterEveryRender',
    ]);
  });

  it('Section 1: a bound input change runs onChanges and the check hooks down the tree', () => {
    const { fixture, parent } = renderTree();
    log.length = 0;
    parent.v.set(2);
    fixture.detectChanges();
    expect(log).toEqual([
      'child.onChanges',
      'child.doCheck',
      'sib.doCheck',
      'sib.afterContentChecked',
      'child.afterContentChecked',
      'leaf.onChanges',
      'leaf.doCheck',
      'leaf.afterContentChecked',
      'leaf.afterViewChecked',
      'sib.afterViewChecked',
      'child.afterViewChecked',
      'child.afterEveryRender',
    ]);
  });

  it('Section 1: destroy runs deepest first', () => {
    const { fixture, root } = renderTree();
    log.length = 0;
    root.on.set(false);
    fixture.detectChanges();
    expect(log.filter((line) => line.endsWith('.onDestroy'))).toEqual([
      'leaf.onDestroy',
      'sib.onDestroy',
      'child.onDestroy',
      'parent.onDestroy',
    ]);
  });
});
