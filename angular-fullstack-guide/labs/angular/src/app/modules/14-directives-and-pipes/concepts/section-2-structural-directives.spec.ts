import {
  Component,
  Directive,
  effect,
  inject,
  InjectionToken,
  input,
  OnDestroy,
  signal,
  TemplateRef,
  untracked,
  ViewContainerRef,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NgTemplateOutlet } from '@angular/common';
import { Each, RepeatDemo } from './repeat-demo';

// `*labRepeat="n(); let v; let i = index; let first = first"`: a naked expression binds [labRepeat],
// and the context carries $implicit plus named keys.
@Directive({ selector: '[labRepeat]' })
class Repeat {
  readonly labRepeat = input.required<number>();
  private readonly template = inject<TemplateRef<unknown>>(TemplateRef);
  private readonly container = inject(ViewContainerRef);

  constructor() {
    effect(() => {
      const count = this.labRepeat();
      untracked(() => {
        this.container.clear();
        for (let index = 0; index < count; index++) {
          this.container.createEmbeddedView(this.template, { $implicit: index * 10, index, first: index === 0 });
        }
      });
    });
  }
}

// `*labUnless="hide(); else other"`: the key `else` binds the input labUnlessElse.
@Directive({ selector: '[labUnless]' })
class Unless {
  readonly labUnless = input.required<boolean>();
  readonly labUnlessElse = input<TemplateRef<unknown> | null>(null);
  private readonly template = inject<TemplateRef<unknown>>(TemplateRef);
  private readonly container = inject(ViewContainerRef);

  constructor() {
    effect(() => {
      const hide = this.labUnless();
      const other = this.labUnlessElse();
      untracked(() => {
        this.container.clear();
        const chosen = hide ? other : this.template;
        if (chosen) {
          this.container.createEmbeddedView(chosen);
        }
      });
    });
  }
}

// Counts how many embedded views were destroyed.
const destroyed: string[] = [];

@Directive({ selector: '[labProbe]' })
class Probe implements OnDestroy {
  readonly labProbe = input('');

  ngOnDestroy(): void {
    destroyed.push(this.labProbe());
  }
}

// A context guard whose body throws: it is only there for the type checker.
@Directive({ selector: '[labGuarded]' })
class Guarded {
  readonly labGuarded = input.required<string>();
  private readonly template = inject<TemplateRef<{ $implicit: string }>>(TemplateRef);
  private readonly container = inject(ViewContainerRef);

  constructor() {
    effect(() => {
      const value = this.labGuarded();
      untracked(() => this.container.createEmbeddedView(this.template, { $implicit: value }));
    });
  }

  static ngTemplateContextGuard(_directive: Guarded, _context: unknown): _context is { $implicit: string } {
    throw new Error('the guard body ran');
  }
}

@Component({
  selector: 'lab-s2-short-host',
  imports: [Each],
  template: `<ul><li *labEach="let name of names(); let i = index">{{ i }}-{{ name }}</li></ul>`,
})
class ShortHost {
  readonly names = signal(['ada', 'grace']);
}

@Component({
  selector: 'lab-s2-long-host',
  imports: [Each],
  template: `<ul><ng-template labEach let-name [labEachOf]="names()" let-i="index"><li>{{ i }}-{{ name }}</li></ng-template></ul>`,
})
class LongHost {
  readonly names = signal(['ada', 'grace']);
}

@Component({
  selector: 'lab-s2-repeat-host',
  imports: [Repeat],
  template: `<ol><li *labRepeat="n(); let v; let i = index; let first = first">{{ v }}-{{ i }}-{{ first }}</li></ol>`,
})
class RepeatHost {
  readonly n = signal(2);
}

@Component({
  selector: 'lab-s2-unless-host',
  imports: [Unless, Probe],
  template: `
    <section>
      <p *labUnless="hide(); else other" labProbe="main">main</p>
      <ng-template #other><p labProbe="else">else</p></ng-template>
    </section>
  `,
})
class UnlessHost {
  readonly hide = signal(false);
}

@Component({
  selector: 'lab-s2-guard-host',
  imports: [Guarded],
  template: `<b *labGuarded="'x'; let value">{{ value.toUpperCase() }}</b>`,
})
class GuardHost {}

const DECLARED = new InjectionToken<string>('lab-s2-declared', { factory: () => 'root' });

@Directive({ selector: '[labWho]', exportAs: 'labWho' })
class Who {
  readonly seen = inject(DECLARED);
}

@Component({
  selector: 'lab-s2-renderer',
  imports: [NgTemplateOutlet],
  providers: [{ provide: DECLARED, useValue: 'renderer' }],
  template: `<ng-container *ngTemplateOutlet="content()" />`,
})
class Renderer {
  readonly content = input.required<TemplateRef<unknown>>();
}

@Component({
  selector: 'lab-s2-declarer',
  imports: [Renderer, Who],
  providers: [{ provide: DECLARED, useValue: 'declarer' }],
  template: `
    <ng-template #tpl><i labWho #who="labWho">{{ who.seen }}</i></ng-template>
    <lab-s2-renderer [content]="tpl" />
  `,
})
class Declarer {}

function mount<T>(type: new () => T) {
  const fixture = TestBed.createComponent(type);
  fixture.detectChanges();
  return fixture;
}

function texts(root: HTMLElement, selector: string): string[] {
  return Array.from(root.querySelectorAll(selector)).map((node) => node.textContent ?? '');
}

describe('Section 2: structural directives', () => {
  it('Section 2: the shorthand and the long form render the same DOM', () => {
    const short = mount(ShortHost);
    const long = mount(LongHost);

    expect(texts(short.nativeElement, 'li')).toEqual(['0-ada', '1-grace']);
    expect((short.nativeElement as HTMLElement).innerHTML).toBe((long.nativeElement as HTMLElement).innerHTML);

    short.componentInstance.names.set(['linus']);
    long.componentInstance.names.set(['linus']);
    short.detectChanges();
    long.detectChanges();
    expect(texts(short.nativeElement, 'li')).toEqual(['0-linus']);
    expect((short.nativeElement as HTMLElement).innerHTML).toBe((long.nativeElement as HTMLElement).innerHTML);
  });

  it('Section 2: microsyntax keys bind prefixed inputs and let variables read the context', () => {
    const fixture = mount(RepeatHost);
    expect(texts(fixture.nativeElement, 'li')).toEqual(['0-0-true', '10-1-false']);

    fixture.componentInstance.n.set(3);
    fixture.detectChanges();
    expect(texts(fixture.nativeElement, 'li')).toEqual(['0-0-true', '10-1-false', '20-2-false']);
  });

  it('Section 2: a structural directive creates, replaces and clears embedded views', () => {
    const fixture = mount(RepeatHost);
    const root: HTMLElement = fixture.nativeElement;
    const firstBefore = root.querySelector('li');

    fixture.componentInstance.n.set(3);
    fixture.detectChanges();
    expect(root.querySelectorAll('li')).toHaveLength(3);
    // This directive clears and recreates, so the first item is a new node.
    expect(root.querySelector('li')).not.toBe(firstBefore);

    fixture.componentInstance.n.set(0);
    fixture.detectChanges();
    expect(root.querySelectorAll('li')).toHaveLength(0);
    // The anchor comment of the view container stays.
    expect(root.querySelector('ol')?.childNodes[0].nodeType).toBe(8);
  });

  it('Section 2: an else template is rendered through the same view container', () => {
    const fixture = mount(UnlessHost);
    const section: HTMLElement = fixture.nativeElement.querySelector('section');
    expect(texts(section, 'p')).toEqual(['main']);

    fixture.componentInstance.hide.set(true);
    fixture.detectChanges();
    // One view at a time: the main view was replaced, not kept beside the else view.
    expect(texts(section, 'p')).toEqual(['else']);

    fixture.componentInstance.hide.set(false);
    fixture.detectChanges();
    expect(texts(section, 'p')).toEqual(['main']);
  });

  it('Section 2: embedded views are destroyed with the directive', () => {
    destroyed.length = 0;
    const fixture = mount(UnlessHost);
    expect(destroyed).toEqual([]);

    fixture.componentInstance.hide.set(true);
    fixture.detectChanges();
    expect(destroyed).toEqual(['main']);

    fixture.destroy();
    expect(destroyed).toEqual(['main', 'else']);
  });

  it('Section 2: an embedded view injects from where the template is declared, not where it renders', () => {
    const fixture = mount(Declarer);
    expect(texts(fixture.nativeElement, 'i')).toEqual(['declarer']);
  });

  it('Section 2: a context guard body never runs, it only types the template', () => {
    const fixture = mount(GuardHost);
    expect(texts(fixture.nativeElement, 'b')).toEqual(['X']);
  });

  it('Section 2: Each and Show from the repeat demo render and update', () => {
    const fixture = mount(RepeatDemo);
    expect(texts(fixture.nativeElement, 'li')).toEqual(['0:ADA', '1:GRACE']);
    expect(texts(fixture.nativeElement, 'p')).toEqual(['3']);

    fixture.componentInstance.names.set(['linus']);
    fixture.detectChanges();
    expect(texts(fixture.nativeElement, 'li')).toEqual(['0:LINUS']);
  });
});
