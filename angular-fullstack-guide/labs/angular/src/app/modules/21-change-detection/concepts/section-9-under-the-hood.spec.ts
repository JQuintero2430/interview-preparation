import {
  afterEveryRender,
  ApplicationRef,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  signal,
  ɵProfilerEvent as ProfilerEvent,
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

// --- A recorder: each template method and render hook pushes its name (never a count) ---

const ran: string[] = [];

// --- Chain Root > A > B > Leaf, all OnPush (the v22 default). The leaf holds a signal, its ref and a render hook. ---

@Component({ selector: 'lab-m21-s9-leaf', template: `{{ tpl() }}{{ n() }}` })
class Leaf {
  readonly n = signal(0);
  readonly cdr = inject(ChangeDetectorRef);

  constructor() {
    afterEveryRender(() => ran.push('hook'));
  }

  protected tpl(): string {
    ran.push('leaf');
    return '';
  }
}

@Component({
  selector: 'lab-m21-s9-b',
  imports: [Leaf],
  template: `{{ tpl() }}<lab-m21-s9-leaf />`,
})
class B {
  protected tpl(): string {
    ran.push('b');
    return '';
  }
}

@Component({ selector: 'lab-m21-s9-a', imports: [B], template: `{{ tpl() }}<lab-m21-s9-b />` })
class A {
  protected tpl(): string {
    ran.push('a');
    return '';
  }
}

@Component({ selector: 'lab-m21-s9-root', imports: [A], template: `{{ tpl() }}<lab-m21-s9-a />` })
class Root {
  protected tpl(): string {
    ran.push('root');
    return '';
  }
}

// --- Two roots for the development check: OnPush (the v22 default) and Eager, each with a plain field ---

@Component({ selector: 'lab-m21-s9-push', template: `{{ field }}` })
class PushRoot {
  field = 'a';
}

// Eager on purpose: a `CheckAlways` view is compared by the development check pass.
@Component({
  selector: 'lab-m21-s9-eager',
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `{{ field }}`,
})
class EagerRoot {
  field = 'a';
}

interface NgGlobal {
  ɵsetProfiler(hook: (event: number) => void): () => void;
}

// `dirtyFlags` is internal (`@internal` in the repo source), so the spec reads it through a cast.
const flags = () =>
  (TestBed.inject(ApplicationRef) as unknown as { dirtyFlags: number }).dirtyFlags;

async function mounted<T>(type: new () => T): Promise<ComponentFixture<T>> {
  const fixture = TestBed.createComponent(type);
  fixture.detectChanges();
  await fixture.whenStable();
  ran.length = 0;
  return fixture;
}

const leafOf = (fixture: ComponentFixture<Root>) =>
  fixture.debugElement.query(By.directive(Leaf)).componentInstance as Leaf;

describe('Section 9: under the hood', () => {
  it('Section 9: tick with nothing dirty refreshes nothing in a zoneless app', async () => {
    await mounted(Root);

    TestBed.inject(ApplicationRef).tick();

    expect(flags()).toBe(0);
    expect(ran).toEqual([]);
  });

  it('Section 9: a signal write sets the traversal flag on the application and markForCheck sets the check flag', async () => {
    const fixture = await mounted(Root);
    const leaf = leafOf(fixture);
    expect(flags()).toBe(0);

    leaf.n.set(1);
    expect(flags()).toBe(2);
    expect(ran).toEqual([]);
    await fixture.whenStable();
    expect(flags()).toBe(0);

    leaf.cdr.markForCheck();
    expect(flags()).toBe(4);
    await fixture.whenStable();
    expect(flags()).toBe(0);
  });

  it('Section 9: the development check visits an Eager root after an idle tick', async () => {
    const app = TestBed.inject(ApplicationRef);
    const push = await mounted(PushRoot);
    push.componentInstance.field = 'x';
    expect(() => app.tick()).not.toThrow();
    push.destroy();

    const eager = await mounted(EagerRoot);
    eager.componentInstance.field = 'x';
    expect(() => app.tick()).toThrowError(/NG0100.*Previous value: 'a'/s);
  });

  it("Section 9: a view's flags make the walk find a refreshed descendant without refreshing the ancestors", async () => {
    const fixture = await mounted(Root);

    leafOf(fixture).n.set(1);
    await fixture.whenStable();

    expect(ran).toContain('leaf');
    expect(ran).not.toContain('b');
    expect(ran).not.toContain('a');
    expect(ran).not.toContain('root');
  });

  it('Section 9: the profiler stages of one tick appear in order', async () => {
    const fixture = await mounted(Root);
    const events: string[] = [];
    const stop = (globalThis as unknown as { ng: NgGlobal }).ng.ɵsetProfiler((event) =>
      events.push(ProfilerEvent[event]),
    );

    leafOf(fixture).n.set(1);
    await fixture.whenStable();
    stop();

    expect(events).toEqual([
      'ChangeDetectionStart',
      'ChangeDetectionSyncStart',
      'ComponentStart',
      'ComponentStart',
      'ComponentStart',
      'ComponentStart',
      'TemplateUpdateStart',
      'TemplateUpdateEnd',
      'ComponentEnd',
      'ComponentEnd',
      'ComponentEnd',
      'ComponentEnd',
      'AfterRenderHooksStart',
      'AfterRenderHooksEnd',
      'ChangeDetectionSyncEnd',
      'ChangeDetectionEnd',
    ]);
  });
});
