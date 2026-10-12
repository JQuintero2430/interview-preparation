import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

// --- Plain field: an Eager parent (the pre-v22 default) and a default (OnPush) parent ---

@Component({ selector: 'lab-m20-s6-plain-child', template: `child` })
class PlainChild implements OnInit {
  private readonly parent = inject(EagerPar);
  ngOnInit(): void {
    this.parent.title = 'changed';
  }
}

@Component({
  selector: 'lab-m20-s6-eager-par',
  imports: [PlainChild],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `<h1>{{ title }}</h1><lab-m20-s6-plain-child />`,
})
class EagerPar {
  title = 'initial';
}

@Component({ selector: 'lab-m20-s6-plain-child-two', template: `child` })
class PlainChildTwo implements OnInit {
  private readonly parent = inject(Par);
  ngOnInit(): void {
    this.parent.title = 'changed';
  }
}

@Component({
  selector: 'lab-m20-s6-par',
  imports: [PlainChildTwo],
  template: `<h1>{{ title }}</h1><lab-m20-s6-plain-child-two />`,
})
class Par {
  title = 'initial';
}

// --- Signal writes in ngOnInit and ngAfterViewInit ---

@Component({ selector: 'lab-m20-s6-signal-child', template: `child` })
class SignalChild implements OnInit, AfterViewInit {
  private readonly parent = inject(SignalPar);
  ngOnInit(): void {
    this.parent.fromInit.set('changed');
  }
  ngAfterViewInit(): void {
    this.parent.fromView.set('changed');
  }
}

@Component({
  selector: 'lab-m20-s6-signal-par',
  imports: [SignalChild],
  template: `<h1>{{ fromInit() }}-{{ fromView() }}</h1><lab-m20-s6-signal-child />`,
})
class SignalPar {
  readonly fromInit = signal('initial');
  readonly fromView = signal('initial');
}

// --- A template method with a side effect ---

@Component({
  selector: 'lab-m20-s6-counter',
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `{{ now() }}`,
})
class Counter {
  private n = 0;
  now(): number {
    return ++this.n;
  }
}

// --- A signal written from afterNextRender ---

@Component({ selector: 'lab-m20-s6-render-child', template: `child` })
class RenderChild {
  private readonly parent = inject(RenderPar);
  constructor() {
    afterNextRender(() => this.parent.text.set('after-render'));
  }
}

@Component({
  selector: 'lab-m20-s6-render-par',
  imports: [RenderChild],
  template: `<h1>{{ text() }}</h1><lab-m20-s6-render-child />`,
})
class RenderPar {
  readonly text = signal('initial');
}

// --- detectChanges on the parent's view after a plain-field write in ngAfterViewInit ---

@Component({ selector: 'lab-m20-s6-detect-child', template: `child` })
class DetectChild implements AfterViewInit {
  private readonly parent = inject(DetectPar);
  ngAfterViewInit(): void {
    this.parent.title = 'x';
    this.parent.view.detectChanges();
  }
}

@Component({
  selector: 'lab-m20-s6-detect-par',
  imports: [DetectChild],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `<h1>{{ title }}</h1><lab-m20-s6-detect-child />`,
})
class DetectPar {
  title = 'initial';
  readonly view = inject(ChangeDetectorRef);
}

describe('Section 6: ExpressionChangedAfterItHasBeenCheckedError', () => {
  it('Section 6: a child writing a plain field into an Eager parent throws NG0100 with the previous and current values', () => {
    const fixture = TestBed.createComponent(EagerPar);
    let message = '';
    try {
      fixture.detectChanges();
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toContain('NG0100: ExpressionChangedAfterItHasBeenCheckedError');
    expect(message).toContain("Previous value: 'initial'. Current value: 'changed'.");
    expect(message).toMatch(/Expression location: _?EagerPar component\./);
  });

  it('Section 6: the same write into a default OnPush parent shows stale text and throws nothing', () => {
    const fixture = TestBed.createComponent(Par);
    fixture.detectChanges();
    expect(fixture.componentInstance.title).toBe('changed');
    expect(fixture.nativeElement.querySelector('h1').textContent).toBe('initial');
  });

  it('Section 6: a signal written in ngOnInit or ngAfterViewInit is rendered without an error', () => {
    const fixture = TestBed.createComponent(SignalPar);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h1').textContent).toBe('changed-changed');
  });

  it('Section 6: a template method with a side effect throws NG0100', () => {
    const fixture = TestBed.createComponent(Counter);
    let message = '';
    try {
      fixture.detectChanges();
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toContain("Previous value: '1'. Current value: '2'.");
  });

  it('Section 6: a signal written from afterNextRender is rendered without an error', async () => {
    const fixture = TestBed.createComponent(RenderPar);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h1').textContent).toBe('after-render');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('h1').textContent).toBe('after-render');
  });

  it('Section 6: detectChanges after a plain-field write in ngAfterViewInit avoids the error in an Eager parent', () => {
    const fixture = TestBed.createComponent(DetectPar);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h1').textContent).toBe('x');
  });
});
