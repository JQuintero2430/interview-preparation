import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  apply,
  email,
  form,
  max,
  maxLength,
  min,
  minLength,
  pattern,
  required,
  schema,
  validate,
  validateStandardSchema,
} from '@angular/forms/signals';

interface LabM26Person {
  name: string;
  age: number | null;
  mail: string;
}

interface LabM26Address {
  street: string;
  zip: string;
}

describe('Section 4: schema rules and validation', () => {
  it('Section 4: built-in rules report kind and parameters', () => {
    TestBed.runInInjectionContext(() => {
      const model = signal({ name: '', age: 10 as number | null, high: 90, tag: 'abcdef', code: 'x1', mail: 'x' });
      const f = form(model, p => {
        required(p.name);
        min(p.age, 18);
        max(p.high, 80);
        maxLength(p.tag, 3);
        pattern(p.code, /^[a-z]+$/);
        email(p.mail);
      });
      expect(f.name().errors()).toMatchObject([{ kind: 'required' }]);
      expect(f.age().errors()).toMatchObject([{ kind: 'min', min: 18 }]);
      expect(f.high().errors()).toMatchObject([{ kind: 'max', max: 80 }]);
      expect(f.tag().errors()).toMatchObject([{ kind: 'maxLength', maxLength: 3 }]);
      expect(f.code().errors()).toMatchObject([{ kind: 'pattern', pattern: /^[a-z]+$/ }]);
      expect(f.mail().errors()).toMatchObject([{ kind: 'email' }]);
      expect(f.age().min?.()).toBe(18);
      expect(f().errors()).toEqual([]);
      expect(f().errorSummary().map(e => e.kind)).toEqual(['required', 'min', 'max', 'maxLength', 'pattern', 'email']);
    });
  });

  it('Section 4: minLength leaves an empty value to required', () => {
    TestBed.runInInjectionContext(() => {
      const model = signal({ name: '' });
      const f = form(model, p => {
        required(p.name);
        minLength(p.name, 3, { message: 'short' });
      });
      expect(f.name().errors().map(e => e.kind)).toEqual(['required']);
      f.name().value.set('ab');
      expect(f.name().errors()).toMatchObject([{ kind: 'minLength', minLength: 3, message: 'short' }]);
    });
  });

  it('Section 4: a custom validate rule reruns when the model changes', () => {
    TestBed.runInInjectionContext(() => {
      const model = signal<LabM26Person>({ name: 'Ada', age: 20, mail: '' });
      const f = form(model, p => {
        validate(p.age, ctx => (ctx.value() === null || ctx.value()! % 2 === 0 ? undefined : { kind: 'odd' }));
      });
      expect(f.age().errors()).toEqual([]);
      f.age().value.set(21);
      expect(f.age().errors()).toMatchObject([{ kind: 'odd' }]);
      f.age().value.set(22);
      expect(f.age().errors()).toEqual([]);
    });
  });

  it('Section 4: a rule message appears on the error', () => {
    TestBed.runInInjectionContext(() => {
      const f = form(signal({ name: '' }), p => {
        required(p.name, { message: 'Name is required' });
      });
      expect(f.name().errors()).toMatchObject([{ kind: 'required', message: 'Name is required' }]);
    });
  });

  it('Section 4: the schema function runs once while its rules rerun', () => {
    TestBed.runInInjectionContext(() => {
      let schemaRuns = 0;
      let ruleRuns = 0;
      const f = form(signal({ n: 1 }), p => {
        schemaRuns++;
        validate(p.n, ctx => {
          ruleRuns++;
          return ctx.value() > 1 ? { kind: 'big' } : undefined;
        });
      });
      expect(f.n().errors()).toEqual([]);
      f.n().value.set(2);
      expect(f.n().errors()).toMatchObject([{ kind: 'big' }]);
      f.n().value.set(3);
      expect(f.n().errors()).toMatchObject([{ kind: 'big' }]);
      expect(schemaRuns).toBe(1);
      expect(ruleRuns).toBe(3);
    });
  });

  it('Section 4: apply mounts a reusable schema on a sub-path', () => {
    TestBed.runInInjectionContext(() => {
      const addressSchema = schema<LabM26Address>(p => {
        required(p.street);
        minLength(p.zip, 5);
      });
      const f = form(
        signal({ home: { street: '', zip: '12' }, work: { street: 'Main', zip: '12345' } }),
        p => {
          apply(p.home, addressSchema);
          apply(p.work, addressSchema);
        },
      );
      expect(f.home.street().errors().map(e => e.kind)).toEqual(['required']);
      expect(f.home.zip().errors().map(e => e.kind)).toEqual(['minLength']);
      expect(f.work().errorSummary()).toEqual([]);
      expect(f().errorSummary().map(e => e.kind)).toEqual(['required', 'minLength']);
    });
  });

  it('Section 4: min rejects a string field at compile time', () => {
    TestBed.runInInjectionContext(() => {
      const f = form(signal({ s: '5', n: 5 as number | null }), p => {
        // @ts-expect-error TS2345 (recorded by compiling without this directive): min takes a number or null field
        min(p.s, 3);
        min(p.n, 3);
      });
      expect(f.n().errors()).toEqual([]);
    });
  });

  it('Section 4: getError returns the error of one kind', () => {
    TestBed.runInInjectionContext(() => {
      const f = form(signal({ name: '', age: 10 as number | null }), p => {
        required(p.name);
        min(p.age, 18);
      });
      expect(f.age().getError('min')).toMatchObject({ kind: 'min', min: 18 });
      expect(f.age().getError('required')).toBeUndefined();
      f.age().value.set(30);
      expect(f.age().getError('min')).toBeUndefined();
    });
  });

  it('Section 4: validateStandardSchema maps issues to field errors', () => {
    TestBed.runInInjectionContext(() => {
      const standard = {
        '~standard': {
          version: 1 as const,
          vendor: 'lab',
          validate: (value: unknown) => {
            const v = value as { name: string };
            return v.name === '' ? { issues: [{ message: 'empty', path: ['name'] }] } : { value };
          },
        },
      };
      const f = form(signal({ name: '' }), p => {
        validateStandardSchema(p, standard);
      });
      expect(f.name().errors()).toMatchObject([{ kind: 'standardSchema' }]);
      f.name().value.set('Ada');
      expect(f.name().errors()).toEqual([]);
    });
  });
});
