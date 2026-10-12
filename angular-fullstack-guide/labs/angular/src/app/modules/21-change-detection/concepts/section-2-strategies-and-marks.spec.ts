import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  input,
  signal,
  Type,
} from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';

// --- A recorder: each template method pushes its name, so a test can tell "ran" from "did not run" (never a count) ---

const ran: string[] = [];

// --- Inputs by reference: Owner (OnPush, the v22 default) binds a plain object to Box (OnPush) ---

@Component({ selector: 'lab-m21-s2-box', template: `{{ tpl() }}n={{ o().n }}` })
class Box {
  readonly o = input.required<{ n: number }>();

  protected tpl(): string {
    ran.push('box');
    return '';
  }
}

@Component({
  selector: 'lab-m21-s2-owner',
  imports: [Box],
  template: `{{ tick() }}<lab-m21-s2-box [o]="o" />`,
})
class Owner {
  readonly s = signal(0);
  o = { n: 1 };

  protected tick(): string {
    ran.push('owner');
    return `s${this.s()}`;
  }
}

// --- Events: Outer > Mid > Btn, with an Eager and an OnPush sibling of Mid. Plain fields, no signals. ---

@Component({
  selector: 'lab-m21-s2-btn',
  template: `<button type="button" (click)="count = count + 1">{{ tpl() }}</button>`,
})
class Btn {
  count = 0;

  protected tpl(): string {
    ran.push('btn');
    return `clicks${this.count}`;
  }
}

@Component({
  selector: 'lab-m21-s2-mid',
  imports: [Btn],
  template: `{{ tpl() }}<lab-m21-s2-btn />`,
})
class Mid {
  protected tpl(): string {
    ran.push('mid');
    return '';
  }
}

// Eager on purpose: an Eager view is checked whenever the walk reaches it.
@Component({
  selector: 'lab-m21-s2-eager-sib',
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `{{ tpl() }}{{ field }}`,
})
class EagerSib {
  field = 'a';

  protected tpl(): string {
    ran.push('eager-sib');
    return '';
  }
}

@Component({ selector: 'lab-m21-s2-push-sib', template: `{{ tpl() }}{{ field }}` })
class PushSib {
  field = 'a';

  protected tpl(): string {
    ran.push('push-sib');
    return '';
  }
}

@Component({
  selector: 'lab-m21-s2-outer',
  imports: [Mid, EagerSib, PushSib],
  template: `{{ tpl() }}<lab-m21-s2-mid /><lab-m21-s2-eager-sib /><lab-m21-s2-push-sib />`,
})
class Outer {
  protected tpl(): string {
    ran.push('outer');
    return '';
  }
}

// --- The async pipe, a plain field plus markForCheck, setInput and a signal ---

@Component({
  selector: 'lab-m21-s2-async-view',
  imports: [AsyncPipe],
  template: `{{ tpl() }}{{ value$ | async }}`,
})
class AsyncView {
  readonly value$ = new BehaviorSubject('v0');

  protected tpl(): string {
    ran.push('async-view');
    return '';
  }
}

@Component({ selector: 'lab-m21-s2-plain', template: `{{ tpl() }}{{ text }}` })
class Plain {
  readonly cdr = inject(ChangeDetectorRef);
  text = 'a';

  protected tpl(): string {
    ran.push('plain');
    return '';
  }
}

@Component({
  selector: 'lab-m21-s2-host',
  imports: [AsyncView, Plain],
  template: `<lab-m21-s2-async-view /><lab-m21-s2-plain />`,
})
class Host {}

@Component({ selector: 'lab-m21-s2-input-view', template: `{{ tpl() }}{{ v() }}` })
class InputView {
  readonly v = input('init');

  protected tpl(): string {
    ran.push('input-view');
    return '';
  }
}

@Component({ selector: 'lab-m21-s2-leaf', template: `{{ tpl() }}leaf{{ n() }}` })
class Leaf {
  readonly n = signal(0);

  protected tpl(): string {
    ran.push('leaf');
    return '';
  }
}

@Component({
  selector: 'lab-m21-s2-parent',
  imports: [Leaf],
  template: `{{ tpl() }}<lab-m21-s2-leaf />`,
})
class Parent {
  protected tpl(): string {
    ran.push('parent');
    return '';
  }
}

function textOf(fixture: ComponentFixture<unknown>, type: Type<unknown>): string {
  return fixture.debugElement.query(By.directive(type)).nativeElement.textContent ?? '';
}

describe('Section 2: strategies and what marks a view dirty', () => {
  beforeEach(() => {
    ran.length = 0;
  });

  it('Section 2: a new object reference refreshes the child and an in-place edit does not', async () => {
    const fixture = TestBed.createComponent(Owner);
    fixture.detectChanges();
    const owner = fixture.componentInstance;
    expect(fixture.nativeElement.textContent).toBe('s0n=1');
    ran.length = 0;

    owner.o.n = 2;
    owner.s.update((n) => n + 1);
    await fixture.whenStable();

    expect(ran).toContain('owner');
    expect(ran).not.toContain('box');
    expect(fixture.nativeElement.textContent).toBe('s1n=1');
    ran.length = 0;

    owner.o = { n: 3 };
    owner.s.update((n) => n + 1);
    await fixture.whenStable();

    expect(ran).toContain('box');
    expect(fixture.nativeElement.textContent).toBe('s2n=3');
  });

  it('Section 2: an event refreshes the view, its ancestors and Eager siblings and skips OnPush siblings', async () => {
    const fixture = TestBed.createComponent(Outer);
    fixture.detectChanges();
    fixture.debugElement.query(By.directive(EagerSib)).componentInstance.field = 'b';
    fixture.debugElement.query(By.directive(PushSib)).componentInstance.field = 'b';
    ran.length = 0;

    fixture.debugElement.query(By.css('button')).nativeElement.click();
    await fixture.whenStable();

    expect(ran).toEqual(expect.arrayContaining(['btn', 'mid', 'outer', 'eager-sib']));
    expect(ran).not.toContain('push-sib');
    expect(textOf(fixture, Btn)).toBe('clicks1');
    expect(textOf(fixture, EagerSib)).toBe('b');
    expect(textOf(fixture, PushSib)).toBe('a');
  });

  it('Section 2: the async pipe marks the view on emission', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const view = fixture.debugElement.query(By.directive(AsyncView)).componentInstance as AsyncView;
    expect(textOf(fixture, AsyncView)).toBe('v0');
    ran.length = 0;

    view.value$.next('v1');
    await fixture.whenStable();

    expect(ran).toContain('async-view');
    expect(textOf(fixture, AsyncView)).toBe('v1');
  });

  it('Section 2: a plain-field write renders only after markForCheck', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const plain = fixture.debugElement.query(By.directive(Plain)).componentInstance as Plain;
    ran.length = 0;

    plain.text = 'b';
    await fixture.whenStable();

    expect(ran).not.toContain('plain');
    expect(textOf(fixture, Plain)).toBe('a');

    plain.cdr.markForCheck();
    await fixture.whenStable();

    expect(ran).toContain('plain');
    expect(textOf(fixture, Plain)).toBe('b');
  });

  it('Section 2: setInput marks the view and the render follows the next stable point', async () => {
    const fixture = TestBed.createComponent(InputView);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('init');

    fixture.componentRef.setInput('v', 'new');
    expect(fixture.nativeElement.textContent).toBe('init');

    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toBe('new');
  });

  it('Section 2: a signal read in the template marks that view', async () => {
    const fixture = TestBed.createComponent(Parent);
    fixture.detectChanges();
    const leaf = fixture.debugElement.query(By.directive(Leaf)).componentInstance as Leaf;
    ran.length = 0;

    leaf.n.set(1);
    await fixture.whenStable();

    expect(ran).toContain('leaf');
    expect(ran).not.toContain('parent');
    expect(fixture.nativeElement.textContent).toBe('leaf1');
  });
});
