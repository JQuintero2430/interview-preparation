import { LabM25FieldType } from './field-config';

export type LabM25FieldTemplate = 'input' | 'number' | 'select';

export interface LabM25FieldKind {
  /** Which template branch renders the type; each branch has a static `type` attribute. */
  readonly template: LabM25FieldTemplate;
  readonly initial: string | number | null;
}

export const LAB_M25_FIELD_REGISTRY = {
  text: { template: 'input', initial: '' },
  number: { template: 'number', initial: null },
  select: { template: 'select', initial: '' },
} as const satisfies Record<LabM25FieldType, LabM25FieldKind>;
