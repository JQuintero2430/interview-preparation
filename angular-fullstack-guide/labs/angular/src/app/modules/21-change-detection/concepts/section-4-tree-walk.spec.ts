import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  input,
  signal,
  Type,
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

// --- A recorder: each template method pushes its name, so a test can tell "ran" from "did not run" (never a count) ---

const ran: string[] = [];

// --- A six-view tree. Root > Par (OnPush) > Leaf, Root > ParE (Eager) > Leaf, Root > Sib (OnPush) ---

@Component({
  selector: 'lab-m21-s4-leaf',
  template: `<button type="button" (click)="clicks = clicks + 1">{{ tpl() }}</button>{{ n() }}`,
})
class Leaf {
  readonly label = input.required<string>();
  readonly n = signal(0);
  readonly cdr = inject(ChangeDetectorRef);
  clicks = 0;

  protected tpl(): string {
    ran.push(this.label());
    return '';
  }
}

@Component({
  selector: 'lab-m21-s4-par',
  imports: [Leaf],
  template: `{{ tpl() }}<lab-m21-s4-leaf label="par-leaf" />`,
})
class Par {
  protected tpl(): string {
    ran.push('par');
    return '';
  }
}

// Eager on purpose: an Eager view is refreshed whenever the walk reaches it in global mode.
@Component({
  selector: 'lab-m21-s4-par-eager',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [Leaf],
  template: `{{ tpl() }}<lab-m21-s4-leaf label="par-eager-leaf" />`,
})
class ParEager {
  protected tpl(): string {
    ran.push('par-eager');
    return '';
  }
}

@Component({ selector: 'lab-m21-s4-sib', template: `{{ tpl() }}` })
class Sib {
  protected tpl(): string {
    ran.push('sib');
    return '';
  }
}

@Component({
  selector: 'lab-m21-s4-root',
  imports: [Par, ParEager, Sib],
  template: `{{ tpl() }}<lab-m21-s4-par /><lab-m21-s4-par-eager /><lab-m21-s4-sib />`,
})
class Root {
  protected tpl(): string {
    ran.push('root');
    return '';
  }
}

// --- An Eager child under an OnPush parent, and an unrelated component with its own signal ---

// Eager on purpose.
@Component({
  selector: 'lab-m21-s4-eager-kid',
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `{{ tpl() }}{{ field }}`,
})
class EagerKid {
  field = 'a';

  protected tpl(): string {
    ran.push('eager-kid');
    return '';
  }
}

@Component({
  selector: 'lab-m21-s4-gate',
  imports: [EagerKid],
  template: `{{ tpl() }}<lab-m21-s4-eager-kid />`,
})
class Gate {
  readonly s = signal(0);

  protected tpl(): string {
    ran.push('gate');
    return `s${this.s()}`;
  }
}

@Component({
  selector: 'lab-m21-s4-other',
  template: `{{ tpl() }}`,
})
class Other {
  readonly s = signal(0);

  protected tpl(): string {
    ran.push('other');
    return `o${this.s()}`;
  }
}

@Component({
  selector: 'lab-m21-s4-gate-host',
  imports: [Gate, Other],
  template: `<lab-m21-s4-gate /><lab-m21-s4-other />`,
})
class GateHost {}

// --- An embedded view: the content of an @if block, reading a signal of its declaring component ---

@Component({
  selector: 'lab-m21-s4-switcher',
  template: `{{ outer() }}
    @if (show()) {
      <p>{{ inner() }}{{ n() }}</p>
    }`,
})
class Switcher {
  readonly show = signal(true);
  readonly n = signal(0);

  protected outer(): string {
    ran.push('switcher');
    return '';
  }

  protected inner(): string {
    ran.push('embedded');
    return '';
  }
}

function instance<T>(fixture: ComponentFixture<unknown>, type: Type<T>, index = 0): T {
  return fixture.debugElement.queryAll(By.directive(type))[index].componentInstance as T;
}

describe('Section 4: the tree walk', () => {
  beforeEach(() => {
    ran.length = 0;
  });

  it('Section 4: a signal written in a leaf refreshes only that leaf, under an OnPush or an Eager parent', async () => {
    const fixture = TestBed.createComponent(Root);
    fixture.detectChanges();

    ran.length = 0;
    instance(fixture, Leaf, 0).n.set(1);
    await fixture.whenStable();
    expect(ran).toContain('par-leaf');
    expect(ran).not.toContain('par');
    expect(ran).not.toContain('root');
    expect(ran).not.toContain('par-eager');

    ran.length = 0;
    instance(fixture, Leaf, 1).n.set(1);
    await fixture.whenStable();
    expect(ran).toContain('par-eager-leaf');
    expect(ran).not.toContain('par-eager');
    expect(ran).not.toContain('root');
  });

  it('Section 4: markForCheck in a leaf refreshes its ancestors and not an OnPush sibling', async () => {
    const fixture = TestBed.createComponent(Root);
    fixture.detectChanges();
    ran.length = 0;

    instance(fixture, Leaf, 0).cdr.markForCheck();
    await fixture.whenStable();

    expect(ran).toEqual(expect.arrayContaining(['root', 'par', 'par-leaf', 'par-eager']));
    expect(ran).not.toContain('sib');
    expect(ran).not.toContain('par-eager-leaf');
  });

  it('Section 4: an event in an OnPush leaf refreshes the path and the Eager siblings', async () => {
    const fixture = TestBed.createComponent(Root);
    fixture.detectChanges();
    ran.length = 0;

    fixture.debugElement.query(By.css('button')).nativeElement.click();
    await fixture.whenStable();

    expect(ran).toEqual(expect.arrayContaining(['root', 'par', 'par-leaf', 'par-eager']));
    expect(ran).not.toContain('sib');
    expect(ran).not.toContain('par-eager-leaf');
  });

  it('Section 4: an Eager child of an OnPush parent is refreshed when the parent is refreshed and not before', async () => {
    const fixture = TestBed.createComponent(GateHost);
    fixture.detectChanges();
    const kid = instance(fixture, EagerKid);
    kid.field = 'b';
    ran.length = 0;

    instance(fixture, Other).s.set(1);
    await fixture.whenStable();
    expect(ran).toContain('other');
    expect(ran).not.toContain('eager-kid');
    expect(fixture.nativeElement.querySelector('lab-m21-s4-eager-kid').textContent).toBe('a');

    ran.length = 0;
    instance(fixture, Gate).s.set(1);
    await fixture.whenStable();
    expect(ran).toContain('gate');
    expect(ran).toContain('eager-kid');
    expect(fixture.nativeElement.querySelector('lab-m21-s4-eager-kid').textContent).toBe('b');
  });

  it('Section 4: an embedded view is refreshed with its declaring component', async () => {
    const fixture = TestBed.createComponent(Switcher);
    fixture.detectChanges();
    ran.length = 0;

    fixture.componentInstance.n.set(1);
    await fixture.whenStable();

    expect(ran).toContain('switcher');
    expect(ran).toContain('embedded');
    expect(fixture.nativeElement.textContent).toContain('1');
  });
});
