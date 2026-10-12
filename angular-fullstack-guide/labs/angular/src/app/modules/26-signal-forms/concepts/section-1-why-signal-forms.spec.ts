import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form, FormField } from '@angular/forms/signals';

interface LabM26Profile {
  name: string;
  age: number;
}

@Component({
  selector: 'lab-m26-why-host',
  imports: [FormField],
  template: '<input [formField]="f.name" />',
})
class LabM26WhyHost {
  readonly model = signal<LabM26Profile>({ name: 'Ann', age: 30 });
  protected readonly f = form(this.model);
}

describe('Section 1: why a third forms API', () => {
  it('Section 1: a field write is a write to the model signal', () => {
    TestBed.runInInjectionContext(() => {
      const model = signal<LabM26Profile>({ name: 'Ann', age: 30 });
      const f = form(model);
      f.name().value.set('Bob');
      expect(model()).toEqual({ name: 'Bob', age: 30 });
    });
  });

  it('Section 1: a model write is visible through the field', () => {
    TestBed.runInInjectionContext(() => {
      const model = signal<LabM26Profile>({ name: 'Ann', age: 30 });
      const f = form(model);
      model.set({ name: 'Cy', age: 1 });
      expect(f.name().value()).toBe('Cy');
      expect(f.age().value()).toBe(1);
    });
  });

  it('Section 1: the form keeps no copy of the model', () => {
    TestBed.runInInjectionContext(() => {
      const model = signal<LabM26Profile>({ name: 'Ann', age: 30 });
      const f = form(model);
      expect(f().value()).toBe(model());
      expect(Object.keys(f)).toEqual(['name', 'age']);
      f.name().value.set('Bob');
      expect(f().value()).toBe(model());
    });
  });

  it('Section 1: a component that imports only FormField binds an input to the model', async () => {
    const fixture = TestBed.createComponent(LabM26WhyHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.value).toBe('Ann');
    input.value = 'Zed';
    input.dispatchEvent(new Event('input'));
    expect(fixture.componentInstance.model().name).toBe('Zed');
  });
});
