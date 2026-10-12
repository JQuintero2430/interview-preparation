import {
  assertInInjectionContext,
  Component,
  inject,
  InjectionToken,
  Injector,
  injectAsync,
  OnInit,
  runInInjectionContext,
  Service,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

// A root service every test asks for, with a unique name so assertions read clearly.
@Service()
class Clock {
  readonly name = 'clock';
}

// A token whose own factory calls inject(): a factory is an injection context.
const STAMP = new InjectionToken<string>('lab-s4-stamp', {
  providedIn: 'root',
  factory: () => `stamp of ${inject(Clock).name}`,
});

const LABEL = new InjectionToken<string>('lab-s4-label');

// inject() in a constructor, in a field initializer and in a provider factory.
@Component({
  selector: 'lab-s4-places',
  template: '',
  providers: [{ provide: LABEL, useFactory: () => `label of ${inject(Clock).name}` }],
})
class Places {
  readonly inField = inject(Clock);
  readonly inConstructor: Clock;
  readonly label = inject(LABEL);
  readonly stamp = inject(STAMP);

  constructor() {
    this.inConstructor = inject(Clock);
  }
}

// inject() in a lifecycle hook and in an ordinary method, neither of which is an injection context.
@Component({ selector: 'lab-s4-late', template: '' })
class Late implements OnInit {
  failureInHook = '';

  ngOnInit(): void {
    try {
      inject(Clock);
    } catch (error) {
      this.failureInHook = (error as Error).message;
    }
  }

  onClick(): Clock {
    return inject(Clock);
  }
}

// A helper that wraps inject() and says its own name when it is called too early.
function injectClock(): Clock {
  assertInInjectionContext(injectClock);
  return inject(Clock);
}

@Component({ selector: 'lab-s4-helper', template: '' })
class UsesHelper {
  readonly clock = injectClock();
}

// A service that captures its injector once and uses it later, outside any context.
@Service()
class Deferred {
  private readonly injector = inject(Injector);

  later(): Clock {
    return runInInjectionContext(this.injector, () => inject(Clock));
  }

  afterAwait(): Promise<Clock> {
    return runInInjectionContext(this.injector, async () => {
      await Promise.resolve();
      return inject(Clock);
    });
  }
}

// The service injectAsync loads: it must register itself, so it is a root service.
@Service()
class Exporter {
  readonly kind = 'exporter';
}

// A service nothing registers: injectAsync loads its class but the injector has no recipe to build it.
@Service({ autoProvided: false })
class Unregistered {}

@Component({ selector: 'lab-s4-lazy', template: '' })
class Lazy {
  loads = 0;
  readonly exporter = injectAsync(() => {
    this.loads++;
    return Promise.resolve(Exporter);
  });
}

// The runtime texts of NG0203 (the build under test mangles a class name with a leading underscore).
const WHERE =
  'can only be used within an injection context such as a constructor, a factory function, a field initializer, or a function used with `runInInjectionContext`. Find more at https://v22.angular.dev/errors/NG0203';
const NOT_IN_CONTEXT_CLOCK =
  /^NG0203: The `_?Clock` token injection failed\. `inject\(\)` function must be called from an injection context such as a constructor, a factory function, a field initializer, or a function used with `runInInjectionContext`\. Find more at https:\/\/v22\.angular\.dev\/errors\/NG0203$/;

describe('Section 4: the injection context', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('Section 4: inject works in a constructor, a field initializer and a provider factory', () => {
    const places = TestBed.createComponent(Places).componentInstance;
    const root = TestBed.inject(Clock);

    expect(places.inConstructor).toBe(root);
    expect(places.inField).toBe(root);
    expect(places.label).toBe('label of clock');
    expect(places.stamp).toBe('stamp of clock');
  });

  it('Section 4: inject in ngOnInit throws NG0203', () => {
    const fixture = TestBed.createComponent(Late);
    fixture.detectChanges();

    expect(fixture.componentInstance.failureInHook).toMatch(NOT_IN_CONTEXT_CLOCK);
    expect(() => fixture.componentInstance.onClick()).toThrowError(NOT_IN_CONTEXT_CLOCK);
  });

  it('Section 4: assertInInjectionContext names the helper', () => {
    expect(() => injectClock()).toThrowError(`NG0203: injectClock() ${WHERE}`);
    expect(TestBed.createComponent(UsesHelper).componentInstance.clock).toBe(TestBed.inject(Clock));
  });

  it('Section 4: runInInjectionContext lets a function inject with a captured injector', () => {
    const deferred = TestBed.inject(Deferred);

    expect(deferred.later()).toBe(TestBed.inject(Clock));
  });

  it('Section 4: the injector passed to runInInjectionContext decides the answer', () => {
    const other = new Clock();
    const child = Injector.create({
      providers: [{ provide: Clock, useValue: other }],
      parent: TestBed.inject(Injector),
    });

    expect(runInInjectionContext(child, () => inject(Clock))).toBe(other);
    expect(runInInjectionContext(TestBed.inject(Injector), () => inject(Clock))).toBe(
      TestBed.inject(Clock),
    );
  });

  it('Section 4: inject after an await throws NG0203', async () => {
    await expect(TestBed.inject(Deferred).afterAwait()).rejects.toThrowError(/NG0203/);
  });

  it('Section 4: TestBed.runInInjectionContext runs a helper', () => {
    expect(TestBed.runInInjectionContext(() => injectClock())).toBe(TestBed.inject(Clock));
  });

  it('Section 4: injectAsync loads once, returns a new promise per call and needs a context', async () => {
    const lazy = TestBed.createComponent(Lazy).componentInstance;

    expect(lazy.loads).toBe(0);

    const first = lazy.exporter();
    const second = lazy.exporter();

    expect(first).not.toBe(second);
    expect(await first).toBe(await second);
    expect(await first).toBe(TestBed.inject(Exporter));
    expect(lazy.loads).toBe(1);
    expect(() => injectAsync(() => Promise.resolve(Exporter))).toThrowError(
      `NG0203: injectAsync() ${WHERE}`,
    );
  });

  it('Section 4: injectAsync accepts a module with a default export', async () => {
    const load = TestBed.runInInjectionContext(() =>
      injectAsync(() => Promise.resolve({ default: Exporter })),
    );

    expect(await load()).toBe(TestBed.inject(Exporter));
  });

  it('Section 4: injectAsync prefetch loads early and a failed load stays failed', async () => {
    let loads = 0;
    const load = TestBed.runInInjectionContext(() =>
      injectAsync(
        () => {
          loads++;
          return Promise.reject<typeof Exporter>(new Error('chunk failed'));
        },
        { prefetch: () => Promise.resolve() },
      ),
    );

    await new Promise((resolve) => setTimeout(resolve));

    expect(loads).toBe(1);
    await expect(load()).rejects.toThrowError('chunk failed');
    await expect(load()).rejects.toThrowError('chunk failed');
    expect(loads).toBe(1);
  });

  it('Section 4: injectAsync of an unregistered service fails with NG0201', async () => {
    const load = TestBed.runInInjectionContext(() =>
      injectAsync(() => Promise.resolve(Unregistered)),
    );

    await expect(load()).rejects.toThrowError(/^NG0201: No provider found for `_?Unregistered`\./);
  });
});
