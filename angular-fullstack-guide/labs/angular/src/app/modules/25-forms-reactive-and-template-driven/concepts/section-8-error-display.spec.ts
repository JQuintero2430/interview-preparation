import { Component, computed, ElementRef, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { TestBed } from '@angular/core/testing';
import {
  AbstractControl,
  ControlEvent,
  FormControl,
  FormGroup,
  FormSubmittedEvent,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { startWith, switchMap } from 'rxjs';

function labM25Messages(errors: ValidationErrors | null): string[] {
  const messages: string[] = [];
  if (errors?.['required']) messages.push('Required');
  if (errors?.['minlength']) messages.push(`At least ${errors['minlength'].requiredLength} characters`);
  return messages;
}

function labM25ShowErrors(control: AbstractControl, submitted: boolean): boolean {
  return control.invalid && (control.touched || submitted);
}

@Component({
  selector: 'lab-m25-field-errors',
  template: `@if (messages().length > 0) {
    <ul [id]="errorId()">
      @for (message of messages(); track message) {
        <li>{{ message }}</li>
      }
    </ul>
  }`,
})
class LabM25FieldErrors {
  readonly control = input.required<AbstractControl>();
  readonly submitted = input(false);
  readonly errorId = input.required<string>();
  private readonly lastEvent = toSignal(
    toObservable(this.control).pipe(switchMap((control) => control.events.pipe(startWith(null)))),
  );
  protected readonly messages = computed(() => {
    this.lastEvent();
    const control = this.control();
    return labM25ShowErrors(control, this.submitted()) ? labM25Messages(control.errors) : [];
  });
}

@Component({
  selector: 'lab-m25-naive-errors',
  template: `@if (control().touched && control().invalid) {
    <p>Invalid</p>
  }`,
})
class LabM25NaiveErrors {
  readonly control = input.required<AbstractControl>();
}

@Component({
  selector: 'lab-m25-errors-host',
  imports: [ReactiveFormsModule, LabM25FieldErrors],
  template: `<input id="name" [formControl]="name" /><lab-m25-field-errors [control]="name" errorId="name-errors" />`,
})
class LabM25ErrorsHost {
  readonly name = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] });
}

@Component({
  selector: 'lab-m25-naive-host',
  imports: [ReactiveFormsModule, LabM25NaiveErrors],
  template: `<input [formControl]="name" /><lab-m25-naive-errors [control]="name" />`,
})
class LabM25NaiveHost {
  readonly name = new FormControl('', { nonNullable: true, validators: Validators.required });
}

@Component({
  selector: 'lab-m25-checkout-host',
  imports: [ReactiveFormsModule, LabM25FieldErrors],
  template: `<form [formGroup]="g" #form="ngForm" (ngSubmit)="submit()">
    <input
      id="name"
      formControlName="name"
      [attr.aria-invalid]="shown(g.controls.name, form.submitted) ? 'true' : null"
      [attr.aria-describedby]="shown(g.controls.name, form.submitted) ? 'name-errors' : null"
    />
    <lab-m25-field-errors [control]="g.controls.name" [submitted]="form.submitted" errorId="name-errors" />
    <input id="email" formControlName="email" />
    <lab-m25-field-errors [control]="g.controls.email" [submitted]="form.submitted" errorId="email-errors" />
    <button type="submit">Send</button>
  </form>`,
})
class LabM25CheckoutHost {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly g = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: Validators.required }),
    email: new FormControl('', { nonNullable: true, validators: Validators.required }),
  });
  readonly submits = signal(0);
  readonly events: ControlEvent[] = [];
  protected readonly shown = labM25ShowErrors;

  constructor() {
    this.g.events.subscribe((event) => this.events.push(event));
  }

  protected submit(): void {
    this.submits.update((n) => n + 1);
    this.host.nativeElement.querySelector<HTMLElement>('input.ng-invalid')?.focus();
  }
}

async function render<T>(type: new () => T) {
  const fixture = TestBed.createComponent(type);
  fixture.autoDetectChanges();
  await fixture.whenStable();
  const root = fixture.nativeElement as HTMLElement;
  return { fixture, root };
}

function messages(root: HTMLElement): string[] {
  return Array.from(root.querySelectorAll('li')).map((li) => li.textContent ?? '');
}

describe('Section 8: error display strategies and accessible errors', () => {
  it('Section 8: an untouched invalid control shows no error', async () => {
    const { fixture, root } = await render(LabM25ErrorsHost);
    expect(fixture.componentInstance.name.invalid).toBe(true);
    expect(messages(root)).toEqual([]);
  });

  it('Section 8: blurring an invalid control shows its message', async () => {
    const { fixture, root } = await render(LabM25ErrorsHost);
    root.querySelector('input')?.dispatchEvent(new Event('blur'));
    await fixture.whenStable();
    expect(messages(root)).toEqual(['Required']);
  });

  it('Section 8: a component that reads touched in its own template misses the blur', async () => {
    const { fixture, root } = await render(LabM25NaiveHost);
    root.querySelector('input')?.dispatchEvent(new Event('blur'));
    await fixture.whenStable();
    expect(fixture.componentInstance.name.touched).toBe(true);
    expect(root.querySelector('p')).toBeNull();
  });

  it('Section 8: a status flip changes the message without detectChanges', async () => {
    const { fixture, root } = await render(LabM25ErrorsHost);
    const input = root.querySelector('input') as HTMLInputElement;
    input.dispatchEvent(new Event('blur'));
    input.value = 'ab';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(messages(root)).toEqual(['At least 3 characters']);
    fixture.componentInstance.name.setValue('abc');
    await fixture.whenStable();
    expect(messages(root)).toEqual([]);
  });

  it('Section 8: submitting shows every invalid control\'s message', async () => {
    const { fixture, root } = await render(LabM25CheckoutHost);
    expect(messages(root)).toEqual([]);
    root.querySelector('button')?.click();
    await fixture.whenStable();
    expect(messages(root)).toEqual(['Required', 'Required']);
  });

  it('Section 8: submitting leaves the controls untouched', async () => {
    const { fixture, root } = await render(LabM25CheckoutHost);
    root.querySelector('button')?.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.g.controls.name.touched).toBe(false);
    expect(fixture.componentInstance.g.controls.name.invalid).toBe(true);
  });

  it('Section 8: markAllAsTouched shows the messages without reading submitted', async () => {
    const { fixture, root } = await render(LabM25CheckoutHost);
    fixture.componentInstance.g.markAllAsTouched();
    await fixture.whenStable();
    expect(messages(root)).toEqual(['Required', 'Required']);
  });

  it('Section 8: submitting an invalid form still emits ngSubmit and FormSubmittedEvent', async () => {
    const { fixture, root } = await render(LabM25CheckoutHost);
    root.querySelector('button')?.click();
    await fixture.whenStable();
    const host = fixture.componentInstance;
    expect(host.g.invalid).toBe(true);
    expect(host.submits()).toBe(1);
    expect(host.events.length).toBe(1);
    expect(host.events[0] instanceof FormSubmittedEvent).toBe(true);
  });

  it('Section 8: the form gets ng-submitted after submit', async () => {
    const { fixture, root } = await render(LabM25CheckoutHost);
    const form = root.querySelector('form') as HTMLFormElement;
    expect(form.classList.contains('ng-submitted')).toBe(false);
    root.querySelector('button')?.click();
    await fixture.whenStable();
    expect(form.classList.contains('ng-submitted')).toBe(true);
  });

  it('Section 8: Angular puts novalidate on the form', async () => {
    const { root } = await render(LabM25CheckoutHost);
    expect(root.querySelector('form')?.hasAttribute('novalidate')).toBe(true);
  });

  it('Section 8: aria-invalid and aria-describedby follow the control state', async () => {
    const { fixture, root } = await render(LabM25CheckoutHost);
    const name = root.querySelector('#name') as HTMLInputElement;
    expect(name.hasAttribute('aria-invalid')).toBe(false);
    expect(name.hasAttribute('aria-describedby')).toBe(false);
    root.querySelector('button')?.click();
    await fixture.whenStable();
    expect(name.getAttribute('aria-invalid')).toBe('true');
    expect(name.getAttribute('aria-describedby')).toBe('name-errors');
    expect(root.querySelector('#name-errors')).not.toBeNull();
    name.value = 'Ada';
    name.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(name.hasAttribute('aria-invalid')).toBe(false);
    expect(name.hasAttribute('aria-describedby')).toBe(false);
  });

  it('Section 8: submit focuses the first invalid control', async () => {
    const { fixture, root } = await render(LabM25CheckoutHost);
    fixture.componentInstance.g.controls.name.setValue('Ada');
    await fixture.whenStable();
    root.querySelector('button')?.click();
    await fixture.whenStable();
    expect(document.activeElement).toBe(root.querySelector('#email'));
  });
});
