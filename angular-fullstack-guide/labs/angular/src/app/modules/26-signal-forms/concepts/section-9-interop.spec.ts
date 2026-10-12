import { Component, model, output, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FormField, form, required } from '@angular/forms/signals';
import type { FormValueControl } from '@angular/forms/signals';
import { SignalFormControl, compatForm, extractValue } from '@angular/forms/signals/compat';

// A v21-style control: `touched` is a model(), written on blur. It is not the v22 `touch` output.
@Component({
  selector: 'lab-m26-v21-touched',
  template: `<input id="v21" [value]="value()" (blur)="touched.set(true)" />`,
})
class LabM26V21Touched implements FormValueControl<string> {
  readonly value = model('');
  readonly touched = model(false);
}

// The v22 control: the blur is reported through the `touch` output.
@Component({
  selector: 'lab-m26-v22-touch',
  template: `<input id="v22" [value]="value()" (blur)="touch.emit()" />`,
})
class LabM26V22Touch implements FormValueControl<string> {
  readonly value = model('');
  readonly touch = output<void>();
}

@Component({
  selector: 'lab-m26-touch-host',
  imports: [FormField, LabM26V21Touched, LabM26V22Touch],
  template: `
    <lab-m26-v21-touched id="old" [formField]="f.a" />
    <lab-m26-v22-touch id="new" [formField]="f.b" />
  `,
})
class LabM26TouchHost {
  readonly model = signal({ a: '', b: '' });
  readonly f = form(this.model);
}

function inContext<T>(fn: () => T): T {
  return TestBed.runInInjectionContext(fn);
}

describe('Section 9: interop and migration', () => {
  it('Section 9: a SignalFormControl reports its schema errors to the parent FormGroup', () => {
    inContext(() => {
      const name = new SignalFormControl('', (p) => {
        required(p);
      });
      const age = new FormControl(1, Validators.min(5));
      const group = new FormGroup({ name, age });
      expect(group.status).toBe('INVALID');
      expect(name.status).toBe('INVALID');
      expect(Object.keys(name.errors ?? {})).toEqual(['required']);
      expect(name.errors?.['required'].kind).toBe('required');
      expect(group.value).toEqual({ name: '', age: 1 });
    });
  });

  it('Section 9: setValue on a SignalFormControl updates its field tree', () => {
    inContext(() => {
      const name = new SignalFormControl('', (p) => {
        required(p);
      });
      const age = new FormControl(1, Validators.min(5));
      const group = new FormGroup({ name, age });
      name.setValue('x');
      expect(name.status).toBe('VALID');
      expect(group.status).toBe('INVALID');
      expect(name.sourceValue()).toBe('x');
      expect(name.fieldTree().value()).toBe('x');
    });
  });

  it('Section 9: compatForm exposes a FormControl\'s validity as a field', () => {
    inContext(() => {
      const legacy = new FormControl('', { nonNullable: true, validators: Validators.required });
      const f = compatForm(signal({ title: 'T', legacy }));
      expect(f.legacy().valid()).toBe(false);
      expect(f.legacy().errors().map((e) => e.kind)).toEqual(['required']);
      expect(f().valid()).toBe(false);
      expect(f.legacy().value()).toBe('');
    });
  });

  it('Section 9: a FormControl change inside compatForm updates the root validity', () => {
    inContext(() => {
      const legacy = new FormControl('', { nonNullable: true, validators: Validators.required });
      const f = compatForm(signal({ title: 'T', legacy }));
      legacy.setValue('ok');
      expect(f.legacy().valid()).toBe(true);
      expect(f().valid()).toBe(true);
      expect(f.legacy().value()).toBe('ok');
    });
  });

  it('Section 9: extractValue unwraps the controls of a compat form', () => {
    inContext(() => {
      const legacy = new FormControl('ok', { nonNullable: true });
      const f = compatForm(signal({ title: 'T', legacy }));
      expect(extractValue(f)).toEqual({ title: 'T', legacy: 'ok' });
    });
  });

  it('Section 9: a SignalFormControl refuses imperative disable and validator changes', () => {
    inContext(() => {
      const name = new SignalFormControl('');
      expect(() => name.disable()).toThrow(/disabled/);
      expect(() => name.setValidators(Validators.required)).toThrow(/applyWhen/);
    });
  });

  it('Section 9: a reactive error becomes a CompatValidationError whose kind is the error key', () => {
    inContext(() => {
      const legacy = new FormControl('', { nonNullable: true, validators: Validators.required });
      const f = compatForm(signal({ legacy }));
      const error = f.legacy().errors()[0];
      expect(error.kind).toBe('required');
      expect(error.constructor.name).toBe('CompatValidationError');
    });
  });

  it('Section 9: a v21 touched model compiles on 22 but its writes do not reach the field', async () => {
    const fixture: ComponentFixture<LabM26TouchHost> = TestBed.createComponent(LabM26TouchHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    root.querySelector<HTMLInputElement>('#v21')?.dispatchEvent(new Event('blur'));
    root.querySelector<HTMLInputElement>('#v22')?.dispatchEvent(new Event('blur'));
    await fixture.whenStable();
    const host = fixture.componentInstance;
    expect(host.f.a().touched()).toBe(false);
    expect(host.f.b().touched()).toBe(true);
  });
});
