// labs/angular/src/app/modules/16-dependency-injection/outputs/q16-outputs.spec.ts
// Each test reproduces one "Output" question from Module 16 and asserts the exact lines the answer
// prints. If Angular changes behaviour, this file fails first.
import {
  Component,
  createEnvironmentInjector,
  Directive,
  EnvironmentInjector,
  inject,
  Injectable,
  InjectionToken,
  Injector,
  Service,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

// Q16.16: a service no injector provides until a route lists it, and a token with a root default.
@Injectable()
class RouteScoped {}

const ROUTE_WHO = new InjectionToken<string>('lab-q16-16-who', {
  providedIn: 'root',
  factory: () => 'root',
});

@Component({ selector: 'lab-q16-16-scoped', template: '' })
class ReadsRouteScoped {
  readonly scoped = inject(RouteScoped);
}

@Component({ selector: 'lab-q16-16-who', template: '' })
class ReadsRouteWho {
  readonly who = inject(ROUTE_WHO);
}

const routes16: Routes = [
  { path: 'a', component: ReadsRouteScoped, providers: [RouteScoped] },
  { path: 'b', component: ReadsRouteScoped, providers: [RouteScoped] },
  {
    path: 'shell',
    providers: [{ provide: ROUTE_WHO, useValue: 'shell' }],
    children: [
      {
        path: 'a',
        component: ReadsRouteWho,
        providers: [{ provide: ROUTE_WHO, useValue: 'route-a' }],
      },
      { path: 'b', component: ReadsRouteWho },
    ],
  },
];

// Q16.17: Parent provides 'parent', Child provides 'child', Probe sits in Child's view and provides nothing.
const TREE_WHO = new InjectionToken<string>('lab-q16-17-who', {
  providedIn: 'root',
  factory: () => 'root',
});

// Reads a token and returns the start of the error message instead of throwing.
function nodeError(read: () => string | null): string | null {
  try {
    return read();
  } catch (error) {
    return (
      /^NG0201: No provider for InjectionToken \S+ found in NodeInjector/.exec(
        (error as Error).message,
      )?.[0] ?? 'other error'
    );
  }
}

@Component({ selector: 'lab-q16-17-probe', template: '' })
class TreeProbe {
  readonly plain = inject(TREE_WHO);
  readonly optional = inject(TREE_WHO, { optional: true });
  readonly selfOptional = inject(TREE_WHO, { self: true, optional: true });
  readonly skipSelf = inject(TREE_WHO, { skipSelf: true });
  readonly host = nodeError(() => inject(TREE_WHO, { host: true }));
  readonly hostOptional = inject(TREE_WHO, { host: true, optional: true });
}

@Component({
  selector: 'lab-q16-17-child',
  imports: [TreeProbe],
  providers: [{ provide: TREE_WHO, useValue: 'child' }],
  template: '<lab-q16-17-probe />',
})
class TreeChild {
  readonly plain = inject(TREE_WHO);
  readonly self = inject(TREE_WHO, { self: true });
  readonly skipSelf = inject(TREE_WHO, { skipSelf: true });
  readonly host = nodeError(() => inject(TREE_WHO, { host: true }));
  readonly hostSkipSelf = nodeError(() => inject(TREE_WHO, { host: true, skipSelf: true }));
}

@Component({
  selector: 'lab-q16-17-parent',
  imports: [TreeChild],
  providers: [{ provide: TREE_WHO, useValue: 'parent' }],
  template: '<lab-q16-17-child />',
})
class TreeParent {}

// Q16.20: Field lists SHARED in providers and VIEW_ONLY in viewProviders; Host provides its own VIEW_ONLY.
const SHARED_20 = new InjectionToken<string>('lab-q16-20-shared');
const VIEW_ONLY_20 = new InjectionToken<string>('lab-q16-20-view-only');

@Directive({ selector: '[labQ1620Probe]' })
class FieldProbe {
  readonly shared = inject(SHARED_20);
  readonly viewOnly = inject(VIEW_ONLY_20);
}

@Component({
  selector: 'lab-q16-20-field',
  imports: [FieldProbe],
  providers: [{ provide: SHARED_20, useValue: 'field-providers' }],
  viewProviders: [{ provide: VIEW_ONLY_20, useValue: 'field-view-providers' }],
  template: '<span class="in-view" labQ1620Probe></span><ng-content />',
})
class OutputField {}

@Component({
  selector: 'lab-q16-20-host',
  imports: [OutputField, FieldProbe],
  providers: [{ provide: VIEW_ONLY_20, useValue: 'host-providers' }],
  template: '<lab-q16-20-field><span class="projected" labQ1620Probe></span></lab-q16-20-field>',
})
class OutputHost {}

// Q16.28: ngOnDestroy calls are logged. Early and Late are listed in the injector; RootDest is provided in root.
const destroyLog28: string[] = [];

@Service({ autoProvided: false })
class EarlyDest {
  ngOnDestroy(): void {
    destroyLog28.push('EarlyDest.ngOnDestroy');
  }
}

@Service({ autoProvided: false })
class LateDest {
  ngOnDestroy(): void {
    destroyLog28.push('LateDest.ngOnDestroy');
  }
}

@Service()
class RootDest {
  ngOnDestroy(): void {
    destroyLog28.push('RootDest.ngOnDestroy');
  }
}

// Q16.34: a root service, and a component that lists the same class in its own providers.
@Service()
class Notifier34 {
  text(): string {
    return 'real';
  }
}

@Component({ selector: 'lab-q16-34-local', providers: [Notifier34], template: '{{ text }}' })
class LocalNotifier34 {
  protected readonly text = inject(Notifier34).text();
}

const fake34 = { text: () => 'fake' };

function renderLocal34(): string {
  const fixture = TestBed.createComponent(LocalNotifier34);
  fixture.detectChanges();
  return fixture.nativeElement.textContent;
}

describe('Module 16 output questions', () => {
  it('Q16.05 useExisting returns the target instance, useClass builds another, and the constructor runs twice', () => {
    let built = 0;

    @Injectable()
    class Mailer {
      constructor() {
        built++;
      }
    }

    class MailerAlias {}
    class MailerCopy {}

    TestBed.configureTestingModule({
      providers: [
        Mailer,
        { provide: MailerAlias, useExisting: Mailer },
        { provide: MailerCopy, useClass: Mailer },
      ],
    });

    const target = TestBed.inject(Mailer);
    const lines = [
      `alias is target: ${TestBed.inject(MailerAlias) === target}`,
      `copy is target: ${TestBed.inject(MailerCopy) === target}`,
      `copy is copy: ${TestBed.inject(MailerCopy) === TestBed.inject(MailerCopy)}`,
      `constructed: ${built}`,
    ];

    expect(lines).toEqual([
      'alias is target: true',
      'copy is target: false',
      'copy is copy: true',
      'constructed: 2',
    ]);
  });

  it('Q16.16 sibling routes hold different instances, a revisited route keeps its own, and the root sees none', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes16)] });
    const harness = await RouterTestingHarness.create();

    const firstA = await harness.navigateByUrl('/a', ReadsRouteScoped);
    const b = await harness.navigateByUrl('/b', ReadsRouteScoped);
    const againA = await harness.navigateByUrl('/a', ReadsRouteScoped);
    const shellB = await harness.navigateByUrl('/shell/b', ReadsRouteWho);
    const shellA = await harness.navigateByUrl('/shell/a', ReadsRouteWho);
    const lines = [
      `a differs from b: ${firstA.scoped !== b.scoped}`,
      `a again is first a: ${againA.scoped === firstA.scoped}`,
      `root has RouteScoped: ${TestBed.inject(RouteScoped, null, { optional: true }) !== null}`,
      `shell/b who: ${shellB.who}`,
      `shell/a who: ${shellA.who}`,
      `root who: ${TestBed.inject(ROUTE_WHO)}`,
    ];

    expect(lines).toEqual([
      'a differs from b: true',
      'a again is first a: true',
      'root has RouteScoped: false',
      'shell/b who: shell',
      'shell/a who: route-a',
      'root who: root',
    ]);
  });

  it('Q16.17 self, skipSelf, host and optional return these values from Child and from a Probe in its view', () => {
    const parent = TestBed.createComponent(TreeParent);
    parent.detectChanges();
    const child = parent.debugElement.children[0].componentInstance as TreeChild;
    const probe = parent.debugElement.children[0].children[0].componentInstance as TreeProbe;
    const lines = [
      `child plain: ${child.plain}`,
      `child self: ${child.self}`,
      `child skipSelf: ${child.skipSelf}`,
      `child host: ${child.host}`,
      `child host+skipSelf: ${child.hostSkipSelf}`,
      `probe plain: ${probe.plain}`,
      `probe optional: ${probe.optional}`,
      `probe self+optional: ${probe.selfOptional}`,
      `probe skipSelf: ${probe.skipSelf}`,
      `probe host: ${probe.host}`,
      `probe host+optional: ${probe.hostOptional}`,
    ];

    expect(lines).toEqual([
      'child plain: child',
      'child self: child',
      'child skipSelf: parent',
      'child host: child',
      'child host+skipSelf: NG0201: No provider for InjectionToken lab-q16-17-who found in NodeInjector',
      'probe plain: child',
      'probe optional: child',
      'probe self+optional: null',
      'probe skipSelf: child',
      'probe host: NG0201: No provider for InjectionToken lab-q16-17-who found in NodeInjector',
      'probe host+optional: null',
    ]);
  });

  it('Q16.20 a view directive reads both field tokens and a projected directive reads providers but the host for viewProviders', () => {
    const fixture = TestBed.createComponent(OutputHost);
    const inView = fixture.debugElement.query(By.css('.in-view')).injector.get(FieldProbe);
    const projected = fixture.debugElement.query(By.css('.projected')).injector.get(FieldProbe);
    const lines = [
      `view shared: ${inView.shared}`,
      `view viewOnly: ${inView.viewOnly}`,
      `projected shared: ${projected.shared}`,
      `projected viewOnly: ${projected.viewOnly}`,
    ];

    expect(lines).toEqual([
      'view shared: field-providers',
      'view viewOnly: field-view-providers',
      'projected shared: field-providers',
      'projected viewOnly: host-providers',
    ]);
  });

  it('Q16.28 destroying an environment injector runs ngOnDestroy of the instances it built, not the root one, and get then throws NG0205', () => {
    destroyLog28.length = 0;
    const injector = createEnvironmentInjector(
      [EarlyDest, LateDest],
      TestBed.inject(EnvironmentInjector),
    );
    injector.get(LateDest);
    injector.get(EarlyDest);
    const viaChild = injector.get(RootDest);
    const before = `destroyed ${injector.destroyed}, log [${destroyLog28.join(', ')}]`;

    injector.destroy();

    let afterGet = 'no error';
    try {
      injector.get(EarlyDest);
    } catch (error) {
      afterGet = (error as Error).message.split(' Find more')[0];
    }
    const lines = [
      `before: ${before}`,
      `after: destroyed ${injector.destroyed}, log [${destroyLog28.join(', ')}]`,
      `get after destroy: ${afterGet}`,
      `root service is still the same one: ${TestBed.inject(RootDest) === viaChild}`,
    ];

    expect(lines).toEqual([
      'before: destroyed false, log []',
      'after: destroyed true, log [LateDest.ngOnDestroy, EarlyDest.ngOnDestroy]',
      'get after destroy: NG0205: Injector has already been destroyed.',
      'root service is still the same one: true',
    ]);
  });

  it('Q16.34 module providers and overrideProvider replace the root service only, overrideComponent replaces the component-level one', () => {
    TestBed.configureTestingModule({ providers: [{ provide: Notifier34, useValue: fake34 }] });
    const rootConsumer = TestBed.inject(Notifier34).text();
    const withProviders = renderLocal34();
    TestBed.resetTestingModule();
    TestBed.overrideProvider(Notifier34, { useValue: fake34 });
    const withOverrideProvider = renderLocal34();
    TestBed.resetTestingModule();
    TestBed.overrideComponent(LocalNotifier34, {
      set: { providers: [{ provide: Notifier34, useValue: fake34 }] },
    });
    const withOverrideComponent = renderLocal34();
    const lines = [
      `root consumer after providers: ${rootConsumer}`,
      `component after providers: ${withProviders}`,
      `component after overrideProvider: ${withOverrideProvider}`,
      `component after overrideComponent: ${withOverrideComponent}`,
    ];

    expect(lines).toEqual([
      'root consumer after providers: fake',
      'component after providers: real',
      'component after overrideProvider: real',
      'component after overrideComponent: fake',
    ]);
  });
});
