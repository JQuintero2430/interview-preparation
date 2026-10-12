import {
  Component,
  EnvironmentInjector,
  inject,
  InjectionToken,
  Injector,
  Optional,
  Inject,
  Self,
  SkipSelf,
  Service,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Routes } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

// A token with a root default, so every lookup that falls through to the environment tree answers 'root'.
const WHO = new InjectionToken<string>('lab-s5-who', {
  providedIn: 'root',
  factory: () => 'root',
});

// A token nobody provides, to see what each modifier returns when nothing answers.
// Reads a token and returns the error message instead of throwing, so one component can report every modifier.
function attempt<T>(read: () => T): T | string {
  try {
    return read();
  } catch (error) {
    return (error as Error).message;
  }
}

const LONELY = new InjectionToken<string>('lab-s5-lonely');

// Counts constructions so a test can tell instances apart.
let scopedBuilt = 0;

// Registered only where a route (or a providers array) lists it, so the root cannot supply it.
@Service({ autoProvided: false })
class Scoped {
  readonly id = ++scopedBuilt;
}

@Component({ selector: 'lab-s5-reads-who', template: '' })
class ReadsWho {
  readonly who = inject(WHO);
}

@Component({ selector: 'lab-s5-reads-scoped', template: '' })
class ReadsScoped {
  readonly scoped = inject(Scoped);
}

// The element tree: an outer component provides WHO, an inner one asks for it.
@Component({ selector: 'lab-s5-inner', template: '' })
class Inner {
  readonly who = inject(WHO);
}

@Component({
  selector: 'lab-s5-outer',
  imports: [Inner],
  providers: [{ provide: WHO, useValue: 'outer' }],
  template: '<lab-s5-inner />',
})
class Outer {}

// Modifiers: the probe sits in Child's view, Child under Parent.
@Component({ selector: 'lab-s5-probe', template: '' })
class Probe {
  readonly plain = inject(WHO);
  readonly optional = inject(WHO, { optional: true });
  readonly selfOptional = inject(WHO, { self: true, optional: true });
  readonly skipSelf = inject(WHO, { skipSelf: true });
  readonly host = attempt(() => inject(WHO, { host: true }));
  readonly hostOptional = inject(WHO, { host: true, optional: true });
}

@Component({
  selector: 'lab-s5-child',
  imports: [Probe],
  providers: [{ provide: WHO, useValue: 'child' }],
  template: '<lab-s5-probe />',
})
class Child {
  readonly plain = inject(WHO);
  readonly self = inject(WHO, { self: true });
  readonly skipSelf = inject(WHO, { skipSelf: true });
  readonly host = attempt(() => inject(WHO, { host: true }));
  readonly hostOptional = inject(WHO, { host: true, optional: true });
  readonly hostSkipSelf = attempt(() => inject(WHO, { host: true, skipSelf: true }));
  readonly lonely = inject(LONELY, { optional: true });
  readonly injector = inject(Injector);
}

// The same questions through the older decorators, in a component that provides 'child' under the same parent.
@Component({
  selector: 'lab-s5-legacy',
  template: '',
  providers: [{ provide: WHO, useValue: 'child' }],
})
class Legacy {
  constructor(
    @Inject(WHO) @Self() readonly self: string,
    @Inject(WHO) @SkipSelf() readonly skipSelf: string,
    @Inject(LONELY) @Optional() readonly lonely: string | null,
  ) {}
}

@Component({
  selector: 'lab-s5-parent',
  imports: [Child, Legacy],
  providers: [{ provide: WHO, useValue: 'parent' }],
  template: '<lab-s5-child /><lab-s5-legacy />',
})
class Parent {}

// Routes: each provider list below creates one route injector.
const routes: Routes = [
  { path: 'a', component: ReadsScoped, providers: [Scoped] },
  { path: 'b', component: ReadsScoped, providers: [Scoped] },
  {
    path: 'shell',
    providers: [{ provide: WHO, useValue: 'shell' }],
    children: [
      { path: 'a', component: ReadsWho, providers: [{ provide: WHO, useValue: 'route-a' }] },
      { path: 'b', component: ReadsWho },
    ],
  },
];

const NOT_IN_NODE = /^NG0201: No provider for InjectionToken lab-s5-who found in NodeInjector/;

describe('Section 5: the injector tree', () => {
  beforeEach(() => {
    scopedBuilt = 0;
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
  });

  it('Section 5: the element tree is searched before the environment tree', () => {
    const outer = TestBed.createComponent(Outer);
    const inner = outer.debugElement.children[0].componentInstance as Inner;
    const alone = TestBed.createComponent(Inner).componentInstance;

    expect(inner.who).toBe('outer');
    expect(alone.who).toBe('root');
    expect(TestBed.inject(WHO)).toBe('root');
  });

  it('Section 5: a route with providers creates its own injector and sibling routes get different instances', async () => {
    const harness = await RouterTestingHarness.create();
    const a = await harness.navigateByUrl('/a', ReadsScoped);
    const b = await harness.navigateByUrl('/b', ReadsScoped);

    expect(a.scoped).not.toBe(b.scoped);
    expect(a.scoped.id).not.toBe(b.scoped.id);
  });

  it('Section 5: revisiting a route reuses its injector', async () => {
    const harness = await RouterTestingHarness.create();
    const first = await harness.navigateByUrl('/a', ReadsScoped);
    await harness.navigateByUrl('/b', ReadsScoped);
    const again = await harness.navigateByUrl('/a', ReadsScoped);

    expect(again).not.toBe(first);
    expect(again.scoped).toBe(first.scoped);
  });

  it("Section 5: a parent route's provider is overridden by a child route's", async () => {
    const harness = await RouterTestingHarness.create();

    expect((await harness.navigateByUrl('/shell/a', ReadsWho)).who).toBe('route-a');
    expect((await harness.navigateByUrl('/shell/b', ReadsWho)).who).toBe('shell');
  });

  it('Section 5: the root injector does not see route providers', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/shell/a', ReadsWho);
    await harness.navigateByUrl('/a', ReadsScoped);

    expect(TestBed.inject(WHO)).toBe('root');
    expect(TestBed.inject(Scoped, null, { optional: true })).toBeNull();
  });

  it('Section 5: self, skipSelf, host and optional change where the walk starts and stops', () => {
    const parent = TestBed.createComponent(Parent);
    parent.detectChanges();
    const child = parent.debugElement.children[0].componentInstance as Child;
    const probe = parent.debugElement.children[0].children[0].componentInstance as Probe;

    expect(child.plain).toBe('child');
    expect(child.self).toBe('child');
    expect(child.skipSelf).toBe('parent');
    expect(child.host).toBe('child');
    expect(child.hostSkipSelf).toMatch(NOT_IN_NODE);
    expect(child.lonely).toBeNull();

    expect(probe.plain).toBe('child');
    expect(probe.optional).toBe('child');
    expect(probe.selfOptional).toBeNull();
    expect(probe.skipSelf).toBe('child');
    expect(probe.host).toMatch(NOT_IN_NODE);
    expect(probe.hostOptional).toBeNull();
  });

  it('Section 5: the older decorators give the same answers as the options object', () => {
    const parent = TestBed.createComponent(Parent);
    parent.detectChanges();
    const legacy = parent.debugElement.children[1].componentInstance as Legacy;

    expect(legacy.self).toBe('child');
    expect(legacy.skipSelf).toBe('parent');
    expect(legacy.lonely).toBeNull();
  });

  it('Section 5: an injector read in a component answers from that element', () => {
    const parent = TestBed.createComponent(Parent);
    parent.detectChanges();
    const child = parent.debugElement.children[0].componentInstance as Child;

    expect(child.injector.get(WHO)).toBe('child');
    expect(TestBed.inject(Injector).get(WHO)).toBe('root');
    const environment = TestBed.inject(EnvironmentInjector);
    expect(environment.get(Injector)).toBe(environment);
  });

  it('Section 5: the null injector at the top of the tree throws NG0201 or returns the fallback', () => {
    expect(() => Injector.NULL.get(LONELY)).toThrowError(
      /^NG0201: No provider found for `?InjectionToken lab-s5-lonely/,
    );
    expect(Injector.NULL.get(LONELY, 'fallback')).toBe('fallback');
  });
});
