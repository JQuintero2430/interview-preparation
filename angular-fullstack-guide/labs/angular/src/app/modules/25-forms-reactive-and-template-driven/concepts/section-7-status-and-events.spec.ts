import { Component } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TestBed } from '@angular/core/testing';
import {
  AbstractControl,
  ControlEvent,
  FormArray,
  FormControl,
  FormGroup,
  FormResetEvent,
  FormSubmittedEvent,
  PristineChangeEvent,
  ReactiveFormsModule,
  StatusChangeEvent,
  TouchedChangeEvent,
  ValueChangeEvent,
  Validators,
} from '@angular/forms';
import { Subject } from 'rxjs';
import { labM25EventsSaveIndicator, labM25LegacySaveIndicator } from '../legacy/legacy-apis';

function kind(event: ControlEvent): string {
  if (event instanceof ValueChangeEvent) return 'value';
  if (event instanceof StatusChangeEvent) return 'status';
  if (event instanceof PristineChangeEvent) return 'pristine';
  if (event instanceof TouchedChangeEvent) return 'touched';
  if (event instanceof FormSubmittedEvent) return 'submitted';
  if (event instanceof FormResetEvent) return 'reset';
  return 'unknown';
}

function setUp() {
  const c = new FormControl('a', { nonNullable: true, validators: Validators.required });
  const g = new FormGroup({ c });
  const log: string[] = [];
  const parentValueSeenByChild: unknown[] = [];
  c.events.subscribe((event) => log.push(`c:${kind(event)}`));
  g.events.subscribe((event) => log.push(`g:${kind(event)}`));
  c.valueChanges.subscribe(() => {
    log.push('c:valueChanges');
    parentValueSeenByChild.push(g.value);
  });
  g.valueChanges.subscribe(() => log.push('g:valueChanges'));
  return { c, g, log, parentValueSeenByChild };
}

@Component({
  selector: 'lab-m25-blur-host',
  imports: [ReactiveFormsModule],
  template: '<input [formControl]="blur" />',
})
class LabM25BlurHost {
  readonly blur = new FormControl('', { nonNullable: true, updateOn: 'blur' });
}

@Component({
  selector: 'lab-m25-value-host',
  imports: [ReactiveFormsModule],
  template: '<input id="i" [formControl]="c" /><p>{{ c.value }}</p>',
})
class LabM25ValueHost {
  readonly c = new FormControl('a', { nonNullable: true });
}

@Component({
  selector: 'lab-m25-status-host',
  imports: [ReactiveFormsModule],
  template: '<input [formControl]="c" /><p>{{ c.value }}|{{ c.status }}|{{ c.touched }}</p>',
})
class LabM25StatusHost {
  readonly c = new FormControl('a', { nonNullable: true, validators: Validators.required });
}

@Component({
  selector: 'lab-m25-signal-host',
  imports: [ReactiveFormsModule],
  template: '<input [formControl]="c" /><p>{{ v() }}</p>',
})
class LabM25SignalHost {
  readonly c = new FormControl('a', { nonNullable: true });
  protected readonly v = toSignal(this.c.valueChanges, { initialValue: this.c.value });
}

@Component({
  selector: 'lab-m25-array-host',
  imports: [ReactiveFormsModule],
  template:
    '<form [formGroup]="g"><div formArrayName="items">@for (item of items.controls; track $index) { <input [formControlName]="$index" /> }</div></form><p>{{ items.length }}</p>',
})
class LabM25ArrayHost {
  readonly items = new FormArray([new FormControl('a', { nonNullable: true, validators: Validators.required })]);
  readonly g = new FormGroup({ items: this.items });
}

@Component({
  selector: 'lab-m25-submit-host',
  imports: [ReactiveFormsModule],
  template:
    '<form [formGroup]="g" (ngSubmit)="submitted = submitted + 1"><input formControlName="c" /><button type="submit">Go</button></form>',
})
class LabM25SubmitHost {
  readonly g = new FormGroup({ c: new FormControl('', { nonNullable: true, validators: Validators.required }) });
  submitted = 0;
}

describe('Section 7: status, updateOn, valueChanges and events', () => {
  it("Section 7: a child's events fire before its parent's", () => {
    const { c, log } = setUp();
    c.setValue('');
    expect(log).toEqual(['c:value', 'c:status', 'c:valueChanges', 'g:value', 'g:status', 'g:valueChanges']);
  });

  it("Section 7: a valueChanges subscriber on the child sees the parent's old value", () => {
    const { c, g, parentValueSeenByChild } = setUp();
    c.setValue('');
    expect(parentValueSeenByChild).toEqual([{ c: 'a' }]);
    expect(g.value).toEqual({ c: '' });
  });

  it('Section 7: markAsTouched announces the parent first', () => {
    const { c, log } = setUp();
    c.markAsTouched();
    expect(log).toEqual(['g:touched', 'c:touched']);
  });

  it('Section 7: markAsDirty announces the parent first', () => {
    const { c, log } = setUp();
    c.markAsDirty();
    expect(log).toEqual(['g:pristine', 'c:pristine']);
  });

  it('Section 7: reset emits pristine, touched, value, status and reset events', () => {
    const { c, g, log } = setUp();
    c.markAsDirty();
    c.markAsTouched();
    log.length = 0;
    g.reset();
    expect(log).toEqual([
      'c:pristine',
      'c:touched',
      'c:value',
      'c:status',
      'c:valueChanges',
      'c:reset',
      'g:pristine',
      'g:touched',
      'g:value',
      'g:status',
      'g:valueChanges',
      'g:reset',
    ]);
  });

  it('Section 7: emitEvent false emits nothing and onlySelf leaves the parent stale', () => {
    const { c, g, log } = setUp();
    c.setValue('q', { emitEvent: false });
    expect(log).toEqual([]);
    expect(g.value).toEqual({ c: 'q' });
    c.setValue('r', { onlySelf: true });
    expect(log).toEqual(['c:value', 'c:status', 'c:valueChanges']);
    expect(c.value).toBe('r');
    expect(g.value).toEqual({ c: 'q' });
  });

  it('Section 7: valueChanges does not emit on subscribe', () => {
    const control = new FormControl('a');
    const seen: unknown[] = [];
    control.valueChanges.subscribe((value) => seen.push(value));
    expect(seen).toEqual([]);
    control.setValue('b');
    expect(seen).toEqual(['b']);
  });

  it('Section 7: updateOn blur writes the model on blur only', () => {
    const fixture = TestBed.createComponent(LabM25BlurHost);
    fixture.detectChanges();
    const control = fixture.componentInstance.blur;
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'typed';
    input.dispatchEvent(new Event('input'));
    expect(control.value).toBe('');
    expect(control.touched).toBe(false);
    input.dispatchEvent(new Event('blur'));
    expect(control.value).toBe('typed');
    expect(control.touched).toBe(true);
    control.setValue('code');
    expect(control.value).toBe('code');
  });

  it('Section 7: a programmatic setValue does not mark the control dirty', () => {
    const control = new FormControl('a');
    control.setValue('b');
    expect(control.value).toBe('b');
    expect(control.dirty).toBe(false);
    expect(control.pristine).toBe(true);
    control.markAsDirty();
    expect(control.dirty).toBe(true);
  });

  it('Section 7: typing marks the control dirty and blurring marks it touched', () => {
    const fixture = TestBed.createComponent(LabM25ValueHost);
    fixture.detectChanges();
    const control = fixture.componentInstance.c;
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'typed';
    input.dispatchEvent(new Event('input'));
    expect(control.dirty).toBe(true);
    expect(control.touched).toBe(false);
    input.dispatchEvent(new Event('blur'));
    expect(control.touched).toBe(true);
  });

  it('Section 7: the four statuses and their booleans', () => {
    const answer = new Subject<null>();
    const control = new FormControl('', { validators: Validators.required, asyncValidators: () => answer });
    expect(control.status).toBe('INVALID');
    expect([control.valid, control.invalid, control.pending, control.disabled]).toEqual([false, true, false, false]);
    control.setValue('x');
    expect(control.status).toBe('PENDING');
    expect([control.valid, control.invalid, control.pending, control.disabled]).toEqual([false, false, true, false]);
    answer.next(null);
    expect(control.status).toBe('VALID');
    expect([control.valid, control.invalid, control.pending, control.disabled]).toEqual([true, false, false, false]);
    control.disable();
    expect(control.status).toBe('DISABLED');
    expect([control.valid, control.invalid, control.pending, control.disabled]).toEqual([false, false, false, true]);
  });

  it('Section 7: markAllAsDirty marks nested controls dirty and leaves them untouched', () => {
    const inner = new FormControl('a');
    const group = new FormGroup({ nested: new FormGroup({ inner }) });
    group.markAllAsDirty();
    expect(inner.dirty).toBe(true);
    expect(inner.untouched).toBe(true);
  });

  it('Section 7: a form submit emits FormSubmittedEvent and nothing else', async () => {
    const fixture = TestBed.createComponent(LabM25SubmitHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const seen: string[] = [];
    fixture.componentInstance.g.events.subscribe((event) => seen.push(kind(event)));
    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(seen).toEqual(['submitted']);
    expect(fixture.componentInstance.submitted).toBe(1);
    expect(fixture.componentInstance.g.status).toBe('INVALID');
  });

  it('Section 7: in a zoneless view a value-only setValue does not repaint the template', async () => {
    const fixture = TestBed.createComponent(LabM25ValueHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const input = root.querySelector('input') as HTMLInputElement;
    const text = root.querySelector('p') as HTMLParagraphElement;
    fixture.componentInstance.c.setValue('b');
    await fixture.whenStable();
    expect(input.value).toBe('b');
    expect(text.textContent).toBe('a');
    input.value = 'typed';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(text.textContent).toBe('typed');
  });

  it('Section 7: a status change repaints the zoneless view', async () => {
    const fixture = TestBed.createComponent(LabM25StatusHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const text = (fixture.nativeElement as HTMLElement).querySelector('p') as HTMLParagraphElement;
    const control = fixture.componentInstance.c;
    control.setValue('');
    await fixture.whenStable();
    expect(text.textContent).toBe('|INVALID|false');
    control.markAsTouched();
    await fixture.whenStable();
    expect(text.textContent).toBe('|INVALID|true');
    control.setValue('z');
    await fixture.whenStable();
    expect(text.textContent).toBe('z|VALID|true');
  });

  it('Section 7: toSignal of valueChanges repaints the zoneless view', async () => {
    const fixture = TestBed.createComponent(LabM25SignalHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const text = (fixture.nativeElement as HTMLElement).querySelector('p') as HTMLParagraphElement;
    expect(text.textContent).toBe('a');
    fixture.componentInstance.c.setValue('b');
    await fixture.whenStable();
    expect(text.textContent).toBe('b');
  });

  it('Section 7: a push that keeps the array status does not repaint, a push that changes it does', async () => {
    const quiet = TestBed.createComponent(LabM25ArrayHost);
    quiet.autoDetectChanges();
    await quiet.whenStable();
    quiet.componentInstance.items.push(new FormControl('b', { nonNullable: true }));
    await quiet.whenStable();
    const quietRoot = quiet.nativeElement as HTMLElement;
    expect(quiet.componentInstance.items.length).toBe(2);
    expect(quietRoot.querySelectorAll('input').length).toBe(1);
    expect(quietRoot.querySelector('p')?.textContent).toBe('1');

    const loud = TestBed.createComponent(LabM25ArrayHost);
    loud.autoDetectChanges();
    await loud.whenStable();
    loud.componentInstance.items.push(new FormControl('', { nonNullable: true, validators: Validators.required }));
    await loud.whenStable();
    const loudRoot = loud.nativeElement as HTMLElement;
    expect(loudRoot.querySelectorAll('input').length).toBe(2);
    expect(loudRoot.querySelector('p')?.textContent).toBe('2');
  });

  it('Section 7: the events stream sees a dirty change that valueChanges and statusChanges miss', () => {
    const legacyControl: AbstractControl = new FormControl('a');
    const eventsControl: AbstractControl = new FormControl('a');
    const legacyStates: string[] = [];
    const eventsStates: string[] = [];
    labM25LegacySaveIndicator(legacyControl).subscribe((state) => legacyStates.push(state));
    labM25EventsSaveIndicator(eventsControl).subscribe((state) => eventsStates.push(state));
    expect(legacyStates).toEqual(['saved']);
    expect(eventsStates).toEqual(['saved']);
    legacyControl.markAsDirty();
    eventsControl.markAsDirty();
    expect(legacyStates.at(-1)).toBe('saved');
    expect(eventsStates.at(-1)).toBe('unsaved');
    legacyControl.setValue('b');
    expect(legacyStates.at(-1)).toBe('unsaved');
  });
});
