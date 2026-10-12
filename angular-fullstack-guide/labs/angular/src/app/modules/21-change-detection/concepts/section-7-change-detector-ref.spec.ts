import { ChangeDetectorRef, Component, Directive, inject, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

// --- A recorder: each template method pushes its name, so a test can tell "ran" from "did not run" (never a count) ---

const ran: string[] = [];

// --- Tree: Root > Par > Leaf, plus an OnPush sibling (all OnPush, the v22 default). The leaf holds a signal and its ref. ---

@Component({ selector: 'lab-m21-s7-leaf', template: `{{ tpl() }}{{ n() }}` })
class Leaf {
  readonly n = signal(0);
  readonly cdr = inject(ChangeDetectorRef);

  protected tpl(): string {
    ran.push('leaf');
    return '';
  }
}

@Component({
  selector: 'lab-m21-s7-par',
  imports: [Leaf],
  template: `{{ tpl() }}<lab-m21-s7-leaf />`,
})
class Par {
  protected tpl(): string {
    ran.push('par');
    return '';
  }
}

@Component({ selector: 'lab-m21-s7-sib', template: `{{ tpl() }}` })
class Sib {
  protected tpl(): string {
    ran.push('sib');
    return '';
  }
}

@Component({
  selector: 'lab-m21-s7-root',
  imports: [Par, Sib],
  template: `{{ tpl() }}<lab-m21-s7-par /><lab-m21-s7-sib />`,
})
class Root {
  protected tpl(): string {
    ran.push('root');
    return '';
  }
}

// --- One view with a signal and a plain field side by side; it injects its own ref ---

@Component({ selector: 'lab-m21-s7-panel', template: `{{ count() }}|{{ plain }}` })
class Panel {
  readonly count = signal(0);
  plain = 'a';
  readonly cdr = inject(ChangeDetectorRef);
}

// --- A directive injects a ref; its host element sits in the template and inside an @if block ---

@Directive({ selector: '[labM21S7Mark]' })
class Mark {
  readonly cdr = inject(ChangeDetectorRef);
}

@Component({
  selector: 'lab-m21-s7-host',
  imports: [Mark],
  template: `{{ tpl() }}{{ n() }}<span labM21S7Mark></span>
    @if (show()) {
      <span labM21S7Mark></span>
    }`,
})
class Host {
  readonly n = signal(0);
  readonly show = signal(true);

  protected tpl(): string {
    ran.push('host');
    return '';
  }
}

const text = (fixture: ComponentFixture<unknown>) => fixture.nativeElement.textContent;

const marks = (fixture: ComponentFixture<Host>) =>
  fixture.debugElement.queryAll(By.directive(Mark)).map((el) => el.injector.get(Mark));

async function mounted<T>(type: new () => T): Promise<ComponentFixture<T>> {
  const fixture = TestBed.createComponent(type);
  fixture.detectChanges();
  await fixture.whenStable();
  ran.length = 0;
  return fixture;
}

describe('Section 7: ChangeDetectorRef', () => {
  it('Section 7: markForCheck flags the view and its ancestors and a signal flags only the view', async () => {
    const fixture = await mounted(Root);
    const leaf = fixture.debugElement.query(By.directive(Leaf)).componentInstance as Leaf;

    leaf.n.set(1);
    await fixture.whenStable();
    expect(ran).toContain('leaf');
    expect(ran).not.toContain('par');
    expect(ran).not.toContain('root');

    ran.length = 0;
    leaf.cdr.markForCheck();
    expect(ran).toEqual([]);
    await fixture.whenStable();
    expect(ran).toEqual(expect.arrayContaining(['root', 'par', 'leaf']));
    expect(ran).not.toContain('sib');
  });

  it('Section 7: a detached view ignores a signal write and detectChanges still renders it', async () => {
    const fixture = await mounted(Panel);
    const panel = fixture.componentInstance;

    panel.cdr.detach();
    panel.count.set(1);
    await fixture.whenStable();
    expect(text(fixture)).toBe('0|a');

    panel.cdr.detectChanges();
    expect(text(fixture)).toBe('1|a');
  });

  it('Section 7: reattach renders the latest state', async () => {
    const fixture = await mounted(Panel);
    const panel = fixture.componentInstance;

    panel.cdr.detach();
    panel.count.set(2);
    panel.plain = 'z';
    await fixture.whenStable();
    expect(text(fixture)).toBe('0|a');

    panel.cdr.reattach();
    await fixture.whenStable();
    expect(text(fixture)).toBe('2|z');
  });

  it('Section 7: reattach alone does not render a plain-field change', async () => {
    const fixture = await mounted(Panel);
    const panel = fixture.componentInstance;

    panel.cdr.detach();
    panel.plain = 'y';
    panel.cdr.reattach();
    await fixture.whenStable();

    expect(text(fixture)).toBe('0|a');
  });

  it('Section 7: markForCheck on a detached view renders only after reattach', async () => {
    const fixture = await mounted(Panel);
    const panel = fixture.componentInstance;

    panel.cdr.detach();
    panel.plain = 'y';
    panel.cdr.markForCheck();
    await fixture.whenStable();
    expect(text(fixture)).toBe('0|a');

    panel.cdr.reattach();
    await fixture.whenStable();
    expect(text(fixture)).toBe('0|y');
  });

  it('Section 7: detectChanges on a clean OnPush view renders a plain-field change', async () => {
    const fixture = await mounted(Panel);
    const panel = fixture.componentInstance;

    panel.plain = 'plain';
    await fixture.whenStable();
    expect(text(fixture)).toBe('0|a');

    panel.cdr.detectChanges();
    expect(text(fixture)).toBe('0|plain');
  });

  it("Section 7: a directive's ChangeDetectorRef refreshes the declaring component's view", async () => {
    const fixture = await mounted(Host);

    marks(fixture)[0].cdr.markForCheck();
    await fixture.whenStable();

    expect(ran).toContain('host');
  });

  it("Section 7: a directive inside an @if block acts on the declaring component's view", async () => {
    const fixture = await mounted(Host);
    const inner = marks(fixture)[1];

    inner.cdr.markForCheck();
    await fixture.whenStable();
    expect(ran).toContain('host');

    inner.cdr.detach();
    fixture.componentInstance.n.set(1);
    await fixture.whenStable();
    expect(text(fixture)).toBe('0');
  });
});
