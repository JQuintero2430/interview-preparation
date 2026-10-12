import {
  Component,
  Directive,
  inject,
  InjectionToken,
  Injector,
  input,
  signal,
  TemplateRef,
  Type,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgClass, NgComponentOutlet, NgStyle, NgTemplateOutlet } from '@angular/common';

// --- NgClass and NgStyle against the class and style bindings ---

@Component({
  selector: 'lab-s4-class-host',
  imports: [NgClass],
  template: `
    <p id="ng" class="static" [ngClass]="flags()">ng</p>
    <p id="plain" [class]="flags()">plain</p>
    <p id="spaced" [ngClass]="{ 'a b': on() }">spaced</p>
    <p id="merged" class="static" [class.x]="on()" [ngClass]="{ y: on() }">merged</p>
    <span id="tick">{{ tick() }}</span>
  `,
})
class ClassHost {
  readonly flags = signal<{ on: boolean; off: boolean }>({ on: true, off: false });
  readonly on = signal(true);
  // An unrelated signal read by the template: changing it marks this OnPush view dirty.
  readonly tick = signal(0);
}

@Component({
  selector: 'lab-s4-style-host',
  imports: [NgStyle],
  template: `<p [ngStyle]="{ 'width.px': width(), color: color() }">styled</p>`,
})
class StyleHost {
  readonly width = signal(10);
  readonly color = signal<string | null>('red');
}

// --- NgTemplateOutlet ---

@Component({
  selector: 'lab-s4-outlet-host',
  imports: [NgTemplateOutlet],
  template: `
    <ng-template #tpl let-name let-num="num"><i>T[{{ name }}|{{ num }}]</i></ng-template>
    <ng-container *ngTemplateOutlet="tpl; context: context()" />
  `,
})
class OutletHost {
  readonly context = signal<{ $implicit: string; num: number }>({ $implicit: 'ann', num: 1 });
}

const WHO = new InjectionToken<string>('lab-s4-who', { factory: () => 'root' });

@Directive({ selector: '[labS4Who]', exportAs: 'labS4Who' })
class Who {
  readonly seen = inject(WHO);
}

@Component({
  selector: 'lab-s4-renderer',
  imports: [NgTemplateOutlet],
  providers: [{ provide: WHO, useValue: 'renderer' }],
  template: `<ng-container *ngTemplateOutlet="content(); injector: injector()" />`,
})
class Renderer {
  readonly content = input.required<TemplateRef<unknown>>();
  readonly injector = input<Injector | 'outlet' | undefined>();
}

@Component({
  selector: 'lab-s4-declarer',
  imports: [Renderer, Who],
  providers: [{ provide: WHO, useValue: 'declarer' }],
  template: `
    <ng-template #tpl><i labS4Who #who="labS4Who">{{ who.seen }}</i></ng-template>
    <lab-s4-renderer [content]="tpl" [injector]="injector()" />
  `,
})
class Declarer {
  readonly injector = signal<Injector | 'outlet' | undefined>(undefined);
}

// --- NgComponentOutlet ---

let widgetCreated = 0;

@Component({ selector: 'lab-s4-w1', template: `W1[{{ label() }}|{{ n() }}]` })
class W1 {
  readonly label = input('L0');
  readonly n = input(0);
  constructor() {
    widgetCreated++;
  }
}

@Component({ selector: 'lab-s4-w2', template: `W2` })
class W2 {
  readonly token = inject(WHO, { optional: true });
}

@Component({ selector: 'lab-s4-w3', template: `W3[{{ token ?? 'none' }}]` })
class W3 {
  readonly token = inject(WHO, { optional: true });
}

@Component({
  selector: 'lab-s4-comp-host',
  imports: [NgComponentOutlet],
  template: `<ng-container *ngComponentOutlet="comp(); inputs: inputs(); injector: injector()" />`,
})
class CompHost {
  // A template cannot name a class, so the class is exposed as a member.
  readonly comp = signal<Type<unknown>>(W1);
  readonly inputs = signal<Record<string, unknown>>({ label: 'L1', n: 1 });
  readonly injector = signal<Injector | undefined>(undefined);
}

function mount<T>(type: new () => T) {
  const fixture = TestBed.createComponent(type);
  fixture.detectChanges();
  return fixture;
}

function attr(root: HTMLElement, selector: string, name: string): string | null {
  return root.querySelector(selector)?.getAttribute(name) ?? null;
}

describe('Section 4: built-in directives', () => {
  it('Section 4: NgClass applies space-separated keys and sees in-place mutation while [class] does not', () => {
    const fixture = mount(ClassHost);
    const root: HTMLElement = fixture.nativeElement;
    expect(attr(root, '#ng', 'class')).toBe('static on');
    expect(attr(root, '#plain', 'class')).toBe('on');
    expect(attr(root, '#spaced', 'class')).toBe('a b');
    expect(attr(root, '#merged', 'class')?.split(' ').sort()).toEqual(['static', 'x', 'y']);

    // Mutate the same object in place, then dirty the view through the unrelated signal.
    fixture.componentInstance.flags().off = true;
    fixture.componentInstance.flags().on = false;
    fixture.componentInstance.tick.set(1);
    fixture.detectChanges();
    expect(attr(root, '#ng', 'class')).toBe('static off');
    expect(attr(root, '#plain', 'class')).toBe('on');
  });

  it('Section 4: NgStyle applies units and removes null', () => {
    const fixture = mount(StyleHost);
    const p: HTMLElement = fixture.nativeElement.querySelector('p');
    expect(p.getAttribute('style')).toBe('width: 10px; color: red;');
    fixture.componentInstance.color.set(null);
    fixture.detectChanges();
    expect(p.getAttribute('style')).toBe('width: 10px;');
  });

  it('Section 4: ngTemplateOutlet renders with a context and follows a swapped context object without recreating the view', () => {
    const fixture = mount(OutletHost);
    const root: HTMLElement = fixture.nativeElement;
    const view = root.querySelector('i');
    expect(view?.textContent).toBe('T[ann|1]');
    fixture.componentInstance.context.set({ $implicit: 'ctx2', num: 6 });
    fixture.detectChanges();
    expect(root.querySelector('i')).toBe(view);
    expect(view?.textContent).toBe('T[ctx2|6]');
  });

  it('Section 4: ngTemplateOutlet uses the declaration injector unless an injector is given', () => {
    const fixture = mount(Declarer);
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('i')?.textContent).toBe('declarer');

    const custom = Injector.create({ providers: [{ provide: WHO, useValue: 'custom' }] });
    fixture.componentInstance.injector.set(custom);
    fixture.detectChanges();
    expect(root.querySelector('i')?.textContent).toBe('custom');
  });

  it("Section 4: ngTemplateOutletInjector 'outlet' inherits the injector of the outlet's location", () => {
    const fixture = mount(Declarer);
    const root: HTMLElement = fixture.nativeElement;
    fixture.componentInstance.injector.set('outlet');
    fixture.detectChanges();
    expect(root.querySelector('i')?.textContent).toBe('renderer');
  });

  it('Section 4: ngComponentOutlet sets inputs and resets dropped ones to undefined', () => {
    const fixture = mount(CompHost);
    const root: HTMLElement = fixture.nativeElement;
    const host = fixture.componentInstance;
    expect(root.textContent).toContain('W1[L1|1]');

    host.inputs.set({ label: 'L2' });
    fixture.detectChanges();
    expect(root.textContent).toContain('W1[L2|]');

    host.inputs.set({ n: 7 });
    fixture.detectChanges();
    expect(root.textContent).toContain('W1[|7]');
  });

  it('Section 4: ngComponentOutlet replaces the instance when the component type changes', () => {
    const fixture = mount(CompHost);
    const before = widgetCreated;
    fixture.componentInstance.comp.set(W2);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('W2');
    expect(fixture.nativeElement.textContent).not.toContain('W1');
    expect(widgetCreated).toBe(before);
  });

  it('Section 4: ngComponentOutlet honors the injector option', () => {
    const fixture = mount(CompHost);
    const host = fixture.componentInstance;
    host.comp.set(W3);
    host.inputs.set({});
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('W3[root]');

    // The token has a root factory, so a provided value only shows when the injector is passed.
    host.injector.set(Injector.create({ providers: [{ provide: WHO, useValue: 'given' }] }));
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('W3[given]');
  });
});
