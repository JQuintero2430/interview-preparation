import {
  Component,
  createEnvironmentInjector,
  DestroyRef,
  EnvironmentInjector,
  forwardRef,
  inject,
  InjectionToken,
  Injector,
  Service,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

// Records which services were destroyed, in order, so a test can read them.
const destroyedLog: string[] = [];

// Provided only where a providers array lists it, so the injector that lists it owns its lifetime.
@Service({ autoProvided: false })
class FeatureCache {
  ngOnDestroy(): void {
    destroyedLog.push('FeatureCache');
  }
}

// Provided in root: its instance lives in the root injector, whoever asks for it.
@Service()
class RootAudit {
  ngOnDestroy(): void {
    destroyedLog.push('RootAudit');
  }
}

// Registers cleanup on the DestroyRef of whatever injector built it.
@Service({ autoProvided: false })
class SelfCleaning {
  readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.destroyRef.onDestroy(() => destroyedLog.push('SelfCleaning callback'));
  }
}

const GREETING = new InjectionToken<string>('lab-s8-greeting');

// Two services that inject each other through field initializers: Chicken is declared before Egg.
@Service({ autoProvided: false })
class Chicken {
  readonly egg = inject(Egg);
}

@Service({ autoProvided: false })
class Egg {
  readonly chicken = inject(Chicken);
}

// A component whose providers hold the cycle, so the error can name the component in its path.
@Component({ selector: 'lab-s8-cycle-host', template: '', providers: [Chicken, Egg] })
class CycleHost {
  readonly chicken = inject(Chicken);
}

// The same cycle with a forward reference on one side: the reference is deferred, the cycle stays.
@Service({ autoProvided: false })
class Left {
  readonly right = inject(forwardRef(() => Right));
}

@Service({ autoProvided: false })
class Right {
  readonly left = inject(Left);
}

// Breaks the cycle: Tenant asks for Landlord only when a method runs, through the Injector.
@Service({ autoProvided: false })
class Landlord {
  readonly tenant = inject(Tenant);
}

@Service({ autoProvided: false })
class Tenant {
  private readonly injector = inject(Injector);

  landlord(): Landlord {
    return this.injector.get(Landlord);
  }
}

// Lists a class declared further down: without forwardRef this is TS2449.
@Component({
  selector: 'lab-s8-early-host',
  template: '',
  providers: [forwardRef(() => LaterGreeter)],
})
class EarlyHost {
  readonly greeter = inject(LaterGreeter);
}

@Service({ autoProvided: false })
class LaterGreeter {
  readonly text = 'declared after its use';
}

@Component({ selector: 'lab-s8-destroy-host', template: '' })
class DestroyHost {
  readonly destroyRef = inject(DestroyRef);
}

describe('Section 8: lifetime, dynamic injectors, forward references and cycles', () => {
  beforeEach(() => {
    destroyedLog.length = 0;
  });

  it('Section 8: DestroyRef.onDestroy callbacks run once and can be removed', () => {
    const injector = createEnvironmentInjector([], TestBed.inject(EnvironmentInjector));
    const ref = injector.get(DestroyRef);
    const calls: string[] = [];

    ref.onDestroy(() => calls.push('kept'));
    const removeSecond = ref.onDestroy(() => calls.push('removed'));
    removeSecond();
    expect(ref.destroyed).toBe(false);

    injector.destroy();

    expect(calls).toEqual(['kept']);
    expect(ref.destroyed).toBe(true);
  });

  it('Section 8: destroying an environment injector destroys its instances and further get is NG0205', () => {
    const injector = createEnvironmentInjector([FeatureCache], TestBed.inject(EnvironmentInjector));
    injector.get(FeatureCache);
    expect(destroyedLog).toEqual([]);

    injector.destroy();

    expect(destroyedLog).toEqual(['FeatureCache']);
    expect(injector.destroyed).toBe(true);
    expect(() => injector.get(FeatureCache)).toThrowError(
      'NG0205: Injector has already been destroyed. Find more at https://v22.angular.dev/errors/NG0205',
    );
  });

  it('Section 8: a root service reached through a child injector is not destroyed with it', () => {
    const injector = createEnvironmentInjector([], TestBed.inject(EnvironmentInjector));
    const viaChild = injector.get(RootAudit);

    injector.destroy();

    expect(destroyedLog).toEqual([]);
    expect(TestBed.inject(RootAudit)).toBe(viaChild);
  });

  it("Section 8: a service's DestroyRef belongs to its injector and a component's to the component", () => {
    const injector = createEnvironmentInjector([SelfCleaning], TestBed.inject(EnvironmentInjector));
    const service = injector.get(SelfCleaning);
    expect(service.destroyRef).toBe(injector.get(DestroyRef));
    injector.destroy();
    expect(destroyedLog).toEqual(['SelfCleaning callback']);
    expect(() => service.destroyRef.onDestroy(() => undefined)).toThrowError(
      'NG0205: Injector has already been destroyed. Find more at https://v22.angular.dev/errors/NG0205',
    );

    const fixture = TestBed.createComponent(DestroyHost);
    expect(fixture.componentInstance.destroyRef.destroyed).toBe(false);
    fixture.destroy();
    expect(fixture.componentInstance.destroyRef.destroyed).toBe(true);
  });

  it('Section 8: createEnvironmentInjector reaches parent providers', () => {
    const parent = createEnvironmentInjector(
      [{ provide: GREETING, useValue: 'from parent' }],
      TestBed.inject(EnvironmentInjector),
    );
    const child = createEnvironmentInjector([FeatureCache], parent);

    expect(child.get(GREETING)).toBe('from parent');
    expect(child.get(FeatureCache)).toBeInstanceOf(FeatureCache);
    expect(parent.get(FeatureCache, null)).toBeNull();
  });

  it("Section 8: Injector.create resolves its own providers and its parent's", () => {
    const parent = Injector.create({ providers: [{ provide: GREETING, useValue: 'from parent' }] });
    const child = Injector.create({ providers: [FeatureCache], parent });

    expect(child.get(GREETING)).toBe('from parent');
    expect(child.get(FeatureCache)).toBe(child.get(FeatureCache));
    expect(parent.get(FeatureCache, null)).toBeNull();
    expect(child.get(Injector)).toBe(child);
  });

  it('Section 8: Injector.create destroy runs ngOnDestroy of its instances and further get is NG0205', () => {
    const injector = Injector.create({ providers: [FeatureCache] });
    injector.get(FeatureCache);
    expect(destroyedLog).toEqual([]);

    injector.destroy();

    expect(destroyedLog).toEqual(['FeatureCache']);
    expect(() => injector.get(FeatureCache)).toThrowError(
      'NG0205: Injector has already been destroyed. Find more at https://v22.angular.dev/errors/NG0205',
    );
  });

  it('Section 8: a circular dependency is NG0200 with a path from a component', () => {
    expect(() => TestBed.createComponent(CycleHost)).toThrowError(
      /^NG0200: Circular dependency detected for `_?Chicken`\. Path: _?CycleHost -> _?Chicken -> _?Egg -> _?Chicken\. Find more at https:\/\/v22\.angular\.dev\/errors\/NG0200$/,
    );
  });

  it('Section 8: a circular dependency between injector services is NG0200 with a path', () => {
    const injector = createEnvironmentInjector([Chicken, Egg], TestBed.inject(EnvironmentInjector));

    expect(() => injector.get(Chicken)).toThrowError(
      /^NG0200: Circular dependency detected for `_?Chicken`\. Path: _?Chicken -> _?Egg -> _?Chicken\. Find more at https:\/\/v22\.angular\.dev\/errors\/NG0200$/,
    );
  });

  it('Section 8: forwardRef does not break a circular dependency', () => {
    const injector = createEnvironmentInjector([Left, Right], TestBed.inject(EnvironmentInjector));

    expect(() => injector.get(Left)).toThrowError(
      /^NG0200: Circular dependency detected for `_?Left`\. Path: _?Left -> _?Right -> _?Left\./,
    );
  });

  it('Section 8: injecting the Injector and reading lazily breaks the cycle', () => {
    const injector = createEnvironmentInjector([Landlord, Tenant], TestBed.inject(EnvironmentInjector));

    const landlord = injector.get(Landlord);

    expect(landlord.tenant.landlord()).toBe(landlord);
  });

  it('Section 8: forwardRef lets a provider list name a class declared later', () => {
    const fixture = TestBed.createComponent(EarlyHost);

    expect(fixture.componentInstance.greeter.text).toBe('declared after its use');
  });
});
