// labs/angular/src/app/modules/19-component-communication-and-projection/outputs/q19-outputs.spec.ts
// Each test reproduces one "Output" question from Module 19 and asserts the exact lines the answer
// prints. Other questions may add a test named after them for the runtime claim their answer makes.
// If Angular changes behaviour, this file fails first.
import { NgTemplateOutlet } from '@angular/common';
import {
  AfterContentInit,
  AfterViewInit,
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  Directive,
  ElementRef,
  EnvironmentInjector,
  EventEmitter,
  Injectable,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  computed,
  contentChild,
  contentChildren,
  createComponent,
  inject,
  input,
  inputBinding,
  model,
  numberAttribute,
  output,
  outputBinding,
  reflectComponentType,
  signal,
  twoWayBinding,
  viewChild,
} from '@angular/core';
import { outputToObservable } from '@angular/core/rxjs-interop';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { map } from 'rxjs';

// Every Output test pushes into this recorder where the answer's snippet calls console.log.
const lines: string[] = [];
const log = (line: string): number => lines.push(line);

beforeEach(() => {
  lines.length = 0;
});

// Q19.01: who may write what. An input is read-only for its owner, an output only announces, a model does both.
@Component({
  selector: 'lab-m19-q01-owner',
  template: ``,
})
class Owner {
  readonly n = input(0);
  readonly v = model(0);
  readonly done = output<number>();
}

// Q19.03: a child emits in its constructor and in ngOnInit and reads an input in both.
@Component({
  selector: 'lab-m19-q03-child',
  template: ``,
})
class EmittingChild implements OnInit {
  readonly n = input(0);
  readonly ping = output<string>();
  // Legacy decorator form of the same output.
  @Output() readonly legacy = new EventEmitter<string>();

  constructor() {
    log(`ctor n=${this.n()}`);
    this.ping.emit('ping from ctor');
    this.legacy.emit('legacy from ctor');
  }

  ngOnInit(): void {
    log(`init n=${this.n()}`);
    this.ping.emit('ping from init');
    this.legacy.emit('legacy from init');
  }
}

@Component({
  selector: 'lab-m19-q03-host',
  imports: [EmittingChild],
  template: `<lab-m19-q03-child [n]="5" (ping)="log($event)" (legacy)="log($event)" />`,
})
class EmittingHost {
  protected readonly log = log;
}

// Q19.04: the parent ignores the child's proposal. A model keeps what the child set, input + output does not.
@Component({
  selector: 'lab-m19-q04-model',
  template: `<button (click)="value.set(3)">{{ value() }}</button>`,
})
class ModelChild {
  readonly value = model(1);
}

@Component({
  selector: 'lab-m19-q04-input',
  template: `<button (click)="changed.emit(3)">{{ value() }}</button>`,
})
class InputChild {
  readonly value = input(1);
  readonly changed = output<number>();
}

@Component({
  selector: 'lab-m19-q04-host',
  imports: [ModelChild, InputChild],
  template: `
    <lab-m19-q04-model [value]="score()" (valueChange)="proposals.push($event)" />
    <lab-m19-q04-input [value]="score()" (changed)="proposals.push($event)" />
  `,
})
class RefusingHost {
  readonly score = signal(1);
  readonly proposals: number[] = [];
}

// Q19.05: two siblings receive the same object and one mutates it.
interface User {
  name: string;
}

@Component({
  selector: 'lab-m19-q05-editor',
  template: `<button (click)="shout()">A:{{ user().name }}</button>`,
})
class Editor {
  readonly user = input.required<User>();

  shout(): void {
    this.user().name += '!';
  }
}

@Component({
  selector: 'lab-m19-q05-viewer',
  template: `<p>B:{{ user().name }}</p>`,
})
class Viewer {
  readonly user = input.required<User>();
}

@Component({
  selector: 'lab-m19-q05-host',
  imports: [Editor, Viewer],
  template: `
    <lab-m19-q05-editor [user]="user" />
    <lab-m19-q05-viewer [user]="user" />
  `,
})
class MutatingHost {
  readonly user: User = { name: 'x' };
}

// Fix 1: the editor announces the new name and the parent replaces the object.
@Component({
  selector: 'lab-m19-q05-renamer',
  template: `<button (click)="renamed.emit(user().name + '!')">A:{{ user().name }}</button>`,
})
class Renamer {
  readonly user = input.required<User>();
  readonly renamed = output<string>();
}

@Component({
  selector: 'lab-m19-q05-replacing-host',
  imports: [Renamer, Viewer],
  template: `
    <lab-m19-q05-renamer [user]="user()" (renamed)="rename($event)" />
    <lab-m19-q05-viewer [user]="user()" />
  `,
})
class ReplacingHost {
  readonly user = signal<User>({ name: 'x' });

  rename(name: string): void {
    this.user.update((u) => ({ ...u, name }));
  }
}

// Fix 2: both siblings read one signal of a root service.
@Injectable({ providedIn: 'root' })
class NameStore {
  readonly name = signal('x');
}

@Component({
  selector: 'lab-m19-q05-store-editor',
  template: `<button (click)="store.name.update(shout)">A:{{ store.name() }}</button>`,
})
class StoreEditor {
  protected readonly store = inject(NameStore);
  protected readonly shout = (n: string): string => n + '!';
}

@Component({
  selector: 'lab-m19-q05-store-viewer',
  template: `<p>B:{{ store.name() }}</p>`,
})
class StoreViewer {
  protected readonly store = inject(NameStore);
}

@Component({
  selector: 'lab-m19-q05-store-host',
  imports: [StoreEditor, StoreViewer],
  template: `<lab-m19-q05-store-editor /><lab-m19-q05-store-viewer />`,
})
class StoreHost {}

// The tempting patch: the sibling opts out of OnPush.
@Component({
  selector: 'lab-m19-q05-eager-viewer',
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `<p>B:{{ user().name }}</p>`,
})
class EagerViewer {
  readonly user = input.required<User>();
}

@Component({
  selector: 'lab-m19-q05-eager-host',
  imports: [Editor, EagerViewer],
  template: `
    <lab-m19-q05-editor [user]="user" />
    <lab-m19-q05-eager-viewer [user]="user" />
  `,
})
class EagerHost {
  readonly user: User = { name: 'x' };
}

// Q19.07: one provider entry in a parent component serves the children written in its template.
@Injectable()
class Shared {
  readonly count = signal(0);
}

@Component({
  selector: 'lab-m19-q07-child',
  template: ``,
})
class SharedChild {
  readonly shared = inject(Shared);
}

@Component({
  selector: 'lab-m19-q07-owner',
  imports: [SharedChild],
  providers: [Shared],
  template: `<lab-m19-q07-child /><lab-m19-q07-child />`,
})
class SharedOwner {}

@Component({
  selector: 'lab-m19-q07-outsider',
  template: ``,
})
class SharedOutsider {
  readonly shared = inject(Shared, { optional: true });
}

@Component({
  selector: 'lab-m19-q07-host',
  imports: [SharedOwner, SharedOutsider],
  template: `<lab-m19-q07-owner /><lab-m19-q07-outsider />`,
})
class SharedHost {}

// Q19.09: five slots, two with the same select, filled by a full, an empty, a comment-only and an @if (false) usage.
@Component({
  selector: 'lab-m19-q09-frame',
  template: `
    <header><ng-content select="[title]">Default title</ng-content></header>
    <main><ng-content select=".body" /></main>
    <footer><ng-content select="lab-m19-q09-foot">Default foot</ng-content></footer>
    <section><ng-content /></section>
    <aside><ng-content select=".body">second body slot</ng-content></aside>
  `,
})
class SlotFrame {}

@Component({
  selector: 'lab-m19-q09-host',
  imports: [SlotFrame],
  template: `
    <lab-m19-q09-frame id="full">
      <h1 title>T</h1>
      <div class="body">B</div>
      <span>loose</span>
      <h3 ngProjectAs="lab-m19-q09-foot">F</h3>
    </lab-m19-q09-frame>
    <lab-m19-q09-frame id="empty"></lab-m19-q09-frame>
    <lab-m19-q09-frame id="comment"><!-- a comment is not content --></lab-m19-q09-frame>
    <lab-m19-q09-frame id="if-false">
      @if (false) {
        <h1 title>hidden</h1>
      }
    </lab-m19-q09-frame>
  `,
})
class SlotHost {}

// What a slot holds: its elements as markup and its text, without the comment anchors Angular leaves behind.
function slotContent(slot: Element): string {
  const parts = [...slot.childNodes].flatMap((node) => {
    if (node.nodeType === Node.ELEMENT_NODE) return [(node as Element).outerHTML];
    const text = node.nodeType === Node.TEXT_NODE ? (node.textContent ?? '').trim() : '';
    return text ? [text] : [];
  });
  return `[${parts.join('')}]`;
}

function slotLine(root: Element, id: string): string {
  const frame = root.querySelector(`#${id}`)!;
  const slots = ['header', 'main', 'footer', 'section', 'aside'].map((tag) => `${tag}${slotContent(frame.querySelector(tag)!)}`);
  return `${id.padEnd(9)}${slots.join(' ')}`;
}

// Q19.10: a projected component behind an @if around its ng-content.
const probe = { constructed: 0, inits: 0, destroyed: 0 };

@Component({
  selector: 'lab-m19-q10-probe',
  template: `probe`,
})
class ProjectedProbe implements OnInit, OnDestroy {
  constructor() {
    probe.constructed++;
  }

  ngOnInit(): void {
    probe.inits++;
  }

  ngOnDestroy(): void {
    probe.destroyed++;
  }
}

@Component({
  selector: 'lab-m19-q10-gate',
  template: `@if (open()) { <ng-content /> }`,
})
class ProjectedGate {
  readonly open = signal(false);
}

@Component({
  selector: 'lab-m19-q10-host',
  imports: [ProjectedGate, ProjectedProbe],
  template: `<lab-m19-q10-gate><lab-m19-q10-probe /></lab-m19-q10-gate>`,
})
class GateHost {}

// Q19.14: a column template declared by the caller and rendered by the table with a context.
interface Row {
  readonly id: number;
  readonly name: string;
}

@Directive({ selector: 'ng-template[labM19Q14Col]' })
class CellColumn {
  readonly tpl = inject(TemplateRef);

  static ngTemplateContextGuard(_directive: CellColumn, _context: unknown): _context is { $implicit: Row; index: number } {
    return true;
  }
}

@Component({
  selector: 'lab-m19-q14-table',
  imports: [NgTemplateOutlet],
  template: `
    @for (r of rows(); track r.id; let i = $index) {
      @for (c of cols(); track c) {
        <ng-container *ngTemplateOutlet="c.tpl; context: { $implicit: r, index: i }" />
      }
    }
  `,
})
class CellTable {
  readonly rows = input.required<readonly Row[]>();
  readonly cols = contentChildren(CellColumn);
  readonly tableField = 'table-field';
}

@Component({
  selector: 'lab-m19-q14-host',
  imports: [CellTable, CellColumn],
  template: `
    <lab-m19-q14-table [rows]="rows">
      <ng-template labM19Q14Col let-row>[{{ row.name }}|{{ hostField() }}|{{ $any(this).tableField ?? 'n/a' }}]</ng-template>
      <ng-template labM19Q14Col let-r let-i="index">(#{{ i }} {{ r.name }})</ng-template>
    </lab-m19-q14-table>
  `,
})
class CellHost {
  readonly rows: readonly Row[] = [{ id: 1, name: 'Ann' }];
  readonly hostField = signal('host-field');
}

// Q19.15: ng-content inside an ng-template that two outlets render, and the fix that passes the content as a template.
@Component({
  selector: 'lab-m19-q15-twice',
  imports: [NgTemplateOutlet],
  template: `
    <ng-template #t><b><ng-content /></b></ng-template>
    <i><ng-container *ngTemplateOutlet="t" /></i>
    <u><ng-container *ngTemplateOutlet="t" /></u>
  `,
})
class RenderedTwice {}

@Component({
  selector: 'lab-m19-q15-twice-host',
  imports: [RenderedTwice],
  template: `<lab-m19-q15-twice>X</lab-m19-q15-twice>`,
})
class RenderedTwiceHost {}

@Component({
  selector: 'lab-m19-q15-fixed',
  imports: [NgTemplateOutlet],
  template: `
    <ng-template #t><b><ng-container *ngTemplateOutlet="body()" /></b></ng-template>
    <i><ng-container *ngTemplateOutlet="t" /></i>
    <u><ng-container *ngTemplateOutlet="t" /></u>
  `,
})
class RenderedTwiceFixed {
  readonly body = contentChild.required(TemplateRef);
}

@Component({
  selector: 'lab-m19-q15-fixed-host',
  imports: [RenderedTwiceFixed],
  template: `<lab-m19-q15-fixed><ng-template>X</ng-template></lab-m19-q15-fixed>`,
})
class RenderedTwiceFixedHost {}

// Q19.17: a view query and a content query ask the same questions of different places.
@Component({
  selector: 'lab-m19-q17-leaf',
  template: `<i #inside>leaf</i>`,
})
class ReachLeaf {}

@Component({
  selector: 'lab-m19-q17-box',
  imports: [ReachLeaf],
  template: `<b #own>own</b><lab-m19-q17-leaf /><ng-content />`,
})
class ReachBox {
  readonly viewOwn = viewChild('own');
  readonly viewGiven = viewChild('given');
  readonly viewInside = viewChild('inside');
  readonly contentOwn = contentChild('own');
  readonly contentGiven = contentChild('given');
  readonly contentInside = contentChild('inside');
}

@Component({
  selector: 'lab-m19-q17-host',
  imports: [ReachBox, ReachLeaf],
  template: `
    <lab-m19-q17-box>
      <u #given>given</u>
      <lab-m19-q17-leaf />
    </lab-m19-q17-box>
  `,
})
class ReachHost {}

// Q19.18: three content queries over three usages of one wrapper.
@Directive({ selector: '[labM19Q18Item]' })
class CountedItem {}

@Component({
  selector: 'lab-m19-q18-box',
  template: `<ng-content />`,
})
class CountingBox {
  readonly first = contentChild(CountedItem);
  readonly direct = contentChildren(CountedItem);
  readonly deep = contentChildren(CountedItem, { descendants: true });

  summary(): string {
    return `contentChild=${this.first() ? 'found' : 'undefined'} contentChildren=${this.direct().length} descendants=${this.deep().length}`;
  }
}

@Component({
  selector: 'lab-m19-q18-host',
  imports: [CountingBox, CountedItem],
  template: `
    <lab-m19-q18-box id="both"><div labM19Q18Item><span labM19Q18Item></span></div></lab-m19-q18-box>
    <lab-m19-q18-box id="nested"><div><span labM19Q18Item></span></div></lab-m19-q18-box>
    <lab-m19-q18-box id="none"></lab-m19-q18-box>
  `,
})
class CountingHost {}

// Q19.19: what each read returns for an element, a template and a component.
@Component({
  selector: 'lab-m19-q19-leaf',
  template: ``,
})
class ReadLeaf {}

@Component({
  selector: 'lab-m19-q19-probe',
  imports: [ReadLeaf],
  template: `<span #a>a</span><ng-template #tpl>t</ng-template><lab-m19-q19-leaf #leaf />`,
})
class ReadProbe {
  readonly elementDefault = viewChild('a');
  readonly templateDefault = viewChild('tpl');
  readonly componentDefault = viewChild('leaf');
  readonly componentElement = viewChild('leaf', { read: ElementRef });
  readonly templateRead = viewChild('tpl', { read: TemplateRef });
  readonly containerAtElement = viewChild('a', { read: ViewContainerRef });
  readonly injectorAtElement = viewChild('a', { read: Injector });
}

// Q19.21: the stages at which each query form already holds its result.
@Directive({ selector: '[labM19Q21Item]' })
class TimedItem {}

@Component({
  selector: 'lab-m19-q21-probe',
  template: `
    <span #a>a</span>
    @if (show()) {
      <span #b>b</span>
    }
    <ng-content />
  `,
})
class TimedProbe implements OnInit, AfterContentInit, AfterViewInit {
  readonly show = signal(false);
  readonly signalA = viewChild('a');
  readonly signalB = viewChild('b');
  readonly signalItem = contentChild(TimedItem);
  // Legacy decorator forms, for the comparison.
  @ViewChild('a', { static: true }) staticA?: ElementRef;
  @ViewChild('a') dynamicA?: ElementRef;
  @ViewChild('b') dynamicB?: ElementRef;
  @ViewChild('b', { static: true }) staticB?: ElementRef;
  @ContentChild(TimedItem) legacyItem?: TimedItem;

  constructor() {
    this.stage('constructor');
  }

  ngOnInit(): void {
    this.stage('ngOnInit');
  }

  ngAfterContentInit(): void {
    this.stage('ngAfterContentInit');
  }

  ngAfterViewInit(): void {
    this.stage('ngAfterViewInit');
  }

  stage(name: string): void {
    const found = Object.entries({
      'viewChild(a)': this.signalA(),
      'viewChild(b)': this.signalB(),
      'contentChild': this.signalItem(),
      '@ViewChild(a, static)': this.staticA,
      '@ViewChild(a)': this.dynamicA,
      '@ViewChild(b)': this.dynamicB,
      '@ViewChild(b, static)': this.staticB,
      '@ContentChild': this.legacyItem,
    })
      .filter(([, value]) => value !== undefined)
      .map(([label]) => label);
    log(`${name}: ${found.join(', ') || 'nothing'}`);
  }
}

@Component({
  selector: 'lab-m19-q21-host',
  imports: [TimedProbe, TimedItem],
  template: `<lab-m19-q21-probe><span labM19Q21Item></span></lab-m19-q21-probe>`,
})
class TimedHost {}

// Q19.22: a setter writes at every binding, a computed over a signal input runs when it is read.
@Component({
  selector: 'lab-m19-q22-setter',
  template: ``,
})
class SetterBox {
  calls = 0;
  doubled = 0;

  // Legacy decorator form.
  @Input() set n(next: number) {
    this.calls++;
    this.doubled = next * 2;
  }
}

@Component({
  selector: 'lab-m19-q22-signal',
  template: ``,
})
class SignalBox {
  evaluations = 0;
  readonly n = input(0);
  readonly doubled = computed(() => {
    this.evaluations++;
    return this.n() * 2;
  });
}

@Component({
  selector: 'lab-m19-q22-host',
  imports: [SetterBox, SignalBox],
  template: `
    <lab-m19-q22-setter [n]="n()" />
    <lab-m19-q22-signal [n]="n()" />
  `,
})
class DerivedHost {
  readonly n = signal(3);
}

// Q19.24: an output() that the class pipes, through outputToObservable.
@Component({
  selector: 'lab-m19-q24-piped',
  template: ``,
})
class PipedOutput {
  readonly picked = output<number>();
  doubled = 0;

  constructor() {
    outputToObservable(this.picked)
      .pipe(map((n) => n * 2))
      .subscribe((n) => (this.doubled = n));
  }
}

// Q19.26: the three binding functions on a component created with createComponent, and setInput afterwards.
@Component({
  selector: 'lab-m19-q26-dyn',
  template: `{{ label() }}|{{ n() }}|{{ v() }}`,
})
class BoundDyn {
  readonly label = input.required<string>();
  readonly n = input(0);
  readonly v = model('M0');
  readonly done = output<number>();
}

// Q19.28: a component with a signal input, an aliased one, a model, an output, two decorator inputs and two slots.
@Component({
  selector: 'lab-m19-q28-c',
  template: `<ng-content select="[title]">T</ng-content><ng-content />`,
})
class Mirrored {
  readonly label = input.required<string>();
  readonly n = input(0, { alias: 'count' });
  readonly v = model(0);
  readonly done = output<number>();
  // Legacy decorator forms, for the comparison.
  @Input() legacy = '';
  @Input({ transform: numberAttribute }) len = 0;
  @Output() legacyOut = new EventEmitter<void>();
}

// The markup of an element without the comment anchors Angular leaves behind.
function markup(el: Element): string {
  return el.innerHTML.replace(/<!--[\s\S]*?-->/g, '').replace(/\s+/g, ' ').trim();
}

function texts(root: HTMLElement): string[] {
  return [...root.querySelectorAll('button, p')].map((el) => el.textContent ?? '');
}

describe('Module 19 question bank: Output answers', () => {
  it('Q19.01 an input has no set for its owner, an output has emit and a model has set', () => {
    const owner = TestBed.createComponent(Owner).componentInstance;
    expect('set' in owner.n).toBe(false);
    expect('set' in owner.v).toBe(true);
    expect(typeof owner.done.emit).toBe('function');

    const attempt = () =>
      // @ts-expect-error an InputSignal has no set method; only the parent can change it
      owner.n.set(1);
    expect(attempt).toThrow(TypeError);

    owner.v.set(2);
    expect(owner.v()).toBe(2);
  });

  it('Q19.03 the constructor emissions are lost, the ngOnInit ones arrive and the input is 0 then 5', () => {
    TestBed.createComponent(EmittingHost).detectChanges();
    expect(lines).toEqual(['ctor n=0', 'init n=5', 'ping from init', 'legacy from init']);
  });

  it('Q19.04 when the parent ignores the proposal a model child shows 3 and an input child still shows 1', () => {
    const fixture = TestBed.createComponent(RefusingHost);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    expect(texts(root)).toEqual(['1', '1']);

    root.querySelectorAll('button').forEach((b) => b.click());
    fixture.detectChanges();
    expect(texts(root)).toEqual(['3', '1']);
    expect(fixture.componentInstance.proposals).toEqual([3, 3]);
    expect(fixture.componentInstance.score()).toBe(1);
  });

  it('Q19.05 a mutated shared object refreshes only the editor, and each fix refreshes both siblings', () => {
    const mutating = TestBed.createComponent(MutatingHost);
    mutating.detectChanges();
    (mutating.nativeElement as HTMLElement).querySelector('button')!.click();
    mutating.detectChanges();
    mutating.detectChanges(); // a second pass changes nothing: the sibling is not dirty
    log(texts(mutating.nativeElement).join(' '));

    const replacing = TestBed.createComponent(ReplacingHost);
    replacing.detectChanges();
    (replacing.nativeElement as HTMLElement).querySelector('button')!.click();
    replacing.detectChanges();
    log(texts(replacing.nativeElement).join(' '));

    const stored = TestBed.createComponent(StoreHost);
    stored.detectChanges();
    (stored.nativeElement as HTMLElement).querySelector('button')!.click();
    stored.detectChanges();
    log(texts(stored.nativeElement).join(' '));

    expect(lines).toEqual(['A:x! B:x', 'A:x! B:x!', 'A:x! B:x!']);
  });

  it('Q19.05 a sibling that opts out of OnPush with Eager shows the mutation too', () => {
    const fixture = TestBed.createComponent(EagerHost);
    fixture.detectChanges();
    (fixture.nativeElement as HTMLElement).querySelector('button')!.click();
    fixture.detectChanges();
    expect(texts(fixture.nativeElement)).toEqual(['A:x!', 'B:x!']);
  });

  it('Q19.05 a computed over a mutated object keeps its old value, because signals track writes to the signal', () => {
    const user = signal<User>({ name: 'x' });
    const name = computed(() => user().name);
    expect(name()).toBe('x');

    user().name += '!';
    expect(name()).toBe('x');

    user.set({ name: 'x!' });
    expect(name()).toBe('x!');
  });
  it('Q19.07 a parent component that lists the service in providers gives its children one instance and an outsider none', () => {
    const fixture = TestBed.createComponent(SharedHost);
    fixture.detectChanges();
    const [first, second] = fixture.debugElement.queryAll(By.directive(SharedChild)).map((d) => d.componentInstance as SharedChild);
    const outsider = fixture.debugElement.query(By.directive(SharedOutsider)).componentInstance as SharedOutsider;
    expect(first.shared).toBe(second.shared);
    expect(outsider.shared).toBeNull();
  });

  it('Q19.09 each usage fills the slots in this order and the fallback shows only when no node matched', () => {
    const fixture = TestBed.createComponent(SlotHost);
    fixture.detectChanges();
    for (const id of ['full', 'empty', 'comment', 'if-false']) log(slotLine(fixture.nativeElement, id));
    expect(lines).toEqual([
      'full     header[<h1 title="">T</h1>] main[<div class="body">B</div>] footer[<h3 ngprojectas="lab-m19-q09-foot">F</h3>] section[<span>loose</span>] aside[second body slot]',
      'empty    header[Default title] main[] footer[Default foot] section[] aside[second body slot]',
      'comment  header[Default title] main[] footer[Default foot] section[] aside[second body slot]',
      'if-false header[] main[] footer[Default foot] section[] aside[second body slot]',
    ]);
  });

  it('Q19.10 a projected component behind a closed ng-content is built once, stays alive and is attached and detached', () => {
    const state = (fixture: ComponentFixture<GateHost>): string => {
      const inDom = (fixture.nativeElement as HTMLElement).querySelector('lab-m19-q10-probe') !== null;
      return `constructed=${probe.constructed} inits=${probe.inits} destroyed=${probe.destroyed} inDom=${inDom}`;
    };
    Object.assign(probe, { constructed: 0, inits: 0, destroyed: 0 });
    const fixture = TestBed.createComponent(GateHost);
    const gate = (): ProjectedGate => fixture.debugElement.query(By.directive(ProjectedGate)).componentInstance;
    fixture.detectChanges();
    log(`closed ${state(fixture)}`);
    gate().open.set(true);
    fixture.detectChanges();
    log(`opened ${state(fixture)}`);
    gate().open.set(false);
    fixture.detectChanges();
    log(`closed ${state(fixture)}`);
    expect(lines).toEqual([
      'closed constructed=1 inits=1 destroyed=0 inDom=false',
      'opened constructed=1 inits=1 destroyed=0 inDom=true',
      'closed constructed=1 inits=1 destroyed=0 inDom=false',
    ]);
  });
  it('Q19.14 a column template reads the declaring component, the context adds the row and the index', () => {
    const fixture = TestBed.createComponent(CellHost);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    const cells = (): string[] => markup(root.querySelector('lab-m19-q14-table')!).split(/(?<=[\])])/);
    log(cells()[0]);
    log(cells()[1]);
    fixture.componentInstance.hostField.set('changed');
    fixture.detectChanges();
    log(cells()[0]);
    expect(lines).toEqual(['[Ann|host-field|n/a]', '(#0 Ann)', '[Ann|changed|n/a]']);
  });

  it('Q19.15 ng-content inside a template rendered twice stays in the last copy, and a content template fills both', () => {
    const twice = TestBed.createComponent(RenderedTwiceHost);
    twice.detectChanges();
    log(markup(twice.nativeElement.querySelector('lab-m19-q15-twice')));

    const fixed = TestBed.createComponent(RenderedTwiceFixedHost);
    fixed.detectChanges();
    log(markup(fixed.nativeElement.querySelector('lab-m19-q15-fixed')));
    expect(lines).toEqual(['<i><b></b></i><u><b>X</b></u>', '<i><b>X</b></i><u><b>X</b></u>']);
  });

  it('Q19.15 the platform keeps a DOM node in one place: appending it to a second element moves it', () => {
    const first = document.createElement('div');
    const second = document.createElement('div');
    const node = document.createElement('b');
    first.appendChild(node);
    second.appendChild(node);
    expect(first.contains(node)).toBe(false);
    expect(second.contains(node)).toBe(true);
  });

  it('Q19.17 a view query finds the own template, a content query the projected nodes, and neither reads a child template', () => {
    const fixture = TestBed.createComponent(ReachHost);
    fixture.detectChanges();
    const box = fixture.debugElement.query(By.directive(ReachBox)).componentInstance as ReachBox;
    const found = (value: unknown): string => (value === undefined ? 'none' : 'found');
    log(`view own=${found(box.viewOwn())} given=${found(box.viewGiven())} inside=${found(box.viewInside())}`);
    log(`content own=${found(box.contentOwn())} given=${found(box.contentGiven())} inside=${found(box.contentInside())}`);
    expect(lines).toEqual(['view own=found given=none inside=none', 'content own=none given=found inside=none']);
    expect(fixture.nativeElement.querySelectorAll('i').length).toBe(2);
    expect(fixture.nativeElement.querySelector('lab-m19-q17-box u')).not.toBeNull();
  });

  it('Q19.18 contentChild finds the nested-only item and the outer match first, contentChildren finds none unless descendants is true', () => {
    const fixture = TestBed.createComponent(CountingHost);
    fixture.detectChanges();
    const boxes = fixture.debugElement.queryAll(By.directive(CountingBox));
    for (const box of boxes) {
      const instance = box.componentInstance as CountingBox;
      log(`${(box.nativeElement as HTMLElement).id}: ${instance.summary()}`);
    }
    expect(lines).toEqual([
      'both: contentChild=found contentChildren=1 descendants=2',
      'nested: contentChild=found contentChildren=0 descendants=1',
      'none: contentChild=undefined contentChildren=0 descendants=0',
    ]);
    const both = boxes[0].componentInstance as CountingBox;
    expect(both.first()).toBe(both.direct()[0]);
  });

  it('Q19.19 a plain element reads as ElementRef, a template as TemplateRef and a component as its instance, and read changes it', () => {
    const fixture = TestBed.createComponent(ReadProbe);
    fixture.detectChanges();
    const probe = fixture.componentInstance;
    expect(probe.elementDefault()).toBeInstanceOf(ElementRef);
    expect(probe.templateDefault()).toBeInstanceOf(TemplateRef);
    expect(probe.componentDefault()).toBeInstanceOf(ReadLeaf);
    expect(probe.componentElement()).toBeInstanceOf(ElementRef);
    expect(probe.templateRead()).toBeInstanceOf(TemplateRef);
    const span = (fixture.nativeElement as HTMLElement).querySelector('span')!;
    expect((probe.elementDefault() as ElementRef<HTMLElement>).nativeElement).toBe(span);
    expect(probe.injectorAtElement()!.get(ElementRef).nativeElement).toBe(span);

    probe.containerAtElement()!.createEmbeddedView(probe.templateRead()!);
    expect(markup(fixture.nativeElement)).toBe('<span>a</span>t<lab-m19-q19-leaf></lab-m19-q19-leaf>');
  });

  it('Q19.21 each query form holds its result from a different stage', () => {
    const fixture = TestBed.createComponent(TimedHost);
    fixture.detectChanges();
    const probe = fixture.debugElement.query(By.directive(TimedProbe)).componentInstance as TimedProbe;
    probe.show.set(true);
    fixture.detectChanges();
    probe.stage('after the @if turned true');
    expect(lines).toEqual([
      'constructor: nothing',
      'ngOnInit: viewChild(a), contentChild, @ViewChild(a, static)',
      'ngAfterContentInit: viewChild(a), contentChild, @ViewChild(a, static), @ContentChild',
      'ngAfterViewInit: viewChild(a), contentChild, @ViewChild(a, static), @ViewChild(a), @ContentChild',
      'after the @if turned true: viewChild(a), viewChild(b), contentChild, @ViewChild(a, static), @ViewChild(a), @ViewChild(b), @ContentChild',
    ]);
  });

  it('Q19.22 a setter runs at every binding and a computed over a signal input runs when it is read, once per value', () => {
    const fixture = TestBed.createComponent(DerivedHost);
    fixture.detectChanges();
    fixture.componentInstance.n.set(4);
    fixture.detectChanges();
    const setter = fixture.debugElement.query(By.directive(SetterBox)).componentInstance as SetterBox;
    const signalBox = fixture.debugElement.query(By.directive(SignalBox)).componentInstance as SignalBox;
    log(`setter calls=${setter.calls} doubled=${setter.doubled}`);
    log(`computed evaluations=${signalBox.evaluations}`);
    log(`computed doubled=${signalBox.doubled()} evaluations=${signalBox.evaluations}`);
    log(`computed doubled=${signalBox.doubled()} evaluations=${signalBox.evaluations}`);
    expect(lines).toEqual([
      'setter calls=2 doubled=8',
      'computed evaluations=0',
      'computed doubled=8 evaluations=1',
      'computed doubled=8 evaluations=1',
    ]);
  });

  it('Q19.24 an output() read through outputToObservable can be piped like the EventEmitter was', () => {
    const fixture = TestBed.createComponent(PipedOutput);
    fixture.componentInstance.picked.emit(4);
    expect(fixture.componentInstance.doubled).toBe(8);
  });

  it('Q19.26 bindings follow the signals and setInput throws once an input binding exists', () => {
    const appRef = TestBed.inject(ApplicationRef);
    const environmentInjector = TestBed.inject(EnvironmentInjector);
    const label = signal('L1');
    const two = signal('T1');
    const bound = createComponent(BoundDyn, {
      environmentInjector,
      bindings: [
        inputBinding('label', label),
        inputBinding('n', () => 3),
        twoWayBinding('v', two),
        outputBinding<number>('done', (value) => log(`done ${value}`)),
      ],
    });
    appRef.attachView(bound.hostView);
    const text = (): string => bound.location.nativeElement.textContent ?? '';
    bound.changeDetectorRef.detectChanges();
    log(text());
    label.set('L2');
    bound.changeDetectorRef.detectChanges();
    log(text());
    bound.instance.v.set('T2');
    log(`two=${two()}`);
    bound.instance.done.emit(9);

    const labelOnly = createComponent(BoundDyn, { environmentInjector, bindings: [inputBinding('label', () => 'x')] });
    for (const attempt of [() => bound.setInput('n', 4), () => labelOnly.setInput('n', 4)]) {
      try {
        attempt();
      } catch (error) {
        log((error as Error).message.split(' Find more')[0]);
      }
    }

    const plain = createComponent(BoundDyn, { environmentInjector });
    plain.setInput('label', 'S');
    plain.changeDetectorRef.detectChanges();
    log(plain.location.nativeElement.textContent ?? '');
    expect(lines).toEqual([
      'L1|3|T1',
      'L2|3|T1',
      'two=T2',
      'done 9',
      'NG0317: Cannot call `setInput` on a component that is using the `inputBinding` or `twoWayBinding` functions.',
      'NG0317: Cannot call `setInput` on a component that is using the `inputBinding` or `twoWayBinding` functions.',
      'S|0|M0',
    ]);
    for (const ref of [bound, labelOnly, plain]) ref.destroy();
  });

  it('Q19.28 the mirror reports each input and output under its template name, the flag, and the slots, but no required flag', () => {
    const mirror = reflectComponentType(Mirrored)!;
    log(`selector ${mirror.selector}, standalone ${mirror.isStandalone}`);
    log(
      `inputs ${mirror.inputs
        .map((i) => `${i.propName}>${i.templateName} ${i.isSignal ? 'signal' : 'decorator'}${i.transform ? '+transform' : ''}`)
        .join(', ')}`,
    );
    log(`outputs ${mirror.outputs.map((o) => `${o.propName}>${o.templateName}`).join(', ')}`);
    log(`slots ${JSON.stringify(mirror.ngContentSelectors)}`);
    expect(lines).toEqual([
      'selector lab-m19-q28-c, standalone true',
      'inputs label>label signal, n>count signal, v>v signal, legacy>legacy decorator, len>len decorator+transform',
      'outputs v>vChange, done>done, legacyOut>legacyOut',
      'slots ["[title]","*"]',
    ]);
    expect(Object.keys(mirror.inputs[0]).sort()).toEqual(['isSignal', 'propName', 'templateName']);
  });
});
