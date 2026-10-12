import { Injectable } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormRecord, ValidatorFn, Validators } from '@angular/forms';
import { LabM25FieldConfig, LabM25FormConfig, LabM25SectionConfig } from './field-config';
import { LAB_M25_FIELD_REGISTRY } from './field-registry';

export type LabM25Control = FormControl<string | number | null>;
export type LabM25Row = FormRecord<LabM25Control>;
export type LabM25DynamicGroup = FormGroup<{ fields: LabM25Row; section: FormArray<LabM25Row> }>;

function validatorsOf(field: LabM25FieldConfig): ValidatorFn[] {
  const validators: ValidatorFn[] = [];
  if (field.required) validators.push(Validators.required);
  if (field.min !== undefined) validators.push(Validators.min(field.min));
  return validators;
}

function atLeastRows(min: number): ValidatorFn {
  return (control) =>
    control instanceof FormArray && control.length < min ? { minRows: { required: min, actual: control.length } } : null;
}

@Injectable({ providedIn: 'root' })
export class LabM25FormBuilder {
  buildRecord(fields: readonly LabM25FieldConfig[]): LabM25Row {
    const record: LabM25Row = new FormRecord({});
    for (const field of fields) {
      const initial = LAB_M25_FIELD_REGISTRY[field.type].initial;
      record.addControl(field.key, new FormControl<string | number | null>(initial, validatorsOf(field)));
    }
    return record;
  }

  buildRow(section: LabM25SectionConfig): LabM25Row {
    return this.buildRecord(section.fields);
  }

  build(config: LabM25FormConfig): LabM25DynamicGroup {
    const rows = Array.from({ length: config.section.minRows }, () => this.buildRow(config.section));
    return new FormGroup({
      fields: this.buildRecord(config.fields),
      section: new FormArray(rows, atLeastRows(config.section.minRows)),
    });
  }
}
