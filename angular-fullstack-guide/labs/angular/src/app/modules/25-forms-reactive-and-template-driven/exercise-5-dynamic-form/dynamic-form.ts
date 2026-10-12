import { ChangeDetectorRef, Component, inject, input, signal } from '@angular/core';
import { ControlContainer, ReactiveFormsModule } from '@angular/forms';
import { LAB_M25_SAMPLE_CONFIG, LabM25FieldConfig } from './field-config';
import { LAB_M25_FIELD_REGISTRY } from './field-registry';
import { LabM25FormBuilder, LabM25Row } from './form-builder.service';

@Component({
  selector: 'lab-m25-dynamic-field',
  imports: [ReactiveFormsModule],
  // The field binds to the group around it, not to a group of its own.
  viewProviders: [{ provide: ControlContainer, useFactory: () => inject(ControlContainer, { skipSelf: true }) }],
  template: `
    <label>
      <span>{{ field().label }}</span>
      @switch (registry[field().type].template) {
        @case ('input') {
          <input type="text" [formControlName]="field().key" />
        }
        @case ('number') {
          <input type="number" [formControlName]="field().key" />
        }
        @case ('select') {
          <select [formControlName]="field().key">
            @for (option of field().options ?? []; track option) {
              <option [value]="option">{{ option }}</option>
            }
          </select>
        }
      }
    </label>
  `,
})
export class LabM25DynamicField {
  readonly field = input.required<LabM25FieldConfig>();
  protected readonly registry = LAB_M25_FIELD_REGISTRY;
}

const DYNAMIC_FORM_TEMPLATE = `
  <form [formGroup]="form" (ngSubmit)="submit()">
    <div formGroupName="fields">
      @for (field of config.fields; track field.key) {
        <lab-m25-dynamic-field [field]="field" />
      }
    </div>
    <fieldset formArrayName="section">
      <legend>{{ config.section.label }}</legend>
      @for (row of rows(); track row; let i = $index) {
        <div [formGroupName]="i">
          @for (field of config.section.fields; track field.key) {
            <lab-m25-dynamic-field [field]="field" />
          }
          <button type="button" class="remove" (click)="remove(i)">Remove</button>
        </div>
      }
      <button type="button" class="add" (click)="add()">Add contact</button>
    </fieldset>
    <button type="submit" class="save">Save</button>
  </form>
`;

abstract class LabM25DynamicFormBase {
  protected readonly config = LAB_M25_SAMPLE_CONFIG;
  private readonly builder = inject(LabM25FormBuilder);
  readonly form = this.builder.build(this.config);
  /** The value a valid submit produced: the field keys plus the section key. */
  readonly submitted = signal<Record<string, unknown> | null>(null);
  protected abstract readonly rows: () => readonly LabM25Row[];

  protected add(): void {
    this.form.controls.section.push(this.builder.buildRow(this.config.section));
    this.rowsChanged();
  }

  protected remove(index: number): void {
    this.form.controls.section.removeAt(index);
    this.rowsChanged();
  }

  protected submit(): void {
    if (this.form.invalid) return;
    const { fields, section } = this.form.getRawValue();
    this.submitted.set({ ...fields, [this.config.section.key]: section });
  }

  protected rowsChanged(): void {}
}

@Component({
  selector: 'lab-m25-dynamic-form',
  imports: [ReactiveFormsModule, LabM25DynamicField],
  template: DYNAMIC_FORM_TEMPLATE,
})
export class LabM25DynamicForm extends LabM25DynamicFormBase {
  private readonly rowList = signal(this.form.controls.section.controls.slice());
  protected readonly rows = this.rowList.asReadonly();

  protected override rowsChanged(): void {
    this.rowList.set([...this.form.controls.section.controls]);
  }
}

/** The alternative reads the array itself and marks the view when the array's `events` emit. */
@Component({
  selector: 'lab-m25-dynamic-form-events',
  imports: [ReactiveFormsModule, LabM25DynamicField],
  template: DYNAMIC_FORM_TEMPLATE,
})
export class LabM25DynamicFormEvents extends LabM25DynamicFormBase {
  protected readonly rows = () => this.form.controls.section.controls;

  constructor() {
    super();
    const changeDetector = inject(ChangeDetectorRef);
    this.form.controls.section.events.subscribe(() => changeDetector.markForCheck());
  }
}
