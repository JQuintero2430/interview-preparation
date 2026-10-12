import {
  Component,
  Directive,
  HOST_TAG_NAME,
  HostAttributeToken,
  inject,
  InjectionToken,
  makeEnvironmentProviders,
  Provider,
  Service,
  signal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

// A token the field lists in providers: its content and its view can both read it.
const SHARED = new InjectionToken<string>('lab-s6-shared');

// A token the field lists in viewProviders: only the field's own view can read it.
const VIEW_ONLY = new InjectionToken<string>('lab-s6-view-only');

// Counts constructions and destructions so a test can tell instances apart.
let built = 0;
let destroyed = 0;

// Provided only in a component's providers, so every component instance builds its own.
@Service({ autoProvided: false })
class FieldState {
  readonly id = ++built;

  ngOnDestroy(): void {
    destroyed++;
  }
}

// Reports what it can reach from wherever it is placed.
@Directive({ selector: '[labS6Probe]' })
class Probe {
  readonly shared = inject(SHARED, { optional: true });
  readonly viewOnly = inject(VIEW_ONLY, { optional: true });
  readonly state = inject(FieldState, { optional: true });
}

@Component({
  selector: 'lab-s6-field',
  imports: [Probe],
  providers: [FieldState, { provide: SHARED, useValue: 'field-providers' }],
  viewProviders: [{ provide: VIEW_ONLY, useValue: 'field-view-providers' }],
  template: '<span class="in-view" labS6Probe></span><ng-content />',
})
class Field {
  readonly state = inject(FieldState);
}

// A child component inside the field's view: a view provider reaches it too.
@Component({ selector: 'lab-s6-inner', template: '' })
class Inner {
  readonly viewOnly = inject(VIEW_ONLY, { optional: true });
}

@Component({
  selector: 'lab-s6-nested-field',
  imports: [Inner],
  viewProviders: [{ provide: VIEW_ONLY, useValue: 'nested-view-providers' }],
  template: '<lab-s6-inner />',
})
class NestedField {}

// The host supplies its own VIEW_ONLY, which is what a projected probe falls back to.
@Component({
  selector: 'lab-s6-host',
  imports: [Field, Probe],
  providers: [{ provide: VIEW_ONLY, useValue: 'host-providers' }],
  template: `
    <lab-s6-field><span class="projected" labS6Probe></span></lab-s6-field>
    <lab-s6-field />
  `,
})
class Host {}

@Component({
  selector: 'lab-s6-toggle-host',
  imports: [Field],
  template: '@if (show()) { <lab-s6-field /> }',
})
class ToggleHost {
  readonly show = signal(true);
}

@Directive({ selector: '[labS6Attr]' })
class AttrReader {
  readonly theme = inject(new HostAttributeToken('theme'));
  readonly kind = inject(new HostAttributeToken('kind'), { optional: true });
}

@Directive({ selector: '[labS6Tag]' })
class TagReader {
  readonly tag = inject(HOST_TAG_NAME);
}

@Component({
  selector: 'lab-s6-host-info',
  imports: [AttrReader, TagReader],
  template: '<section labS6Attr labS6Tag theme="dark"></section>',
})
class HostInfo {}

// A component list typed as Provider[]: the cast is what lets the invalid value reach the runtime.
@Component({
  selector: 'lab-s6-bad',
  providers: [makeEnvironmentProviders([]) as unknown as Provider],
  template: '',
})
class Bad {}

describe('Section 6: providers and viewProviders', () => {
  beforeEach(() => {
    built = 0;
    destroyed = 0;
  });

  it('Section 6: each component instance gets its own provider instance', () => {
    const fixture = TestBed.createComponent(Host);
    const [first, second] = fixture.debugElement.children.map(
      (node) => node.injector.get(Field).state,
    );

    expect(first).not.toBe(second);
    expect(first.id).not.toBe(second.id);
    expect(TestBed.inject(FieldState, null, { optional: true })).toBeNull();
  });

  it('Section 6: viewProviders are visible in the view and hidden from projected content', () => {
    const fixture = TestBed.createComponent(Host);
    const inView = fixture.debugElement.query(By.css('.in-view')).injector.get(Probe);
    const projected = fixture.debugElement.query(By.css('.projected')).injector.get(Probe);

    expect(inView.viewOnly).toBe('field-view-providers');
    expect(projected.viewOnly).toBe('host-providers');
  });

  it('Section 6: providers are visible to projected content', () => {
    const fixture = TestBed.createComponent(Host);
    const probes = fixture.debugElement
      .queryAll(By.directive(Probe))
      .map((node) => node.injector.get(Probe));

    expect(probes).toHaveLength(3);
    for (const probe of probes) {
      expect(probe.shared).toBe('field-providers');
      expect(probe.state).not.toBeNull();
    }
  });

  it("Section 6: a child component in the view sees the component's viewProviders", () => {
    const fixture = TestBed.createComponent(NestedField);
    const inner = fixture.debugElement.children[0].componentInstance as Inner;

    expect(inner.viewOnly).toBe('nested-view-providers');
  });

  it('Section 6: a component-level provider is destroyed with its component', () => {
    const fixture = TestBed.createComponent(ToggleHost);
    fixture.detectChanges();
    expect(destroyed).toBe(0);

    fixture.componentInstance.show.set(false);
    fixture.detectChanges();

    expect(destroyed).toBe(1);
  });

  it('Section 6: HostAttributeToken reads an attribute and is null when optional and absent', () => {
    const fixture = TestBed.createComponent(HostInfo);
    const reader = fixture.debugElement.children[0].injector.get(AttrReader);

    expect(reader.theme).toBe('dark');
    expect(reader.kind).toBeNull();
  });

  it('Section 6: HOST_TAG_NAME reads the tag name', () => {
    const fixture = TestBed.createComponent(HostInfo);

    expect(fixture.debugElement.children[0].injector.get(TagReader).tag).toBe('section');
  });

  it("Section 6: EnvironmentProviders in a component's providers is NG0207", () => {
    expect(() => TestBed.createComponent(Bad)).toThrowError(
      /^NG0207: Invalid providers present in a non-environment injector\. 'EnvironmentProviders' can't be used for component providers\./,
    );
  });
});
