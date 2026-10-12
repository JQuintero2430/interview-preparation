import { Component, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  DefaultValueAccessor,
  FormControl,
  FormControlName,
  FormGroup,
  FormGroupDirective,
  FormsModule,
  NgForm,
  NgModel,
  ReactiveFormsModule,
} from '@angular/forms';
import { By } from '@angular/platform-browser';
import {
  LabM25LegacyModelOnFormControl,
  LabM25ModelOnFormControlMigrated,
} from '../legacy/legacy-apis';

@Component({
  selector: 'lab-m25-reactive-host',
  imports: [ReactiveFormsModule],
  template: '<form [formGroup]="form"><input formControlName="first" /></form>',
})
class LabM25ReactiveHost {
  readonly form = new FormGroup({ first: new FormControl('Ann', { nonNullable: true }) });
}

@Component({
  selector: 'lab-m25-template-host',
  imports: [FormsModule],
  template: '<form #f="ngForm"><input name="first" [(ngModel)]="first" /></form>',
})
class LabM25TemplateHost {
  first = 'Ann';
  readonly ngForm = viewChild.required<NgForm>('f');
}

function input(root: HTMLElement): HTMLInputElement {
  return root.querySelector('input') as HTMLInputElement;
}

describe('Section 1: two forms APIs', () => {
  it("Section 1: a reactive form's model exists before the first render", () => {
    const fixture = TestBed.createComponent(LabM25ReactiveHost);
    const form = fixture.componentInstance.form;
    expect(Object.keys(form.controls)).toEqual(['first']);
    expect(form.value).toEqual({ first: 'Ann' });
  });

  it('Section 1: a template-driven form has no controls right after the first change detection', async () => {
    const fixture = TestBed.createComponent(LabM25TemplateHost);
    fixture.detectChanges();
    const ngForm = fixture.componentInstance.ngForm();
    expect(Object.keys(ngForm.controls)).toEqual([]);
    expect(ngForm.value).toEqual({});
    await fixture.whenStable();
  });

  it('Section 1: a template-driven form has its controls after whenStable()', async () => {
    const fixture = TestBed.createComponent(LabM25TemplateHost);
    fixture.detectChanges();
    await fixture.whenStable();
    const ngForm = fixture.componentInstance.ngForm();
    expect(Object.keys(ngForm.controls)).toEqual(['first']);
    expect(ngForm.value).toEqual({ first: 'Ann' });
  });

  it('Section 1: the same input renders the same model value in both APIs', async () => {
    const reactive = TestBed.createComponent(LabM25ReactiveHost);
    const template = TestBed.createComponent(LabM25TemplateHost);
    reactive.detectChanges();
    template.detectChanges();
    await Promise.all([reactive.whenStable(), template.whenStable()]);
    expect(reactive.componentInstance.form.value).toEqual({ first: 'Ann' });
    expect(template.componentInstance.ngForm().value).toEqual({ first: 'Ann' });
    expect(input(reactive.nativeElement).value).toBe('Ann');
    expect(input(template.nativeElement).value).toBe('Ann');
  });

  it('Section 1: a reactive setValue reaches the input synchronously and a template-driven write waits for whenStable()', async () => {
    const reactive = TestBed.createComponent(LabM25ReactiveHost);
    reactive.detectChanges();
    reactive.componentInstance.form.setValue({ first: 'Bob' });
    expect(input(reactive.nativeElement).value).toBe('Bob');

    const template = TestBed.createComponent(LabM25TemplateHost);
    template.detectChanges();
    await template.whenStable();
    template.componentInstance.first = 'Bob';
    template.detectChanges();
    expect(template.componentInstance.ngForm().value).toEqual({ first: 'Ann' });
    await template.whenStable();
    expect(template.componentInstance.ngForm().value).toEqual({ first: 'Bob' });
    expect(input(template.nativeElement).value).toBe('Bob');
  });

  it('Section 1: the directive selectors keep the two APIs apart and both inputs use the same accessor', async () => {
    const reactive = TestBed.createComponent(LabM25ReactiveHost);
    const template = TestBed.createComponent(LabM25TemplateHost);
    reactive.detectChanges();
    template.detectChanges();
    await Promise.all([reactive.whenStable(), template.whenStable()]);
    const has = (
      f: typeof reactive | typeof template,
      directive:
        | typeof NgForm
        | typeof NgModel
        | typeof FormGroupDirective
        | typeof FormControlName
        | typeof DefaultValueAccessor,
    ) => f.debugElement.query(By.directive(directive)) !== null;
    expect([
      has(reactive, FormGroupDirective),
      has(reactive, FormControlName),
      has(reactive, NgForm),
      has(reactive, NgModel),
    ]).toEqual([true, true, false, false]);
    expect([
      has(template, NgForm),
      has(template, NgModel),
      has(template, FormGroupDirective),
      has(template, FormControlName),
    ]).toEqual([true, true, false, false]);
    expect([has(reactive, DefaultValueAccessor), has(template, DefaultValueAccessor)]).toEqual([
      true,
      true,
    ]);
  });

  it("Section 1: a value change replaces the group's value object", () => {
    const group = new FormGroup({ a: new FormControl('x', { nonNullable: true }) });
    const before = group.value;
    group.controls.a.setValue('y');
    expect(group.value).not.toBe(before);
    expect(before).toEqual({ a: 'x' });
    expect(group.value).toEqual({ a: 'y' });
  });

  it('Section 1: a legacy ngModel on a formControl input mirrors the control into a second field, and the migrated control keeps one copy', async () => {
    const legacy = TestBed.createComponent(LabM25LegacyModelOnFormControl);
    legacy.detectChanges();
    await legacy.whenStable();
    const legacyInput = input(legacy.nativeElement);
    const legacyControl = legacy.componentInstance.control;
    expect(legacyControl.value).toBe('legacy');
    expect(legacyInput.value).toBe('legacy');
    legacyInput.value = 'typed';
    legacyInput.dispatchEvent(new Event('input'));
    expect(legacyControl.value).toBe('typed');
    expect(legacy.componentInstance.text).toBe('typed');
    legacyControl.setValue('set');
    expect(legacyInput.value).toBe('set');
    expect(legacy.componentInstance.text).toBe('set');

    const migrated = TestBed.createComponent(LabM25ModelOnFormControlMigrated);
    migrated.detectChanges();
    expect(input(migrated.nativeElement).value).toBe('legacy');
    input(migrated.nativeElement).value = 'typed';
    input(migrated.nativeElement).dispatchEvent(new Event('input'));
    expect(migrated.componentInstance.control.value).toBe('typed');
  });
});
