import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, input, model, output, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

// --- Timing: a signal input holds its default in the constructor and the bound value in ngOnInit ---

@Component({
  selector: 'lab-m19-s1-timing',
  template: `{{ n() }}`,
})
class Timing implements OnInit {
  readonly n = input(0);
  readonly seen: number[] = [this.n()];

  ngOnInit(): void {
    this.seen.push(this.n());
  }
}

@Component({
  selector: 'lab-m19-s1-timing-host',
  imports: [Timing],
  template: `<lab-m19-s1-timing [n]="5" />`,
})
class TimingHost {}

// --- ngOnChanges reports signal inputs and decorator inputs together ---

@Component({
  selector: 'lab-m19-s1-changes',
  template: `{{ n() }} {{ plain }}`,
})
class Changes implements OnChanges {
  readonly n = input(0);
  // Legacy decorator form, kept to show that both kinds reach ngOnChanges.
  @Input() plain = '';
  readonly reports: string[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    const keys = Object.keys(changes).sort();
    const parts = keys.map((key) => {
      const change = changes[key];
      return `${key}:${String(change.previousValue)}>${String(change.currentValue)}:${change.firstChange}`;
    });
    this.reports.push(parts.join(','));
  }
}

@Component({
  selector: 'lab-m19-s1-changes-host',
  imports: [Changes],
  template: `<lab-m19-s1-changes [n]="n()" [plain]="plain()" />`,
})
class ChangesHost {
  readonly n = signal(1);
  readonly plain = signal('a');
}

// --- Emitting too early: the parent subscribes after the child is constructed ---

@Component({
  selector: 'lab-m19-s1-emitter',
  template: ``,
})
class Emitter implements OnInit {
  readonly done = output<string>();
  // Legacy decorator form of the same output.
  @Output() readonly legacyDone = new EventEmitter<string>();

  constructor() {
    this.done.emit('output in constructor');
    this.legacyDone.emit('emitter in constructor');
  }

  ngOnInit(): void {
    this.done.emit('output in ngOnInit');
    this.legacyDone.emit('emitter in ngOnInit');
  }
}

@Component({
  selector: 'lab-m19-s1-emitter-host',
  imports: [Emitter],
  template: `<lab-m19-s1-emitter (done)="received.push($event)" (legacyDone)="received.push($event)" />`,
})
class EmitterHost {
  readonly received: string[] = [];
}

// --- model: [(value)] writes the parent signal; [value] and (valueChange) work separately ---

@Component({
  selector: 'lab-m19-s1-rating',
  template: `<button (click)="value.set(3)">three</button>{{ value() }}`,
})
class Rating {
  readonly value = model(0);
}

@Component({
  selector: 'lab-m19-s1-rating-host',
  imports: [Rating],
  template: `<lab-m19-s1-rating [(value)]="score" />`,
})
class RatingHost {
  readonly score = signal(1);
}

@Component({
  selector: 'lab-m19-s1-rating-split-host',
  imports: [Rating],
  template: `<lab-m19-s1-rating [value]="score()" (valueChange)="changes.push($event)" />`,
})
class RatingSplitHost {
  readonly score = signal(1);
  readonly changes: number[] = [];
}

// --- An output is not a DOM event ---

@Component({
  selector: 'lab-m19-s1-pinger',
  template: ``,
})
class Pinger {
  readonly ping = output<void>();
}

@Component({
  selector: 'lab-m19-s1-pinger-host',
  imports: [Pinger],
  template: `
    <div id="wrapper" (ping)="log.push('wrapper')">
      <lab-m19-s1-pinger (ping)="log.push('child')" />
    </div>
  `,
})
class PingerHost {
  readonly log: string[] = [];
}

// --- A shared object mutated by one child: only the view that handled the event refreshes ---

interface User {
  name: string;
}

@Component({
  selector: 'lab-m19-s1-user-edit',
  template: `<button (click)="shout()">{{ user().name }}</button>`,
})
class UserEdit {
  readonly user = input.required<User>();

  shout(): void {
    this.user().name += '!';
  }
}

@Component({
  selector: 'lab-m19-s1-user-view',
  template: `<p>{{ user().name }}</p>`,
})
class UserView {
  readonly user = input.required<User>();
}

@Component({
  selector: 'lab-m19-s1-user-host',
  imports: [UserEdit, UserView],
  template: `
    <lab-m19-s1-user-edit [user]="user" />
    <lab-m19-s1-user-view [user]="user" />
  `,
})
class UserHost {
  readonly user: User = { name: 'x' };
}

describe('Section 1: inputs, outputs and two-way binding', () => {
  it('Section 1: a signal input holds its default in the constructor and the bound value in ngOnInit', () => {
    const fixture = TestBed.createComponent(TimingHost);
    fixture.detectChanges();
    const child = fixture.debugElement.query(By.directive(Timing)).componentInstance as Timing;
    expect(child.seen).toEqual([0, 5]);
  });

  it('Section 1: ngOnChanges reports signal inputs and decorator inputs', () => {
    const fixture = TestBed.createComponent(ChangesHost);
    fixture.detectChanges();
    const child = fixture.debugElement.query(By.directive(Changes)).componentInstance as Changes;
    expect(child.reports).toEqual(['n:undefined>1:true,plain:undefined>a:true']);

    fixture.componentInstance.n.set(2);
    fixture.detectChanges();
    expect(child.reports.at(-1)).toBe('n:1>2:false');

    fixture.componentInstance.plain.set('b');
    fixture.detectChanges();
    expect(child.reports.at(-1)).toBe('plain:a>b:false');
  });

  it('Section 1: an output emitted in the constructor is lost and one emitted in ngOnInit is delivered', () => {
    const fixture = TestBed.createComponent(EmitterHost);
    fixture.detectChanges();
    expect(fixture.componentInstance.received).toEqual(['output in ngOnInit', 'emitter in ngOnInit']);
  });

  it('Section 1: a model with [(value)] writes the parent signal', () => {
    const fixture = TestBed.createComponent(RatingHost);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.textContent).toContain('1');

    root.querySelector('button')!.click();
    expect(fixture.componentInstance.score()).toBe(3);

    fixture.componentInstance.score.set(5);
    fixture.detectChanges();
    expect(root.textContent).toContain('5');
  });

  it('Section 1: a model accepts [value] and (valueChange) bound separately', () => {
    const fixture = TestBed.createComponent(RatingSplitHost);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.textContent).toContain('1');

    root.querySelector('button')!.click();
    expect(fixture.componentInstance.changes).toEqual([3]);
    expect(fixture.componentInstance.score()).toBe(1);
  });

  it('Section 1: an output is not a DOM event and a DOM event of the same name reaches the listener', () => {
    const fixture = TestBed.createComponent(PingerHost);
    fixture.detectChanges();
    const pinger = fixture.debugElement.query(By.directive(Pinger));

    (pinger.componentInstance as Pinger).ping.emit();
    expect(fixture.componentInstance.log).toEqual(['child']);

    fixture.componentInstance.log.length = 0;
    pinger.nativeElement.dispatchEvent(new CustomEvent('ping', { bubbles: true }));
    expect(fixture.componentInstance.log).toEqual(['child', 'wrapper']);
  });

  it('Section 1: mutating a shared input object refreshes only the view that handled the event', () => {
    const fixture = TestBed.createComponent(UserHost);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('button')!.textContent).toBe('x');
    expect(root.querySelector('p')!.textContent).toBe('x');

    root.querySelector('button')!.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.user.name).toBe('x!');
    expect(root.querySelector('button')!.textContent).toBe('x!');
    expect(root.querySelector('p')!.textContent).toBe('x');
  });
});
