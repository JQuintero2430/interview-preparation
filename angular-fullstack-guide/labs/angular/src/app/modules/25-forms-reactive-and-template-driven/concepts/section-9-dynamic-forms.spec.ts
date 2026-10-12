import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormRecord,
  NumberValueAccessor,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { By } from '@angular/platform-browser';

type LabM25FieldConfig = { key: string; type: 'text' | 'number'; required: boolean };
type LabM25FieldControl = FormControl<string | number | null>;

const labM25Fields: LabM25FieldConfig[] = [
  { key: 'name', type: 'text', required: true },
  { key: 'age', type: 'number', required: false },
];

function labM25BuildRecord(fields: LabM25FieldConfig[]): FormRecord<LabM25FieldControl> {
  const record = new FormRecord<LabM25FieldControl>({});
  for (const field of fields) {
    record.addControl(field.key, new FormControl(null, field.required ? Validators.required : []));
  }
  return record;
}

function labM25AtLeastOneRow(control: AbstractControl): ValidationErrors | null {
  return control instanceof FormArray && control.length === 0 ? { noRows: true } : null;
}

class LabM25RowList {
  readonly array = new FormArray([new FormControl('a'), new FormControl('b'), new FormControl('c')]);
  readonly rows = signal(this.array.controls.slice());

  remove(index: number): void {
    this.array.removeAt(index);
    this.rows.set([...this.array.controls]);
  }
}

@Component({
  selector: 'lab-m25-rows-by-control-host',
  imports: [ReactiveFormsModule],
  template: `<div [formArray]="list.array">
    @for (row of list.rows(); track row; let i = $index) {
      <input [formControlName]="i" />
    }
  </div>`,
})
class LabM25RowsByControlHost {
  readonly list = new LabM25RowList();
}

@Component({
  selector: 'lab-m25-rows-by-index-host',
  imports: [ReactiveFormsModule],
  template: `<div [formArray]="list.array">
    @for (row of list.rows(); track $index; let i = $index) {
      <input [formControlName]="i" />
    }
  </div>`,
})
class LabM25RowsByIndexHost {
  readonly list = new LabM25RowList();
}

@Component({
  selector: 'lab-m25-bound-type-host',
  imports: [ReactiveFormsModule],
  template: `<form [formGroup]="form">
    @for (field of fields; track field.key) {
      <input [formControlName]="field.key" [type]="field.type" />
    }
  </form>`,
})
class LabM25BoundTypeHost {
  readonly fields = labM25Fields;
  readonly form = labM25BuildRecord(labM25Fields);
}

@Component({
  selector: 'lab-m25-static-type-host',
  imports: [ReactiveFormsModule],
  template: `<form [formGroup]="form">
    @for (field of fields; track field.key) {
      @switch (field.type) {
        @case ('number') {
          <input type="number" [formControlName]="field.key" />
        }
        @default {
          <input type="text" [formControlName]="field.key" />
        }
      }
    }
  </form>`,
})
class LabM25StaticTypeHost {
  readonly fields = labM25Fields;
  readonly form = labM25BuildRecord(labM25Fields);
}

@Component({
  selector: 'lab-m25-push-host',
  imports: [ReactiveFormsModule],
  template: `<div [formArray]="array">
    @for (row of array.controls; track row) {
      <input [formControl]="row" />
    }
  </div>`,
})
class LabM25PushHost {
  readonly array = new FormArray([new FormControl('a', Validators.required)]);
}

@Component({
  selector: 'lab-m25-push-signal-host',
  imports: [ReactiveFormsModule],
  template: `@for (row of rows(); track row) {
    <input [formControl]="row" />
  }`,
})
class LabM25PushSignalHost {
  readonly array = new FormArray([new FormControl('a', Validators.required)]);
  readonly rows = signal(this.array.controls.slice());

  add(control: FormControl<string | null>): void {
    this.array.push(control);
    this.rows.set([...this.array.controls]);
  }
}

@Component({
  selector: 'lab-m25-push-events-host',
  imports: [ReactiveFormsModule],
  template: `@for (row of array.controls; track row) {
    <input [formControl]="row" />
  }`,
})
class LabM25PushEventsHost {
  readonly array = new FormArray([new FormControl('a', Validators.required)]);

  constructor() {
    const changeDetector = inject(ChangeDetectorRef);
    this.array.events.subscribe(() => changeDetector.markForCheck());
  }
}

async function render<T>(type: new () => T) {
  const fixture = TestBed.createComponent(type);
  fixture.autoDetectChanges();
  await fixture.whenStable();
  const root = fixture.nativeElement as HTMLElement;
  return { fixture, root, host: fixture.componentInstance };
}

function inputs(root: HTMLElement): HTMLInputElement[] {
  return Array.from(root.querySelectorAll('input'));
}

function type(input: HTMLInputElement, text: string): void {
  input.value = text;
  input.dispatchEvent(new Event('input'));
}

describe('Section 9: dynamic forms', () => {
  it("Section 9: push, insert and removeAt keep the array's order", () => {
    const array = new FormArray([new FormControl('a'), new FormControl('b')]);
    array.push(new FormControl('c'));
    expect(array.value).toEqual(['a', 'b', 'c']);
    array.insert(0, new FormControl('z'));
    expect(array.value).toEqual(['z', 'a', 'b', 'c']);
    array.removeAt(1);
    expect(array.value).toEqual(['z', 'b', 'c']);
    array.push([new FormControl('d'), new FormControl('e')]);
    expect(array.value).toEqual(['z', 'b', 'c', 'd', 'e']);
    expect(array.length).toBe(5);
  });

  it('Section 9: push of several controls emits one valueChanges', () => {
    const array = new FormArray([new FormControl(1)]);
    const emitted: unknown[] = [];
    array.valueChanges.subscribe((value) => emitted.push(value));
    array.push([new FormControl(2), new FormControl(3)]);
    expect(emitted).toEqual([[1, 2, 3]]);
  });

  it('Section 9: the formArray directive binds inputs by index', async () => {
    const { host, root } = await render(LabM25RowsByControlHost);
    const [first, second] = inputs(root);
    expect(inputs(root).map((input) => input.value)).toEqual(['a', 'b', 'c']);
    type(second, 'B');
    expect(host.list.array.value).toEqual(['a', 'B', 'c']);
    type(first, 'A');
    expect(host.list.array.value).toEqual(['A', 'B', 'c']);
  });

  it('Section 9: tracking rows by control keeps values in place when a row is removed', async () => {
    const { fixture, host, root } = await render(LabM25RowsByControlHost);
    const before = inputs(root);
    host.list.remove(0);
    await fixture.whenStable();
    const after = inputs(root);
    expect(after).toEqual([before[1], before[2]]);
    expect(after.map((input) => input.value)).toEqual(['b', 'c']);
    type(after[0], 'X');
    expect(host.list.array.value).toEqual(['X', 'c']);
  });

  it('Section 9: tracking rows by index leaves a surviving input bound to the removed control', async () => {
    const { fixture, host, root } = await render(LabM25RowsByIndexHost);
    const before = inputs(root);
    const removed = host.list.array.at(0);
    host.list.remove(0);
    await fixture.whenStable();
    const after = inputs(root);
    expect(after).toEqual([before[0], before[1]]);
    expect(after.map((input) => input.value)).toEqual(['a', 'b']);
    type(after[0], 'X');
    expect(removed.value).toBe('X');
    expect(host.list.array.value).toEqual(['b', 'c']);
  });

  it('Section 9: a bound type attribute does not select the number accessor', async () => {
    const { fixture, host, root } = await render(LabM25BoundTypeHost);
    expect(inputs(root).map((input) => input.type)).toEqual(['text', 'number']);
    expect(fixture.debugElement.queryAll(By.directive(NumberValueAccessor))).toHaveLength(0);
    type(inputs(root)[1], '30');
    expect(host.form.value).toEqual({ name: null, age: '30' });
  });

  it('Section 9: a static type number in the field template gives numbers', async () => {
    const { fixture, host, root } = await render(LabM25StaticTypeHost);
    expect(fixture.debugElement.queryAll(By.directive(NumberValueAccessor))).toHaveLength(1);
    type(inputs(root)[1], '30');
    expect(host.form.value).toEqual({ name: null, age: 30 });
  });

  it('Section 9: in a zoneless view a push that keeps the array valid does not render the new row', async () => {
    const { fixture, host, root } = await render(LabM25PushHost);
    host.array.push(new FormControl('b', Validators.required));
    await fixture.whenStable();
    expect(host.array.length).toBe(2);
    expect(host.array.status).toBe('VALID');
    expect(inputs(root)).toHaveLength(1);
  });

  it('Section 9: a push that makes the array invalid renders the new row', async () => {
    const { fixture, host, root } = await render(LabM25PushHost);
    host.array.push(new FormControl('', Validators.required));
    await fixture.whenStable();
    expect(host.array.status).toBe('INVALID');
    expect(inputs(root)).toHaveLength(2);
  });

  it('Section 9: a signal of the rows renders a pushed control', async () => {
    const { fixture, host, root } = await render(LabM25PushSignalHost);
    host.add(new FormControl('b', Validators.required));
    await fixture.whenStable();
    expect(host.array.status).toBe('VALID');
    expect(inputs(root)).toHaveLength(2);
  });

  it('Section 9: markForCheck from the events stream renders a pushed control', async () => {
    const { fixture, host, root } = await render(LabM25PushEventsHost);
    host.array.push(new FormControl('b', Validators.required));
    await fixture.whenStable();
    expect(host.array.status).toBe('VALID');
    expect(inputs(root)).toHaveLength(2);
  });

  it('Section 9: a FormArray validator makes an empty array invalid', () => {
    const array = new FormArray([new FormControl('a')], labM25AtLeastOneRow);
    expect(array.valid).toBe(true);
    array.removeAt(0);
    expect(array.errors).toEqual({ noRows: true });
    expect(array.status).toBe('INVALID');
    array.push(new FormControl('b'));
    expect(array.valid).toBe(true);
  });

  it('Section 9: a config builds a FormRecord with its validators', () => {
    const record = labM25BuildRecord(labM25Fields);
    expect(Object.keys(record.controls)).toEqual(['name', 'age']);
    expect(record.status).toBe('INVALID');
    expect(record.controls['name'].errors).toEqual({ required: true });
    expect(record.controls['age'].errors).toBeNull();
    record.controls['name'].setValue('Ada');
    expect(record.status).toBe('VALID');
    expect(record.value).toEqual({ name: 'Ada', age: null });
  });
});
