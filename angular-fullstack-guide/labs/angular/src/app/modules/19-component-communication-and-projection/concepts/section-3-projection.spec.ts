import { Component, OnInit, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

// --- Slots: select, the default slot, ngProjectAs and fallback content ---

@Component({
  selector: 'lab-m19-s3-frame',
  template: `
    <header><ng-content select="[title]">Default title</ng-content></header>
    <main><ng-content select=".body" /></main>
    <footer><ng-content select="lab-m19-s3-foot">Default foot</ng-content></footer>
    <section><ng-content /></section>
    <aside><ng-content select=".body">second body slot</ng-content></aside>
  `,
})
class Frame {}

@Component({
  selector: 'lab-m19-s3-full-host',
  imports: [Frame],
  template: `
    <lab-m19-s3-frame>
      <h1 title>T</h1>
      <div class="body">B</div>
      <span>loose</span>
      <h3 ngProjectAs="lab-m19-s3-foot">F</h3>
    </lab-m19-s3-frame>
  `,
})
class FullHost {}

@Component({
  selector: 'lab-m19-s3-empty-host',
  imports: [Frame],
  template: `
    <lab-m19-s3-frame>
      <!-- a comment is not content -->
    </lab-m19-s3-frame>
  `,
})
class EmptyHost {}

@Component({
  selector: 'lab-m19-s3-if-host',
  imports: [Frame],
  template: `<lab-m19-s3-frame>@if (show()) { <h1 title>hidden</h1> }</lab-m19-s3-frame>`,
})
class IfHost {
  readonly show = signal(false);
}

// --- Projection is not instantiation: an @if around ng-content hides but does not defer ---

let probeConstructed = 0;
let probeInits = 0;

@Component({
  selector: 'lab-m19-s3-probe',
  template: `probe`,
})
class Probe implements OnInit {
  constructor() {
    probeConstructed++;
  }

  ngOnInit(): void {
    probeInits++;
  }
}

@Component({
  selector: 'lab-m19-s3-gate',
  template: `@if (open()) { <ng-content /> }`,
})
class Gate {
  readonly open = signal(false);
}

@Component({
  selector: 'lab-m19-s3-gate-host',
  imports: [Gate, Probe],
  template: `<lab-m19-s3-gate><lab-m19-s3-probe /></lab-m19-s3-gate>`,
})
class GateHost {}

// --- A multi-root @if goes whole to one slot (NG8011 warns at build time) ---

@Component({
  selector: 'lab-m19-s3-split',
  template: `
    <header><ng-content select="[a]" /></header>
    <footer><ng-content select="[b]" /></footer>
    <main><ng-content /></main>
  `,
})
class Split {}

@Component({
  selector: 'lab-m19-s3-multi-root-host',
  imports: [Split],
  template: `<lab-m19-s3-split>@if (ok()) { <h1 a>A</h1> <p b>B</p> }</lab-m19-s3-split>`,
})
class MultiRootHost {
  readonly ok = signal(true);
}

@Component({
  selector: 'lab-m19-s3-wrapped-host',
  imports: [Split],
  template: `
    <lab-m19-s3-split>
      @if (ok()) {
        <ng-container ngProjectAs="[a]"><h1>A</h1><p>B</p></ng-container>
      }
    </lab-m19-s3-split>
  `,
})
class WrappedHost {
  readonly ok = signal(true);
}

@Component({
  selector: 'lab-m19-s3-two-ifs-host',
  imports: [Split],
  template: `
    <lab-m19-s3-split>
      @if (ok()) { <h1 a>A</h1> }
      @if (ok()) { <p b>B</p> }
    </lab-m19-s3-split>
  `,
})
class TwoIfsHost {
  readonly ok = signal(true);
}

// --- Projected content belongs to the declaring view for change detection ---

@Component({
  selector: 'lab-m19-s3-card',
  template: `<i>{{ own }}</i><ng-content />`,
})
class Card {
  own = 'card-1';
}

@Component({
  selector: 'lab-m19-s3-card-host',
  imports: [Card],
  template: `<lab-m19-s3-card><b>{{ label() }}</b></lab-m19-s3-card>`,
})
class CardHost {
  readonly label = signal('host-1');
}

function slot(root: HTMLElement, tag: string): HTMLElement {
  return root.querySelector(tag) as HTMLElement;
}

describe('Section 3: content projection', () => {
  beforeEach(() => {
    probeConstructed = 0;
    probeInits = 0;
  });

  it('Section 3: select, the default slot and ngProjectAs choose the slot', () => {
    const fixture = TestBed.createComponent(FullHost);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    expect(slot(root, 'header').querySelector('h1')?.textContent).toBe('T');
    expect(slot(root, 'main').querySelector('div.body')?.textContent).toBe('B');
    expect(slot(root, 'footer').querySelector('h3')?.textContent).toBe('F');
    expect(slot(root, 'section').textContent?.trim()).toBe('loose');
  });

  it('Section 3: the first matching slot gets the node and a later slot with the same select shows its fallback', () => {
    const fixture = TestBed.createComponent(FullHost);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    expect(slot(root, 'main').querySelectorAll('div.body').length).toBe(1);
    expect(slot(root, 'aside').querySelector('div.body')).toBeNull();
    expect(slot(root, 'aside').textContent?.trim()).toBe('second body slot');
  });

  it('Section 3: fallback content shows for no match, whitespace and comments but not for an @if that is false', () => {
    const empty = TestBed.createComponent(EmptyHost);
    empty.detectChanges();
    const emptyRoot: HTMLElement = empty.nativeElement;
    expect(slot(emptyRoot, 'header').textContent?.trim()).toBe('Default title');
    expect(slot(emptyRoot, 'footer').textContent?.trim()).toBe('Default foot');
    expect(slot(emptyRoot, 'aside').textContent?.trim()).toBe('second body slot');
    expect(slot(emptyRoot, 'main').textContent?.trim()).toBe('');
    expect(slot(emptyRoot, 'section').textContent?.trim()).toBe('');

    const gated = TestBed.createComponent(IfHost);
    gated.detectChanges();
    const gatedRoot: HTMLElement = gated.nativeElement;
    expect(slot(gatedRoot, 'header').textContent?.trim()).toBe('');

    gated.componentInstance.show.set(true);
    gated.detectChanges();
    expect(slot(gatedRoot, 'header').querySelector('h1')?.textContent).toBe('hidden');

    gated.componentInstance.show.set(false);
    gated.detectChanges();
    expect(slot(gatedRoot, 'header').textContent?.trim()).toBe('');
  });

  it('Section 3: a projected component is constructed once even when its ng-content is hidden', () => {
    const fixture = TestBed.createComponent(GateHost);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    const gate = fixture.debugElement.query(By.directive(Gate)).componentInstance as Gate;
    expect(probeConstructed).toBe(1);
    expect(probeInits).toBe(1);
    expect(root.querySelector('lab-m19-s3-probe')).toBeNull();

    gate.open.set(true);
    fixture.detectChanges();
    expect(root.querySelector('lab-m19-s3-probe')).not.toBeNull();
    expect(probeConstructed).toBe(1);

    gate.open.set(false);
    fixture.detectChanges();
    expect(root.querySelector('lab-m19-s3-probe')).toBeNull();
    expect(probeConstructed).toBe(1);
  });

  it('Section 3: an @if with two roots is projected into the default slot as a whole and ng-container with ngProjectAs fixes it', () => {
    const multi = TestBed.createComponent(MultiRootHost);
    multi.detectChanges();
    const multiRoot: HTMLElement = multi.nativeElement;
    expect(slot(multiRoot, 'header').children.length).toBe(0);
    expect(slot(multiRoot, 'footer').children.length).toBe(0);
    expect(Array.from(slot(multiRoot, 'main').children).map((c) => c.tagName)).toEqual(['H1', 'P']);

    const wrapped = TestBed.createComponent(WrappedHost);
    wrapped.detectChanges();
    const wrappedRoot: HTMLElement = wrapped.nativeElement;
    expect(Array.from(slot(wrappedRoot, 'header').children).map((c) => c.tagName)).toEqual(['H1', 'P']);
    expect(slot(wrappedRoot, 'main').children.length).toBe(0);
  });

  it('Section 3: two @if blocks with one root each project into their own slots', () => {
    const fixture = TestBed.createComponent(TwoIfsHost);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    expect(slot(root, 'header').querySelector('h1')?.textContent).toBe('A');
    expect(slot(root, 'footer').querySelector('p')?.textContent).toBe('B');
    expect(slot(root, 'main').children.length).toBe(0);
  });

  it('Section 3: ngProjectAs leaves the attribute on the element', () => {
    const fixture = TestBed.createComponent(FullHost);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    expect(slot(root, 'footer').querySelector('h3')?.getAttribute('ngprojectas')).toBe('lab-m19-s3-foot');
  });

  it('Section 3: projected content is checked with the declaring view', () => {
    const fixture = TestBed.createComponent(CardHost);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    const card = fixture.debugElement.query(By.directive(Card)).componentInstance as Card;
    expect(root.querySelector('i')?.textContent).toBe('card-1');
    expect(root.querySelector('b')?.textContent).toBe('host-1');

    card.own = 'card-2';
    fixture.componentInstance.label.set('host-2');
    fixture.detectChanges();
    expect(root.querySelector('b')?.textContent).toBe('host-2');
    expect(root.querySelector('i')?.textContent).toBe('card-1');
  });
});
