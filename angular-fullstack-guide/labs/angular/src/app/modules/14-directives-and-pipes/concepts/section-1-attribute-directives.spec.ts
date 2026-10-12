import {
  booleanAttribute,
  Component,
  Directive,
  ElementRef,
  inject,
  input,
  output,
  Renderer2,
  signal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

// A directive that configures its host declaratively: a signal input named like the selector.
@Directive({
  selector: '[labHighlight]',
  host: {
    '[style.background-color]': 'labHighlight()',
    '[class.hovered]': 'hovered()',
    '(mouseenter)': 'hovered.set(true)',
    '(mouseleave)': 'hovered.set(false)',
  },
})
class Highlight {
  readonly labHighlight = input('yellow');
  protected readonly hovered = signal(false);
}

// A bare attribute (`labFlag`) reaches the input as the string '', which booleanAttribute turns into true.
@Directive({ selector: '[labFlag]', host: { '[attr.data-flag]': 'labFlag()' } })
class Flag {
  readonly labFlag = input(false, { transform: booleanAttribute });
}

// exportAs publishes the instance to a template reference.
@Directive({ selector: '[labToggle]', exportAs: 'labToggle' })
class Toggle {
  readonly on = signal(false);

  flip(): void {
    this.on.update((value) => !value);
  }
}

// An input and an output under names different from the class members.
@Directive({ selector: '[labAliased]' })
class Aliased {
  readonly size = input(1, { alias: 'labSize' });
  readonly fired = output<number>({ alias: 'labFired' });

  constructor() {
    inject(ElementRef<HTMLElement>).nativeElement.addEventListener('click', () => this.fired.emit(this.size()));
  }
}

// Imperative writes in the constructor: the directive talks to the DOM through ElementRef...
@Directive({ selector: '[labDirect]' })
class Direct {
  constructor() {
    const el: HTMLElement = inject(ElementRef).nativeElement;
    el.style.color = 'red';
    el.classList.add('direct');
  }
}

// ...or through Renderer2.
@Directive({ selector: '[labRend]' })
class Rend {
  constructor() {
    const el: HTMLElement = inject(ElementRef).nativeElement;
    const renderer = inject(Renderer2);
    renderer.setStyle(el, 'color', 'green');
    renderer.addClass(el, 'rend');
    renderer.setAttribute(el, 'data-r', '1');
  }
}

// Records what nativeElement holds, wherever the directive is placed.
@Directive({ selector: '[labProbe]' })
class Probe {
  readonly node: Node = inject(ElementRef<Node>).nativeElement;
}

@Component({
  selector: 'lab-s1-highlight-host',
  imports: [Highlight],
  template: `<p labHighlight="orange">static</p><p [labHighlight]="colour()">bound</p><p labHighlight>bare</p>`,
})
class HighlightHost {
  readonly colour = signal('pink');
}

@Component({
  selector: 'lab-s1-flag-host',
  imports: [Flag],
  template: `<i id="bare" labFlag></i><i id="on" [labFlag]="true"></i><i id="off" [labFlag]="false"></i><i id="none"></i>`,
})
class FlagHost {}

@Component({
  selector: 'lab-s1-toggle-host',
  imports: [Toggle],
  template: `<button labToggle #t="labToggle" (click)="t.flip()">{{ t.on() }}</button>`,
})
class ToggleHost {}

@Component({
  selector: 'lab-s1-alias-host',
  imports: [Aliased],
  template: `<button labAliased [labSize]="size()" (labFired)="seen.set($event)">go</button>`,
})
class AliasHost {
  readonly size = signal(5);
  readonly seen = signal(0);
}

@Component({
  selector: 'lab-s1-write-host',
  imports: [Direct, Rend],
  template: `
    <p id="direct" labDirect [style.color]="colour()" [class.on]="flag()">direct</p>
    <p id="rend" labRend [style.color]="colour()">renderer, with a binding</p>
    <p id="free" labRend>renderer, no binding</p>
  `,
})
class WriteHost {
  readonly colour = signal('blue');
  readonly flag = signal(false);
}

@Component({
  selector: 'lab-s1-probe-host',
  imports: [Probe],
  template: `<div labProbe></div><ng-template labProbe></ng-template><ng-container labProbe />`,
})
class ProbeHost {}

function mount<T>(type: new () => T) {
  const fixture = TestBed.createComponent(type);
  fixture.detectChanges();
  return fixture;
}

function el(root: HTMLElement, selector: string): HTMLElement {
  const found = root.querySelector<HTMLElement>(selector);
  if (!found) {
    throw new Error(`no element for ${selector}`);
  }
  return found;
}

describe('Section 1: attribute directives', () => {
  it('Section 1: host metadata and a signal input configure the host element', () => {
    const fixture = mount(HighlightHost);
    const [plain, bound, bare] = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('p'));

    expect(plain.style.backgroundColor).toBe('orange');
    expect(bound.style.backgroundColor).toBe('pink');
    // The bare attribute sets the input to the empty string, so the default 'yellow' is not used.
    expect(bare.style.backgroundColor).toBe('');

    plain.dispatchEvent(new Event('mouseenter'));
    fixture.detectChanges();
    expect(plain.classList.contains('hovered')).toBe(true);

    plain.dispatchEvent(new Event('mouseleave'));
    fixture.detectChanges();
    expect(plain.classList.contains('hovered')).toBe(false);

    fixture.componentInstance.colour.set('teal');
    fixture.detectChanges();
    expect(bound.style.backgroundColor).toBe('teal');
  });

  it('Section 1: a bare attribute is true through booleanAttribute', () => {
    const root: HTMLElement = mount(FlagHost).nativeElement;

    expect(el(root, '#bare').getAttribute('data-flag')).toBe('true');
    expect(el(root, '#on').getAttribute('data-flag')).toBe('true');
    expect(el(root, '#off').getAttribute('data-flag')).toBe('false');
    expect(el(root, '#none').hasAttribute('data-flag')).toBe(false);
  });

  it('Section 1: exportAs lets a template reference read the directive instance', () => {
    const fixture = mount(ToggleHost);
    const button = el(fixture.nativeElement, 'button');
    expect(button.textContent).toBe('false');

    button.click();
    fixture.detectChanges();
    expect(button.textContent).toBe('true');
  });

  it('Section 1: input and output aliases use the template names', () => {
    const fixture = mount(AliasHost);
    el(fixture.nativeElement, 'button').click();
    expect(fixture.componentInstance.seen()).toBe(5);

    fixture.componentInstance.size.set(8);
    fixture.detectChanges();
    el(fixture.nativeElement, 'button').click();
    expect(fixture.componentInstance.seen()).toBe(8);
  });

  it('Section 1: a binding on the same property overwrites a direct write, and an unbound class stays', () => {
    const fixture = mount(WriteHost);
    const direct = el(fixture.nativeElement, '#direct');
    expect(direct.getAttribute('style')).toBe('color: blue;');
    expect(direct.getAttribute('class')).toBe('direct');

    fixture.componentInstance.colour.set('purple');
    fixture.componentInstance.flag.set(true);
    fixture.detectChanges();
    expect(direct.getAttribute('style')).toBe('color: purple;');
    expect(direct.getAttribute('class')).toBe('direct on');

    fixture.componentInstance.colour.set('');
    fixture.componentInstance.flag.set(false);
    fixture.detectChanges();
    expect(direct.getAttribute('style')).toBe('');
    expect(direct.getAttribute('class')).toBe('direct');
  });

  it('Section 1: Renderer2 writes are overwritten by a binding like direct writes', () => {
    const fixture = mount(WriteHost);
    const root: HTMLElement = fixture.nativeElement;

    expect(el(root, '#rend').getAttribute('style')).toBe('color: blue;');
    expect(el(root, '#rend').getAttribute('class')).toBe('rend');

    const free = el(root, '#free');
    expect(free.getAttribute('style')).toBe('color: green;');
    expect(free.getAttribute('class')).toBe('rend');
    expect(free.getAttribute('data-r')).toBe('1');
  });

  it('Section 1: nativeElement is an element on a div and a comment node on ng-template and ng-container', () => {
    const fixture = mount(ProbeHost);
    const probes = fixture.debugElement.queryAllNodes((node) => node.injector.get(Probe, null) !== null);
    const types = probes.map((node) => node.injector.get(Probe).node.nodeType);

    expect(types).toEqual([Node.ELEMENT_NODE, Node.COMMENT_NODE, Node.COMMENT_NODE]);
    expect(probes[0].injector.get(Probe).node.nodeName).toBe('DIV');
    expect(probes[1].injector.get(Probe).node.nodeName).toBe('#comment');
  });

  it('Section 1: a style write on a comment node throws a TypeError because it has no style property', () => {
    const fixture = mount(ProbeHost);
    const probes = fixture.debugElement.queryAllNodes((node) => node.injector.get(Probe, null) !== null);
    const comment = probes[1].injector.get(Probe).node as HTMLElement;

    expect(comment.style).toBeUndefined();
    expect(() => {
      comment.style.color = 'red';
    }).toThrow(TypeError);
  });
});
