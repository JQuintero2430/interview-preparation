import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  FormField,
  applyWhen,
  disabled,
  form,
  hidden,
  readonly,
  required,
  schema,
  validate,
  validateTree,
} from '@angular/forms/signals';
import { LabM26LegacyOrder, labM26LegacyOrderSchema, labM26OrderSchema } from '../legacy/legacy-apis';

interface LabM26Pair {
  pw: string;
  confirm: string;
  company: boolean;
  vat: string;
}

@Component({
  selector: 'lab-m26-if-host',
  imports: [FormField],
  template: `
    @if (show()) {
      <input id="vat" [formField]="f.vat" />
    }
  `,
})
class LabM26IfHost {
  readonly show = signal(false);
  protected readonly f = form(signal({ vat: '' }), (p) => {
    required(p.vat);
  });
  readonly tree = this.f;
}

describe('Section 5: cross-field and conditional logic', () => {
  it('Section 5: a validate rule on confirm reads pw through valueOf', () => {
    TestBed.runInInjectionContext(() => {
      const f = form(signal<LabM26Pair>({ pw: 'abc', confirm: 'abd', company: false, vat: '' }), (p) => {
        validate(p.confirm, ({ value, valueOf }) => (value() === valueOf(p.pw) ? undefined : { kind: 'mismatch' }));
      });
      expect(f.confirm().errors().map((e) => e.kind)).toEqual(['mismatch']);
      expect(f().errors()).toEqual([]);
    });
  });

  it('Section 5: validateTree targets its error at another field', () => {
    TestBed.runInInjectionContext(() => {
      const f = form(signal<LabM26Pair>({ pw: 'abc', confirm: 'abd', company: false, vat: '' }), (p) => {
        validateTree(p, ({ value, fieldTree }) =>
          value().pw === value().confirm ? undefined : { kind: 'treeMismatch', fieldTree: fieldTree.pw },
        );
      });
      expect(f.pw().errors().map((e) => e.kind)).toEqual(['treeMismatch']);
      expect(f.confirm().errors()).toEqual([]);
      expect(f().errors()).toEqual([]);
    });
  });

  it('Section 5: applyWhen enables required only while the condition holds', () => {
    TestBed.runInInjectionContext(() => {
      const model = signal<LabM26Pair>({ pw: '', confirm: '', company: false, vat: '' });
      const f = form(model, (p) => {
        applyWhen(p, ({ valueOf }) => valueOf(p.company), schema<LabM26Pair>((q) => required(q.vat)));
      });
      expect(f.vat().errors()).toEqual([]);
      expect(f.vat().required()).toBe(false);
      model.update((m) => ({ ...m, company: true }));
      expect(f.vat().errors().map((e) => e.kind)).toEqual(['required']);
      expect(f.vat().required()).toBe(true);
    });
  });

  it('Section 5: disabled, hidden and readonly fields report no errors', () => {
    TestBed.runInInjectionContext(() => {
      const f = form(signal({ a: '', b: '', c: '', on: false }), (p) => {
        required(p.a);
        required(p.b);
        required(p.c);
        disabled(p.a, { when: ({ valueOf }) => !valueOf(p.on) });
        hidden(p.b, { when: () => true });
        readonly(p.c);
      });
      expect(f.a().disabled()).toBe(true);
      expect(f.a().errors()).toEqual([]);
      expect(f.a().valid()).toBe(true);
      expect(f.a().disabledReasons().length).toBe(1);
      expect(f.b().hidden()).toBe(true);
      expect(f.b().errors()).toEqual([]);
      expect(f.c().readonly()).toBe(true);
      expect(f.c().errors()).toEqual([]);
      expect(f().valid()).toBe(true);
    });
  });

  it('Section 5: a disabled field stops counting when the condition turns false', () => {
    TestBed.runInInjectionContext(() => {
      const model = signal({ a: '', on: false });
      const f = form(model, (p) => {
        required(p.a);
        disabled(p.a, { when: ({ valueOf }) => !valueOf(p.on) });
      });
      expect(f().valid()).toBe(true);
      model.update((m) => ({ ...m, on: true }));
      expect(f.a().disabled()).toBe(false);
      expect(f().valid()).toBe(false);
    });
  });

  it('Section 5: a field hidden only in the template still invalidates the form', async () => {
    const fixture = TestBed.createComponent(LabM26IfHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('#vat')).toBeNull();
    expect(fixture.componentInstance.tree.vat().hidden()).toBe(false);
    expect(fixture.componentInstance.tree.vat().errors().map((e) => e.kind)).toEqual(['required']);
    expect(fixture.componentInstance.tree().valid()).toBe(false);
  });

  it('Section 5: the deprecated function overload still disables and the { when } form matches it', () => {
    TestBed.runInInjectionContext(() => {
      const legacy = form(signal<LabM26LegacyOrder>({ company: false, vat: '' }), labM26LegacyOrderSchema);
      const current = form(signal<LabM26LegacyOrder>({ company: false, vat: '' }), labM26OrderSchema);
      expect(legacy.vat().disabled()).toBe(true);
      expect(current.vat().disabled()).toBe(true);
      expect(legacy().valid()).toBe(true);
      expect(current().valid()).toBe(true);
    });
  });
});
