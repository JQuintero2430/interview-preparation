// labs/angular/src/app/modules/17-signals/outputs/q17-outputs.spec.ts
// Each test reproduces one "Output" or runtime "Bug hunt" question from Module 17 and asserts
// the exact lines the answer claims. If Angular changes behaviour, this file fails first.
import {
  ApplicationRef,
  Component,
  computed,
  effect,
  Injector,
  linkedSignal,
  model,
  type OnInit,
  resource,
  signal,
  untracked,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function recorder() {
  const lines: string[] = [];
  return { lines, log: (...parts: unknown[]) => lines.push(parts.map(String).join(' ')) };
}

describe('Module 17 output questions', () => {
  it('Q17.02 zoneless: a plain field changed by a timer is not rendered; a signal is', async () => {
    @Component({ selector: 'lab-q02-field', template: '{{ label }}' })
    class FieldClock {
      label = 'not started';
      constructor() {
        setTimeout(() => (this.label = 'started'), 20); // after the first render
      }
    }
    @Component({ selector: 'lab-q02-signal', template: '{{ label() }}' })
    class SignalClock {
      readonly label = signal('not started');
      constructor() {
        setTimeout(() => this.label.set('started'), 20);
      }
    }
    const field = TestBed.createComponent(FieldClock);
    const reactive = TestBed.createComponent(SignalClock);
    await field.whenStable();
    await reactive.whenStable();
    await wait(50);
    TestBed.inject(ApplicationRef).tick(); // even a full tick does not help: the view is OnPush and not dirty
    expect((field.nativeElement as HTMLElement).textContent).toBe('not started');
    expect((reactive.nativeElement as HTMLElement).textContent).toBe('started');
  });

  it('Q17.04 mutating an array in place does not notify', () => {
    const { lines, log } = recorder();
    const list = signal<number[]>([1]);
    const length = computed(() => list().length);
    log(length());
    list.update((l) => {
      l.push(2);
      return l;
    });
    log(length());
    list.update((l) => [...l, 3]);
    log(length());
    expect(lines).toEqual(['1', '1', '3']);
  });

  it('Q17.06 computed is lazy and memoized', () => {
    const { lines, log } = recorder();
    const a = signal(1);
    const double = computed(() => {
      log('compute', a());
      return a() * 2;
    });
    log('created');
    a.set(2);
    a.set(3);
    log('read', double());
    log('read', double());
    expect(lines).toEqual(['created', 'compute 3', 'read 6', 'read 6']);
  });

  it('Q17.08 writing to a signal inside computed throws NG0600', () => {
    const source = signal(0);
    const mirror = signal(0);
    const bad = computed(() => {
      mirror.set(source());
      return source();
    });
    expect(() => bad()).toThrowError(/NG0600: Writing to signals is not allowed in a `computed`/);
  });

  it('Q17.08 (trap) untracked() silences NG0600 but does not fix the design', () => {
    const source = signal(0);
    const mirror = signal(0);
    const masked = computed(() => {
      untracked(() => mirror.set(source()));
      return source();
    });
    expect(() => masked()).not.toThrow();
    expect(mirror()).toBe(0);
    source.set(7);
    expect(mirror()).toBe(0); // nobody read `masked`, so the "side effect" never happened
    masked();
    expect(mirror()).toBe(7);
  });

  it('Q17.09 a computed caches its error and recovers when inputs change', () => {
    const { lines, log } = recorder();
    const n = signal(0);
    let runs = 0;
    const ratio = computed(() => {
      runs++;
      if (n() === 0) throw new Error('division by zero');
      return 10 / n();
    });
    for (let i = 0; i < 2; i++) {
      try {
        ratio();
      } catch (e) {
        log('threw', (e as Error).message);
      }
    }
    log('runs', runs);
    n.set(5);
    log('value', ratio());
    expect(lines).toEqual(['threw division by zero', 'threw division by zero', 'runs 1', 'value 2']);
  });

  it('Q17.10 a custom equality function suppresses notifications', () => {
    const { lines, log } = recorder();
    const user = signal({ id: 1, name: 'Ada' }, { equal: (a, b) => a.id === b.id });
    const name = computed(() => {
      log('compute');
      return user().name;
    });
    log(name());
    user.set({ id: 1, name: 'Ada L.' });
    log(name());
    user.set({ id: 2, name: 'Grace' });
    log(name());
    expect(lines).toEqual(['compute', 'Ada', 'Ada', 'compute', 'Grace']);
  });

  it('Q17.11 dependencies are dynamic and untracked reads are not dependencies', () => {
    const { lines, log } = recorder();
    const useX = signal(false);
    const x = signal(1);
    const y = signal(100);
    let runs = 0;
    const pick = computed(() => {
      runs++;
      return useX() ? x() : untracked(y);
    });
    log(pick(), runs);
    y.set(200);
    log(pick(), runs);
    x.set(2);
    log(pick(), runs);
    useX.set(true);
    log(pick(), runs);
    expect(lines).toEqual(['100 1', '100 1', '100 1', '2 2']);
  });

  it('Q17.13 two synchronous writes produce one effect run with the final values', () => {
    const { lines, log } = recorder();
    const injector = TestBed.inject(Injector);
    const first = signal('Ada');
    const last = signal('Lovelace');
    effect(() => log(first(), last()), { injector });
    TestBed.tick();
    first.set('Grace');
    last.set('Hopper');
    TestBed.tick();
    expect(lines).toEqual(['Ada Lovelace', 'Grace Hopper']);
  });

  it('Q17.14 root effects run before component effects, and both before rendering', async () => {
    const { lines, log } = recorder();
    @Component({ selector: 'lab-q14', template: '{{ value() }}' })
    class Q14 {
      readonly value = signal(1);
      constructor() {
        effect(() => log('component effect', this.value()));
      }
    }
    const injector = TestBed.inject(Injector);
    const fixture = TestBed.createComponent(Q14);
    effect(() => log('root effect', fixture.componentInstance.value()), { injector });
    log('created');
    await fixture.whenStable();
    log('dom', (fixture.nativeElement as HTMLElement).textContent);
    fixture.componentInstance.value.set(2);
    log('dom right after set', (fixture.nativeElement as HTMLElement).textContent);
    await wait(50); // no manual tick: the zoneless scheduler refreshes on its own
    log('dom later', (fixture.nativeElement as HTMLElement).textContent);
    expect(lines).toEqual([
      'created',
      'root effect 1',
      'component effect 1',
      'dom 1',
      'dom right after set 1',
      'root effect 2',
      'component effect 2',
      'dom later 2',
    ]);
  });

  it('Section 4: a root effect does not run within one microtask of a write', async () => {
    const { lines, log } = recorder();
    const injector = TestBed.inject(Injector);
    const s = signal(0);
    effect(() => log('effect', s()), { injector });
    TestBed.tick();
    s.set(1);
    await Promise.resolve();
    log('after one microtask');
    await wait(50);
    expect(lines).toEqual(['effect 0', 'after one microtask', 'effect 1']);
  });

  it('Q17.16 creating an effect in ngOnInit throws NG0203', () => {
    let message = '';
    @Component({ selector: 'lab-q16', template: '' })
    class Q16 implements OnInit {
      ngOnInit(): void {
        try {
          effect(() => undefined);
        } catch (e) {
          message = (e as Error).message;
        }
      }
    }
    TestBed.createComponent(Q16).detectChanges();
    expect(message).toMatch(/^NG0203: effect\(\) can only be used within an injection context/);
  });

  it('Q17.17 effect cleanup runs before the next run and on destroy', () => {
    const { lines, log } = recorder();
    const injector = TestBed.inject(Injector);
    const room = signal('a');
    const ref = effect(
      (onCleanup) => {
        const current = room();
        log('join', current);
        onCleanup(() => log('leave', current));
      },
      { injector },
    );
    TestBed.tick();
    room.set('b');
    TestBed.tick();
    ref.destroy();
    room.set('c');
    TestBed.tick();
    expect(lines).toEqual(['join a', 'leave a', 'join b', 'leave b']);
  });

  it('Q17.18 an effect that writes what it reads re-runs until the value settles', () => {
    const { lines, log } = recorder();
    const injector = TestBed.inject(Injector);
    const n = signal(0);
    effect(
      () => {
        if (n() < 3) n.set(n() + 1);
        log('run', n());
      },
      { injector },
    );
    TestBed.tick();
    expect(lines).toEqual(['run 1', 'run 2', 'run 3', 'run 3']);
  });

  it('Q17.18 (follow-up) a non-converging root effect is not stopped by Angular', () => {
    const injector = TestBed.inject(Injector);
    const n = signal(0);
    let runs = 0;
    const SAFETY_STOP = 5000; // the test's own guard; without it the tick never returns
    effect(
      () => {
        runs++;
        if (runs > SAFETY_STOP) return;
        n.set(n() + 1);
      },
      { injector },
    );
    expect(() => TestBed.tick()).not.toThrow();
    expect(runs).toBe(SAFETY_STOP + 1);
  });

  it('Q17.20 linkedSignal keeps a local write until its source changes', () => {
    const { lines, log } = recorder();
    const options = signal(['a', 'b']);
    const selected = linkedSignal(() => options()[0]);
    selected.set('b');
    log(selected());
    options.set(['x', 'y']);
    log(selected());
    expect(lines).toEqual(['b', 'x']);
  });

  it('Q17.22 reload() returns false (no-op) while idle or loading, true when it starts a reload', async () => {
    const injector = TestBed.inject(Injector);
    const id = signal<number | undefined>(undefined);
    const user = resource({
      params: () => id(),
      loader: async ({ params }) => {
        await wait(5);
        return params;
      },
      injector,
    });
    expect(user.reload()).toBe(false); // idle
    id.set(1);
    TestBed.tick();
    expect(user.reload()).toBe(false); // loading
    await wait(20);
    TestBed.tick();
    expect(user.reload()).toBe(true); // resolved -> reloading
  });

  it('Q17.20 (follow-up) explicit linkedSignal that keeps a still-valid selection', () => {
    const options = signal(['a', 'b']);
    const selected = linkedSignal<string[], string | undefined>({
      source: options,
      computation: (opts, prev) => (prev && opts.includes(prev.value ?? '') ? prev.value : opts[0]),
    });
    selected.set('b');
    options.set(['b', 'c']);
    expect(selected()).toBe('b');
    options.set(['c']);
    expect(selected()).toBe('c');
  });

  it('Q17.23 resource aborts stale loads and reports statuses', async () => {
    const { lines, log } = recorder();
    const injector = TestBed.inject(Injector);
    const id = signal<number | undefined>(undefined);
    const user = resource({
      params: () => id(),
      loader: async ({ params, abortSignal }) => {
        log('load', params);
        await wait(10);
        log('done', params, 'aborted:', abortSignal.aborted);
        return `user${params}`;
      },
      injector,
    });
    log(user.status());
    id.set(1);
    TestBed.tick();
    log(user.status());
    id.set(2);
    TestBed.tick();
    await wait(30);
    TestBed.tick();
    log(user.status(), user.value());
    user.reload();
    TestBed.tick();
    log(user.status(), user.value());
    await wait(30);
    TestBed.tick();
    user.set('edited');
    log(user.status(), user.value());
    expect(lines).toEqual([
      'idle',
      'load 1',
      'loading',
      'load 2',
      'done 1 aborted: true',
      'done 2 aborted: false',
      'resolved user2',
      'load 2',
      'reloading user2',
      'done 2 aborted: false',
      'local edited',
    ]);
  });

  it('Q17.24 defaultValue does not protect value() in the error state', async () => {
    const { lines, log } = recorder();
    const injector = TestBed.inject(Injector);
    const term = signal('a');
    const fail = signal(false);
    const results = resource<string[], { term: string; fail: boolean }>({
      params: () => ({ term: term(), fail: fail() }),
      loader: async ({ params }) => {
        await wait(5);
        if (params.fail) throw new Error('boom');
        return [params.term];
      },
      defaultValue: [],
      injector,
    });
    await wait(20);
    TestBed.tick();
    log(results.status(), JSON.stringify(results.value()));
    term.set('b');
    TestBed.tick();
    log(results.status(), results.hasValue(), JSON.stringify(results.value()));
    fail.set(true);
    await wait(20);
    TestBed.tick();
    log(results.status(), results.hasValue());
    try {
      results.value();
    } catch (e) {
      log('value() threw:', (e as Error).message.split(':')[0]);
    }
    expect(lines).toEqual([
      'resolved ["a"]',
      'loading true []',
      'error false',
      'value() threw: Resource is currently in an error state (see Error.cause for details)',
    ]);
  });

  it('Section 6: reload() after an error reports "reloading", and resources do not cache per params', async () => {
    const injector = TestBed.inject(Injector);
    const id = signal(1);
    let calls = 0;
    let fail = true;
    const user = resource({
      params: () => id(),
      loader: async ({ params }) => {
        calls++;
        await wait(5);
        if (fail) throw new Error('down');
        return `user${params}`;
      },
      injector,
    });
    await wait(20);
    TestBed.tick();
    expect(user.status()).toBe('error');
    fail = false;
    user.reload();
    TestBed.tick();
    expect(user.status()).toBe('reloading');
    await wait(20);
    TestBed.tick();
    expect(user.value()).toBe('user1');
    id.set(2);
    TestBed.tick();
    await wait(20);
    TestBed.tick();
    id.set(1);
    TestBed.tick();
    await wait(20);
    TestBed.tick();
    expect(calls).toBe(4); // 1 (failed) + reload + id 2 + back to id 1: no cache
  });

  it('Q17.29 model() writes back to the parent signal synchronously', async () => {
    const { lines, log } = recorder();
    @Component({ selector: 'lab-q29-child', template: '' })
    class Child {
      readonly value = model(0);
      increment(): void {
        this.value.update((v) => v + 1);
      }
    }
    @Component({ selector: 'lab-q29', imports: [Child], template: '<lab-q29-child [(value)]="count" />' })
    class Parent {
      readonly count = signal(5);
    }
    const fixture = TestBed.createComponent(Parent);
    await fixture.whenStable();
    const child = fixture.debugElement.children[0]!.componentInstance as Child;
    log(child.value());
    child.increment();
    log(fixture.componentInstance.count());
    fixture.componentInstance.count.set(42);
    log(child.value());
    await fixture.whenStable();
    log(child.value());
    expect(lines).toEqual(['5', '6', '6', '42']);
  });

  it('Q17.34 a diamond is glitch-free: the bottom node never sees mixed values', () => {
    const { lines, log } = recorder();
    const a = signal(1);
    const b = computed(() => a() * 2);
    const c = computed(() => a() * 3);
    const d = computed(() => {
      const result = `${b()}+${c()}`;
      log('d computes', result);
      return result;
    });
    d();
    a.set(2);
    d();
    expect(lines).toEqual(['d computes 2+3', 'd computes 4+6']);
  });

  it('Q17.35 set-and-set-back re-runs an effect; an equal computed result does not', () => {
    const { lines, log } = recorder();
    const injector = TestBed.inject(Injector);
    const s = signal(1);
    const parity = computed(() => s() % 2);
    effect(() => log('direct', s()), { injector });
    effect(() => log('via computed', parity()), { injector });
    TestBed.tick();
    s.set(2);
    s.set(1); // back to the original value before the flush
    TestBed.tick();
    s.set(3); // parity stays 1
    TestBed.tick();
    expect(lines).toEqual(['direct 1', 'via computed 1', 'direct 1', 'direct 3']);
  });

  it('Q17.37 toSignal before the first emission and after an error', () => {
    const { lines, log } = recorder();
    TestBed.runInInjectionContext(() => {
      const events = new Subject<number>();
      const latest = toSignal(events);
      const withInitial = toSignal(events, { initialValue: -1 });
      log(latest(), withInitial());
      events.next(1);
      log(latest(), withInitial());
      events.error(new Error('stream failed'));
      try {
        latest();
      } catch (e) {
        log('threw', (e as Error).message);
      }
    });
    expect(lines).toEqual(['undefined -1', '1 1', 'threw stream failed']);
  });
});
