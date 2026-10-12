import { Component, createEnvironmentInjector, EnvironmentInjector, importProvidersFrom, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { GREETING_CONFIG, GreetingBanner, GreetingConfig, GreetingModule, provideGreeting } from './greeting';

const config: GreetingConfig = { text: 'Hola' };

// A standalone app's page: it imports the banner directly.
@Component({ selector: 'lab-m15-e2-standalone-home', imports: [GreetingBanner], template: '<lab-m15-e2-greeting-banner />' })
class StandaloneHome {}

// Legacy: an NgModule app whose declared page gets the banner from GreetingModule's exports.
@Component({ selector: 'lab-m15-e2-legacy-home', standalone: false, template: '<lab-m15-e2-greeting-banner />' })
class LegacyHome {}

@NgModule({ declarations: [LegacyHome], imports: [GreetingModule.forRoot(config)] })
class LegacyAppModule {}

// Legacy: a feature module that imports the declarations only.
@Component({ selector: 'lab-m15-e2-legacy-feature', standalone: false, template: '<lab-m15-e2-greeting-banner />' })
class LegacyFeature {}

@NgModule({ declarations: [LegacyFeature], imports: [GreetingModule.forChild()] })
class LegacyFeatureModule {}

@Component({
  selector: 'lab-m15-e2-misplaced',
  // @ts-expect-error EnvironmentProviders is not a Provider, so a component's providers refuse it.
  providers: [provideGreeting(config)],
  template: '',
})
class Misplaced {}

function textOf(component: new () => unknown): string {
  const fixture = TestBed.createComponent(component);
  fixture.detectChanges();
  return (fixture.nativeElement as HTMLElement).textContent?.trim() ?? '';
}

describe('E15.2 A library that serves both worlds', () => {
  it('a standalone app configured with provideGreeting renders the banner with the configured text', () => {
    TestBed.configureTestingModule({ providers: [provideGreeting(config)] });

    expect(textOf(StandaloneHome)).toBe('Hola');
  });

  it('an NgModule app importing GreetingModule.forRoot(config) renders the same banner through a declared component', () => {
    TestBed.configureTestingModule({ imports: [LegacyAppModule] });

    expect(textOf(LegacyHome)).toBe('Hola');
  });

  it('importProvidersFrom(GreetingModule.forRoot(config)) in an environment injector gives the same configuration as provideGreeting(config)', () => {
    const parent = TestBed.inject(EnvironmentInjector);

    const viaModule = createEnvironmentInjector([importProvidersFrom(GreetingModule.forRoot(config))], parent);
    const viaFunction = createEnvironmentInjector([provideGreeting(config)], parent);

    expect(viaModule.get(GREETING_CONFIG)).toBe(config);
    expect(viaFunction.get(GREETING_CONFIG)).toBe(config);
  });

  it('forChild() exports the banner but provides no configuration (the banner falls back to its default)', () => {
    TestBed.configureTestingModule({ imports: [LegacyFeatureModule] });

    expect(textOf(LegacyFeature)).toBe('Hello');
    expect(TestBed.inject(GREETING_CONFIG, null)).toBeNull();
  });

  it("provideGreeting cannot be listed in a component's providers", () => {
    // The @ts-expect-error on Misplaced fails the typecheck if the type error disappears;
    // at run time the same mistake is NG0207.
    expect(() => TestBed.createComponent(Misplaced)).toThrowError(/NG0207/);
  });

  it('a second forRoot inside a child injector throws a named error', () => {
    const root = createEnvironmentInjector(
      [importProvidersFrom(GreetingModule.forRoot(config))],
      TestBed.inject(EnvironmentInjector),
    );

    expect(() => createEnvironmentInjector([importProvidersFrom(GreetingModule.forChild())], root)).not.toThrow();
    expect(() =>
      createEnvironmentInjector([importProvidersFrom(GreetingModule.forRoot({ text: 'Hi' }))], root),
    ).toThrowError('GreetingModule.forRoot() was called twice. Use forChild() below the root.');
  });
});
