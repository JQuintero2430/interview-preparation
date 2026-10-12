import { CommonModule, NgForOf } from '@angular/common';
import {
  Component,
  createComponent,
  createEnvironmentInjector,
  EnvironmentInjector,
  inject,
  Injectable,
  NgModule,
  OnDestroy,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CatalogList, CatalogStore } from '../legacy/catalog/catalog-list';
import { CatalogModule } from '../legacy/catalog/catalog.module';
import { PricePipe } from '../legacy/catalog/price-pipe';

// The fields of the private ɵinj and ɵcmp definitions these tests read (shapes from ɵɵdefineInjector
// and ɵɵdefineComponent in @angular/core 22.2.1). Application code never reads them; the lab peeks
// to show what the compiler produced.
interface InjectorDefinition {
  providers: unknown[];
  imports: unknown[];
}

function injectorDefinitionOf(type: object): InjectorDefinition {
  return (type as { ɵinj: InjectorDefinition }).ɵinj;
}

// ɵɵdefineComponent turns the emitted dependencies into factories of directive and pipe definitions.
interface ScopeDefinition {
  directiveDefs: (() => { type: unknown }[]) | null;
  pipeDefs: (() => { type: unknown }[]) | null;
}

function scopeOf(type: object): { directives: unknown[]; pipes: unknown[] } {
  const definition = (type as { ɵcmp: ScopeDefinition }).ɵcmp;
  return {
    directives: (definition.directiveDefs?.() ?? []).map((def) => def.type),
    pipes: (definition.pipeDefs?.() ?? []).map((def) => def.type),
  };
}

// Records when the module-provided service is created and destroyed.
const events: string[] = [];

@Injectable()
class TrackedStore implements OnDestroy {
  constructor() {
    events.push('TrackedStore created');
  }

  ngOnDestroy(): void {
    events.push('TrackedStore destroyed');
  }
}

@NgModule({ providers: [TrackedStore] })
class TrackedModule {}

// A module with no providers: it still contributes its own class to an injector.
@Component({ selector: 'lab-m15-dot', template: '.' })
class Dot {}

@NgModule({ imports: [Dot], exports: [Dot] })
class DotModule {}

@Component({ selector: 'lab-m15-page-a', imports: [TrackedModule], template: 'A' })
class PageA {
  readonly store = inject(TrackedStore);
  readonly environment = inject(EnvironmentInjector);
}

@Component({ selector: 'lab-m15-page-b', imports: [TrackedModule], template: 'B' })
class PageB {
  readonly store = inject(TrackedStore);
}

@Component({ selector: 'lab-m15-plain', imports: [Dot], template: '<lab-m15-dot />' })
class Plain {
  readonly environment = inject(EnvironmentInjector);
}

@Component({ selector: 'lab-m15-dotted', imports: [DotModule], template: '<lab-m15-dot />' })
class Dotted {
  readonly environment = inject(EnvironmentInjector);
}

describe('Section 8: under the hood', () => {
  beforeEach(() => {
    events.length = 0;
  });

  it('Section 8: a standalone component gets its own environment injector only when its imports reach an NgModule', () => {
    const root = TestBed.inject(EnvironmentInjector);

    const plain = TestBed.createComponent(Plain).componentInstance;
    const dotted = TestBed.createComponent(Dotted).componentInstance;
    const page = TestBed.createComponent(PageA).componentInstance;

    expect(plain.environment).toBe(root);
    expect(dotted.environment).not.toBe(root);
    expect(page.environment).not.toBe(root);
  });

  it("Section 8: a standalone component's imported module providers get one injector per component type", () => {
    const firstA = TestBed.createComponent(PageA).componentInstance;
    const secondA = TestBed.createComponent(PageA).componentInstance;
    const pageB = TestBed.createComponent(PageB).componentInstance;

    expect(secondA.environment).toBe(firstA.environment);
    expect(secondA.store).toBe(firstA.store);
    expect(pageB.store).not.toBe(firstA.store);
    expect(events).toEqual(['TrackedStore created', 'TrackedStore created']);
  });

  it("Section 8: destroying the parent environment injector destroys the standalone injector's services", () => {
    const parent = createEnvironmentInjector([], TestBed.inject(EnvironmentInjector));
    const ref = createComponent(PageA, { environmentInjector: parent });

    ref.destroy();
    expect(events).toEqual(['TrackedStore created']);

    parent.destroy();
    expect(events).toEqual(['TrackedStore created', 'TrackedStore destroyed']);
  });

  it("Section 8: an NgModule's ɵinj lists its imports and providers", () => {
    expect(injectorDefinitionOf(CatalogModule)).toEqual({ providers: [CatalogStore], imports: [CommonModule] });
  });

  it("Section 8: AOT writes the module scope into a declared component's dependencies", () => {
    expect(scopeOf(CatalogList)).toEqual({ directives: [NgForOf], pipes: [PricePipe] });
  });
});
