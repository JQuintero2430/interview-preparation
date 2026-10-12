import { Component, forwardRef, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  AbstractControl,
  AsyncValidatorFn,
  ControlValueAccessor,
  ControlEvent,
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  FormSubmittedEvent,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  NgForm,
  ReactiveFormsModule,
  StatusChangeEvent,
  ValidationErrors,
  Validator,
  ValidatorFn,
  ValueChangeEvent,
  Validators,
} from '@angular/forms';
import { NEVER, Observable, of, startWith } from 'rxjs';

function summary(group: FormGroup): string {
  return `${group.status} valid=${group.valid} invalid=${group.invalid} value=${JSON.stringify(group.value)}`;
}

function profile(): FormGroup<{ a: FormControl<string | null>; b: FormControl<string | null> }> {
  return new FormGroup({ a: new FormControl('A'), b: new FormControl({ value: 'B', disabled: true }) });
}

@Component({
  selector: 'lab-m25-q09-host',
  imports: [FormsModule],
  template: `<form #f="ngForm">
    <input name="first" [(ngModel)]="first" required />
    <input name="age" type="number" ngModel min="18" />
  </form>`,
})
class LabM25Q09Host {
  first = 'Ann';
  readonly ngForm = viewChild.required<NgForm>('f');
}

function snapshot(form: NgForm): string {
  return `controls=[${Object.keys(form.controls).join(',')}] value=${JSON.stringify(form.value)}`;
}

function errorsOf(validator: ValidatorFn, value: unknown): string {
  return JSON.stringify(validator(new FormControl(value)));
}

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  return group.get('pw')?.value === group.get('confirm')?.value ? null : { mismatch: true };
}

@Component({
  selector: 'lab-m25-q16-host',
  imports: [ReactiveFormsModule],
  template: `<input type="text" min="5" [formControl]="textControl" />
    <input type="number" min="5" [formControl]="numberControl" />`,
})
class LabM25Q16Host {
  readonly textControl = new FormControl('1');
  readonly numberControl = new FormControl(1);
}

interface LabM25Q17Log {
  readonly calls: string[];
  readonly cancelled: string[];
}

function usernameTaken(log: LabM25Q17Log): AsyncValidatorFn {
  return (control) =>
    new Observable<ValidationErrors | null>((subscriber) => {
      const value = String(control.value);
      let answered = false;
      log.calls.push(value);
      const timerId = setTimeout(() => {
        answered = true;
        subscriber.next(value === 'ann' ? { taken: true } : null);
        subscriber.complete();
      }, 100);
      return () => {
        clearTimeout(timerId);
        if (!answered) log.cancelled.push(value);
      };
    });
}

const neverCompletes: AsyncValidatorFn = () => NEVER.pipe(startWith(null));

@Component({
  selector: 'lab-m25-q23-host',
  imports: [ReactiveFormsModule],
  template: '<input [formControl]="c" /><p>{{ c.value }}|{{ c.status }}</p>',
})
class LabM25Q23Host {
  readonly c = new FormControl('a', { nonNullable: true, validators: Validators.required });
}

function eventKind(event: ControlEvent): string {
  if (event instanceof ValueChangeEvent) return 'value';
  if (event instanceof StatusChangeEvent) return 'status';
  return 'other';
}

@Component({
  selector: 'lab-m25-q26-host',
  imports: [ReactiveFormsModule],
  template: `<form [formGroup]="form" (ngSubmit)="submits = submits + 1">
    <input formControlName="name" />
    <button type="submit">Send</button>
  </form>`,
})
class LabM25Q26Host {
  readonly form = new FormGroup({ name: new FormControl('', { nonNullable: true, validators: Validators.required }) });
  submits = 0;
}

@Component({
  selector: 'lab-m25-q30-host',
  imports: [ReactiveFormsModule],
  template: `<div [formArray]="array">
    @for (row of array.controls; track row) {
      <input [formControl]="row" />
    }
  </div>`,
})
class LabM25Q30Host {
  readonly array = new FormArray([new FormControl('a', Validators.required)]);
}

function ngClasses(element: Element): string {
  return Array.from(element.classList)
    .filter((name) => name.startsWith('ng-'))
    .join(' ');
}

const q32Log: string[] = [];
let q32OnChange: (value: number) => void = () => undefined;

@Component({
  selector: 'lab-m25-q32-rating',
  template: '<button type="button" (click)="pick()">rate</button>',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => LabM25Q32Rating), multi: true },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => LabM25Q32Rating), multi: true },
  ],
})
class LabM25Q32Rating implements ControlValueAccessor, Validator {
  writeValue(value: number | null): void {
    q32Log.push(`writeValue:${value}`);
  }

  registerOnChange(fn: (value: number) => void): void {
    q32Log.push('registerOnChange');
    q32OnChange = fn;
  }

  registerOnTouched(): void {
    q32Log.push('registerOnTouched');
  }

  setDisabledState(isDisabled: boolean): void {
    q32Log.push(`setDisabledState:${isDisabled}`);
  }

  validate(control: AbstractControl): ValidationErrors | null {
    q32Log.push(`validate:${control.value}`);
    return control.value > 5 ? { tooHigh: true } : null;
  }

  protected pick(): void {
    q32OnChange(3);
  }
}

@Component({
  selector: 'lab-m25-q32-host',
  imports: [ReactiveFormsModule, LabM25Q32Rating],
  template: '<lab-m25-q32-rating [formControl]="c" />',
})
class LabM25Q32Host {
  c = new FormControl<number | null>(2);
}

function q32Take(): string {
  return q32Log.splice(0).join(' ');
}

describe('Q25 outputs', () => {
  it('Q25.04 a group with one disabled control, the same group fully disabled, and reset() on both control kinds', () => {
    const group = profile();
    expect(summary(group)).toBe('VALID valid=true invalid=false value={"a":"A"}');
    expect(group.getRawValue()).toEqual({ a: 'A', b: 'B' });

    group.disable();
    expect(summary(group)).toBe('DISABLED valid=false invalid=false value={"a":"A","b":"B"}');

    group.enable();
    group.controls.b.disable();
    expect(summary(group)).toBe('VALID valid=true invalid=false value={"a":"A"}');

    const nullable = new FormControl('x');
    nullable.setValue('y');
    nullable.reset();
    expect(nullable.value).toBeNull();

    const nonNullable = new FormControl('x', { nonNullable: true });
    nonNullable.setValue('y');
    nonNullable.reset();
    expect(nonNullable.value).toBe('x');
  });

  it('Q25.09 an NgForm right after the first change detection, after one microtask and after whenStable(), and when a component field reaches the control', async () => {
    const fixture = TestBed.createComponent(LabM25Q09Host);
    fixture.detectChanges();
    const form = fixture.componentInstance.ngForm();
    expect(snapshot(form)).toBe('controls=[] value={}');

    await Promise.resolve();
    expect(snapshot(form)).toBe('controls=[first,age] value={"first":"Ann","age":""}');

    await fixture.whenStable();
    const first = fixture.nativeElement.querySelector('input[name="first"]') as HTMLInputElement;
    expect(first.value).toBe('Ann');
    expect(form.status).toBe('VALID');

    const second = TestBed.createComponent(LabM25Q09Host);
    second.detectChanges();
    await second.whenStable();
    second.componentInstance.first = 'Bob';
    second.detectChanges();
    const control = second.componentInstance.ngForm().controls['first'];
    expect(control.value).toBe('Ann');
    await second.whenStable();
    expect(control.value).toBe('Bob');
    expect((second.nativeElement.querySelector('input[name="first"]') as HTMLInputElement).value).toBe('Bob');
  });

  it('Q25.12 required, requiredTrue, minLength, pattern and email on empty, blank, zero, false and short values', () => {
    expect(errorsOf(Validators.required, '')).toBe('{"required":true}');
    expect(errorsOf(Validators.required, ' ')).toBe('null');
    expect(errorsOf(Validators.required, 0)).toBe('null');
    expect(errorsOf(Validators.required, false)).toBe('null');
    expect(errorsOf(Validators.requiredTrue, false)).toBe('{"required":true}');
    expect(errorsOf(Validators.minLength(3), '')).toBe('null');
    expect(errorsOf(Validators.minLength(3), 'ab')).toBe('{"minlength":{"requiredLength":3,"actualLength":2}}');
    expect(errorsOf(Validators.pattern('[a-z]+'), 'abc1')).toBe(
      '{"pattern":{"requiredPattern":"^[a-z]+$","actualValue":"abc1"}}',
    );
    expect(errorsOf(Validators.pattern(/[a-z]+/), 'abc1')).toBe('null');
    expect(errorsOf(Validators.email, 'ab')).toBe('{"email":true}');
    expect(errorsOf(Validators.email, 'a@b')).toBe('null');
    expect(errorsOf(Validators.email, '')).toBe('null');
  });

  it('Q25.14 a password-confirmation validator on the group: where the mismatch error lives and what hasError returns', () => {
    const group = new FormGroup(
      { pw: new FormControl('a'), confirm: new FormControl('b') },
      { validators: passwordsMatch },
    );
    expect(JSON.stringify(group.errors)).toBe('{"mismatch":true}');
    expect(group.status).toBe('INVALID');
    expect(JSON.stringify(group.controls.confirm.errors)).toBe('null');
    expect(group.controls.confirm.status).toBe('VALID');
    expect(group.hasError('mismatch')).toBe(true);
    expect(group.hasError('mismatch', 'confirm')).toBe(false);
  });

  it('Q25.16 Validators.min on a string, and a min attribute on a text and on a number input', () => {
    expect(JSON.stringify(Validators.min(3)(new FormControl('2')))).toBe('{"min":{"min":3,"actual":"2"}}');

    const fixture = TestBed.createComponent(LabM25Q16Host);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    expect(JSON.stringify(host.textControl.errors)).toBe('null');
    expect(JSON.stringify(host.numberControl.errors)).toBe('{"min":{"min":5,"actual":1}}');
  });

  it('Q25.17 three quick values through a username async validator behind required: calls, cancellations and statuses', () => {
    vi.useFakeTimers();
    try {
      const log: LabM25Q17Log = { calls: [], cancelled: [] };
      const control = new FormControl('', { validators: Validators.required, asyncValidators: usernameTaken(log) });
      expect(control.status).toBe('INVALID');
      expect(log.calls).toEqual([]);

      control.setValue('a');
      expect(control.status).toBe('PENDING');
      control.setValue('an');
      control.setValue('ann');
      expect(control.status).toBe('PENDING');
      expect(log.calls).toEqual(['a', 'an', 'ann']);
      expect(log.cancelled).toEqual(['a', 'an']);

      vi.advanceTimersByTime(150);
      expect(control.status).toBe('INVALID');
      expect(JSON.stringify(control.errors)).toBe('{"taken":true}');
    } finally {
      vi.useRealTimers();
    }
  });

  it('Q25.19 an async validator that emits and never completes, alone and next to a second async validator', () => {
    const alone = new FormControl('', { asyncValidators: neverCompletes });
    alone.setValue('m');
    expect(alone.status).toBe('VALID');

    const withSecond = new FormControl('', { asyncValidators: [() => of(null), neverCompletes] });
    withSecond.setValue('m');
    expect(withSecond.status).toBe('PENDING');
  });

  it("Q25.21 a child control changes inside a group: the order of the events and valueChanges subscribers, and the parent's value seen by the child's subscriber", () => {
    const c = new FormControl('a', { nonNullable: true, validators: Validators.required });
    const g = new FormGroup({ c });
    const log: string[] = [];
    const seen: unknown[] = [];
    const sources: boolean[] = [];
    c.events.subscribe((event) => log.push(`c:${eventKind(event)}`));
    g.events.subscribe((event) => {
      log.push(`g:${eventKind(event)}`);
      sources.push(event.source === c);
    });
    c.valueChanges.subscribe(() => {
      log.push('c:valueChanges');
      seen.push(g.value);
    });
    g.valueChanges.subscribe(() => log.push('g:valueChanges'));
    c.setValue('');
    expect(log).toEqual(['c:value', 'c:status', 'c:valueChanges', 'g:value', 'g:status', 'g:valueChanges']);
    expect(seen).toEqual([{ c: 'a' }]);
    expect(sources).toEqual([true, true]);
  });

  it('Q25.23 in a zoneless OnPush component, setValue from code, typing, and a setValue that flips the status', async () => {
    const fixture = TestBed.createComponent(LabM25Q23Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const input = root.querySelector('input') as HTMLInputElement;
    const text = root.querySelector('p') as HTMLParagraphElement;
    const read = () => [input.value, text.textContent];
    fixture.componentInstance.c.setValue('b');
    await fixture.whenStable();
    expect(read()).toEqual(['b', 'a|VALID']);
    input.value = 'typed';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(read()).toEqual(['typed', 'typed|VALID']);
    fixture.componentInstance.c.setValue('');
    await fixture.whenStable();
    expect(read()).toEqual(['', '|INVALID']);
    fixture.componentInstance.c.setValue('z');
    await fixture.whenStable();
    expect(read()).toEqual(['z', 'z|VALID']);
  });

  it('Q25.26 an invalid reactive form submitted by a click: the handler, the events of the group and the classes of the input and the form', async () => {
    const fixture = TestBed.createComponent(LabM25Q26Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const form = root.querySelector('form') as HTMLFormElement;
    const input = root.querySelector('input') as HTMLInputElement;
    const host = fixture.componentInstance;
    const events: unknown[] = [];
    host.form.events.subscribe((event) => events.push(event));
    expect(ngClasses(form)).toBe('ng-untouched ng-pristine ng-invalid');
    root.querySelector('button')?.click();
    await fixture.whenStable();
    expect(host.submits).toBe(1);
    expect(events).toHaveLength(1);
    expect(events[0] instanceof FormSubmittedEvent).toBe(true);
    expect(host.form.status).toBe('INVALID');
    expect(ngClasses(input)).toBe('ng-untouched ng-pristine ng-invalid');
    expect(ngClasses(form)).toBe('ng-untouched ng-pristine ng-invalid ng-submitted');
  });

  it('Q25.29 a FormArray through push, insert, removeAt, push with an array and clear(): the value and the valueChanges emissions after each', () => {
    const array = new FormArray([new FormControl('a'), new FormControl('b')]);
    let emissions = 0;
    array.valueChanges.subscribe(() => (emissions += 1));
    const step = (run: () => void): string => {
      emissions = 0;
      run();
      return `${JSON.stringify(array.value)} emissions=${emissions}`;
    };
    expect(step(() => array.push(new FormControl('c')))).toBe('["a","b","c"] emissions=1');
    expect(step(() => array.insert(0, new FormControl('z')))).toBe('["z","a","b","c"] emissions=1');
    expect(step(() => array.removeAt(1))).toBe('["z","b","c"] emissions=1');
    expect(step(() => array.push([new FormControl('d'), new FormControl('e')]))).toBe(
      '["z","b","c","d","e"] emissions=1',
    );
    expect(step(() => array.clear())).toBe('[] emissions=1');
  });

  it('Q25.30 in a zoneless component, the rows rendered after a push of a valid control and after a push of an invalid one', async () => {
    const rowsAfter = async (pushed: FormControl<string | null>): Promise<number> => {
      const fixture = TestBed.createComponent(LabM25Q30Host);
      fixture.autoDetectChanges();
      await fixture.whenStable();
      fixture.componentInstance.array.push(pushed);
      await fixture.whenStable();
      return fixture.nativeElement.querySelectorAll('input').length;
    };
    expect(await rowsAfter(new FormControl('b', Validators.required))).toBe(1);
    expect(await rowsAfter(new FormControl('', Validators.required))).toBe(2);
  });

  it('Q25.32 a custom control on an enabled and on a disabled control: the attach calls, then a user change, setValue and disable()', () => {
    const attach = (control: FormControl<number | null>) => {
      q32Log.length = 0;
      const fixture = TestBed.createComponent(LabM25Q32Host);
      fixture.componentInstance.c = control;
      fixture.detectChanges();
      return fixture;
    };
    const enabled = new FormControl<number | null>(2);
    const fixture = attach(enabled);
    expect(q32Take()).toBe('writeValue:2 setDisabledState:false registerOnChange registerOnTouched validate:2');
    fixture.nativeElement.querySelector('button').click();
    expect(q32Take()).toBe('validate:3');
    expect(`${enabled.value} dirty=${enabled.dirty} touched=${enabled.touched}`).toBe('3 dirty=true touched=false');
    enabled.setValue(9);
    expect(q32Take()).toBe('writeValue:9 validate:9');
    expect(enabled.errors).toEqual({ tooHigh: true });
    enabled.disable();
    expect(q32Take()).toBe('setDisabledState:true');
    attach(new FormControl<number | null>({ value: 1, disabled: true }));
    expect(q32Take()).toBe('writeValue:1 setDisabledState:true registerOnChange registerOnTouched');
  });
});
