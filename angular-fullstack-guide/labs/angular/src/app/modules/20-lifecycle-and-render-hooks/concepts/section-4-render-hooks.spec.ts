import {
  AfterViewInit,
  ApplicationRef,
  Component,
  Injector,
  OnInit,
  afterEveryRender,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

const log: string[] = [];

// --- Phases across components: B is created before A, C skips phases ---

@Component({ selector: 'lab-m20-s4-b', template: `b` })
class B {
  constructor() {
    afterEveryRender({ read: () => log.push('B.read') });
    afterEveryRender({ write: () => log.push('B.write') });
  }
}

@Component({ selector: 'lab-m20-s4-a', template: `a` })
class A {
  constructor() {
    afterEveryRender({
      earlyRead: (...args: unknown[]) => {
        log.push(`A.earlyRead args=${args.length} first=${String(args[0])}`);
        return 'A-E';
      },
      write: (fromEarly: string) => {
        log.push(`A.write got ${fromEarly}`);
        return 'A-W';
      },
      mixedReadWrite: (fromWrite: string) => {
        log.push(`A.mixed got ${fromWrite}`);
        return 'A-M';
      },
      read: (fromMixed: string) => {
        log.push(`A.read got ${fromMixed}`);
      },
    });
    afterNextRender(() => log.push('A.nextRender plain'));
    afterNextRender({ read: () => log.push('A.nextRender read') });
  }
}

@Component({ selector: 'lab-m20-s4-c', template: `c` })
class C {
  constructor() {
    afterEveryRender({
      earlyRead: () => 'C-E',
      read: (fromEarly: string) => {
        log.push(`C.read got ${fromEarly}`);
      },
    });
  }
}

@Component({
  selector: 'lab-m20-s4-phases-host',
  imports: [B, A],
  template: `<lab-m20-s4-b /><lab-m20-s4-a />`,
})
class PhasesHost {}

@Component({
  selector: 'lab-m20-s4-skip-host',
  imports: [C],
  template: `<lab-m20-s4-c />`,
})
class SkipHost {}

// --- Once versus every render ---

@Component({ selector: 'lab-m20-s4-counter', template: `{{ s() }}` })
class Counter {
  readonly s = signal(0);
  constructor() {
    afterNextRender(() => log.push('next'));
    afterEveryRender(() => log.push('every'));
  }
}

// --- Registration in ngOnInit ---

@Component({ selector: 'lab-m20-s4-late', template: `late` })
class Late implements OnInit, AfterViewInit {
  private readonly injector = inject(Injector);

  ngOnInit(): void {
    try {
      afterNextRender(() => log.push('no injector'));
    } catch (error) {
      log.push(`threw ${(error as Error).message}`);
    }
    afterNextRender(() => log.push('with injector'), { injector: this.injector });
  }
  ngAfterViewInit(): void {
    log.push('afterViewInit');
  }
}

// --- Cleanup with the component, and manualCleanup ---

@Component({ selector: 'lab-m20-s4-owned', template: `owned` })
class Owned {
  constructor() {
    afterEveryRender(() => log.push('owned every'));
  }
}

let manualRef: { destroy(): void } | undefined;

@Component({ selector: 'lab-m20-s4-manual', template: `manual` })
class Manual {
  constructor() {
    manualRef = afterEveryRender(() => log.push('manual every'), { manualCleanup: true });
  }
}

@Component({
  selector: 'lab-m20-s4-cleanup-host',
  imports: [Owned, Manual],
  template: `@if (on()) {<lab-m20-s4-owned /><lab-m20-s4-manual />}{{ n() }}`,
})
class CleanupHost {
  readonly on = signal(true);
  readonly n = signal(0);
}

// --- A hook that writes state ---

@Component({ selector: 'lab-m20-s4-bounded', template: `{{ s() }}` })
class Bounded {
  readonly s = signal(0);
  constructor() {
    afterEveryRender(() => {
      log.push(`hook s=${this.s()}`);
      if (this.s() < 2) {
        this.s.update((v) => v + 1);
      }
    });
  }
}

@Component({ selector: 'lab-m20-s4-endless', template: `{{ s() }}` })
class Endless {
  readonly s = signal(0);
  constructor() {
    afterEveryRender(() => {
      log.push('endless');
      this.s.update((v) => v + 1);
    });
  }
}

describe('Section 4: render hooks', () => {
  beforeEach(() => {
    log.length = 0;
    manualRef = undefined;
  });

  it('Section 4: callbacks run phase by phase across components and in registration order within a phase', () => {
    const fixture = TestBed.createComponent(PhasesHost);
    fixture.detectChanges();
    expect(log).toEqual([
      'A.earlyRead args=1 first=undefined',
      'B.write',
      'A.write got A-E',
      'A.mixed got A-W',
      'A.nextRender plain',
      'B.read',
      'A.read got A-M',
      'A.nextRender read',
    ]);
  });

  it("Section 4: each phase receives the previous phase's return value", () => {
    const fixture = TestBed.createComponent(PhasesHost);
    fixture.detectChanges();
    expect(log).toContain('A.write got A-E');
    fixture.destroy();
    expect(log).toContain('A.mixed got A-W');
    expect(log).toContain('A.read got A-M');

    // A skipped phase passes the value on: `read` receives what `earlyRead` returned.
    log.length = 0;
    TestBed.createComponent(SkipHost).detectChanges();
    expect(log).toEqual(['C.read got C-E']);
  });

  it('Section 4: afterNextRender runs once and afterEveryRender after each render', () => {
    const fixture = TestBed.createComponent(Counter);
    fixture.detectChanges();
    expect(log).toEqual(['next', 'every']);

    log.length = 0;
    fixture.componentInstance.s.set(1);
    fixture.detectChanges();
    expect(log).toEqual(['every']);
  });

  it('Section 4: a render hook registered in ngOnInit needs an injector', () => {
    const fixture = TestBed.createComponent(Late);
    fixture.detectChanges();
    expect(log.filter((line) => line.startsWith('threw NG0203: afterNextRender()')).length).toBe(1);
    expect(log).not.toContain('no injector');
    expect(log.indexOf('afterViewInit')).toBeLessThan(log.indexOf('with injector'));
  });

  it('Section 4: a hook is cleaned up with its component unless manualCleanup is set', () => {
    const fixture = TestBed.createComponent(CleanupHost);
    fixture.detectChanges();
    expect(log).toEqual(['owned every', 'manual every']);

    log.length = 0;
    fixture.componentInstance.on.set(false);
    fixture.detectChanges();
    log.length = 0;
    fixture.componentInstance.n.set(1);
    fixture.detectChanges();
    expect(log).toEqual(['manual every']);

    manualRef?.destroy();
    log.length = 0;
    fixture.componentInstance.n.set(2);
    fixture.detectChanges();
    expect(log).toEqual([]);
  });

  it('Section 4: a tick with nothing dirty runs no render hook', () => {
    const fixture = TestBed.createComponent(Counter);
    fixture.detectChanges();
    log.length = 0;

    TestBed.inject(ApplicationRef).tick();
    expect(log).toEqual([]);

    fixture.componentInstance.s.set(1);
    TestBed.inject(ApplicationRef).tick();
    expect(log).toEqual(['every']);
  });

  it('Section 4: a hook that writes a signal causes another render and an unconditional write throws NG0103', () => {
    const bounded = TestBed.createComponent(Bounded);
    bounded.detectChanges();
    expect(log).toEqual(['hook s=0', 'hook s=1', 'hook s=2']);
    expect(bounded.nativeElement.textContent).toBe('2');
    bounded.destroy();

    log.length = 0;
    const endless = TestBed.createComponent(Endless);
    let message = '';
    try {
      endless.detectChanges();
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toContain('NG0103: Infinite change detection while refreshing application views.');
    expect(log.length).toBe(10);
  });
});
