import { Component, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ControlContainer, FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'lab-m25-register-host',
  imports: [FormsModule],
  template: `<form #f="ngForm">
    <input name="first" [(ngModel)]="first" required />
    <input name="age" type="number" ngModel min="18" />
  </form>`,
})
class LabM25RegisterHost {
  first = 'Ann';
  readonly ngForm = viewChild.required<NgForm>('f');
}

@Component({
  selector: 'lab-m25-child-field',
  imports: [FormsModule],
  template: '<input name="inner" ngModel />',
})
class LabM25ChildField {}

@Component({
  selector: 'lab-m25-child-field-shared',
  imports: [FormsModule],
  viewProviders: [{ provide: ControlContainer, useExisting: NgForm }],
  template: '<input name="inner" ngModel />',
})
class LabM25ChildFieldShared {}

@Component({
  selector: 'lab-m25-child-host',
  imports: [FormsModule, LabM25ChildField],
  template: '<form #f="ngForm"><lab-m25-child-field /></form>',
})
class LabM25ChildHost {
  readonly ngForm = viewChild.required<NgForm>('f');
}

@Component({
  selector: 'lab-m25-shared-host',
  imports: [FormsModule, LabM25ChildFieldShared],
  template: '<form #f="ngForm"><lab-m25-child-field-shared /></form>',
})
class LabM25SharedHost {
  readonly ngForm = viewChild.required<NgForm>('f');
}

function inputNamed(root: HTMLElement, name: string): HTMLInputElement {
  return root.querySelector(`input[name="${name}"]`) as HTMLInputElement;
}

function typeInto(field: HTMLInputElement, text: string): void {
  field.value = text;
  field.dispatchEvent(new Event('input'));
}

describe('Section 4: template-driven forms', () => {
  it('Section 4: controls register after a microtask', async () => {
    const fixture = TestBed.createComponent(LabM25RegisterHost);
    fixture.detectChanges();
    const ngForm = fixture.componentInstance.ngForm();
    expect(Object.keys(ngForm.controls)).toEqual([]);
    expect(ngForm.value).toEqual({});
    await Promise.resolve();
    expect(Object.keys(ngForm.controls)).toEqual(['first', 'age']);
    expect(ngForm.value['first']).toBe('Ann');
    await fixture.whenStable();
    expect(inputNamed(fixture.nativeElement, 'first').value).toBe('Ann');
    expect(ngForm.status).toBe('VALID');
  });

  it('Section 4: a component field reaches the control only after whenStable', async () => {
    const fixture = TestBed.createComponent(LabM25RegisterHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const ngForm = fixture.componentInstance.ngForm();
    fixture.componentInstance.first = 'Bob';
    fixture.detectChanges();
    expect(ngForm.controls['first'].value).toBe('Ann');
    await fixture.whenStable();
    expect(ngForm.controls['first'].value).toBe('Bob');
    expect(inputNamed(fixture.nativeElement, 'first').value).toBe('Bob');
  });

  it('Section 4: typing updates the component field synchronously', async () => {
    const fixture = TestBed.createComponent(LabM25RegisterHost);
    fixture.detectChanges();
    await fixture.whenStable();
    typeInto(inputNamed(fixture.nativeElement, 'first'), '');
    expect(fixture.componentInstance.first).toBe('');
    expect(fixture.componentInstance.ngForm().controls['first'].errors).toEqual({ required: true });
  });

  it('Section 4: a number input gives a number and null when empty', async () => {
    const fixture = TestBed.createComponent(LabM25RegisterHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const age = fixture.componentInstance.ngForm().controls['age'];
    typeInto(inputNamed(fixture.nativeElement, 'age'), '12');
    expect(age.value).toBe(12);
    expect(age.errors).toEqual({ min: { min: 18, actual: 12 } });
    typeInto(inputNamed(fixture.nativeElement, 'age'), '');
    expect(age.value).toBeNull();
  });

  it('Section 4: ngModel inside a child component does not register with the parent form', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    try {
      const fixture = TestBed.createComponent(LabM25ChildHost);
      fixture.detectChanges();
      await fixture.whenStable();
      expect(Object.keys(fixture.componentInstance.ngForm().controls)).toEqual([]);
      const messages = warn.mock.calls.map((call) => String(call[0]));
      expect(messages.some((message) => message.includes('NG01354'))).toBe(true);
    } finally {
      warn.mockRestore();
    }
  });

  it("Section 4: viewProviders with ControlContainer registers the child's ngModel", async () => {
    const fixture = TestBed.createComponent(LabM25SharedHost);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(Object.keys(fixture.componentInstance.ngForm().controls)).toEqual(['inner']);
  });
});
