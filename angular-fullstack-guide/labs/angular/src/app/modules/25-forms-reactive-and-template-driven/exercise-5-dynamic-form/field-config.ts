export type LabM25FieldType = 'text' | 'number' | 'select';

export interface LabM25FieldConfig {
  readonly key: string;
  readonly label: string;
  readonly type: LabM25FieldType;
  readonly required?: boolean;
  readonly min?: number;
  readonly options?: readonly string[];
}

/** The repeatable section: `minRows` rows exist at the start and may never be fewer. */
export interface LabM25SectionConfig {
  readonly key: string;
  readonly label: string;
  readonly minRows: number;
  readonly fields: readonly LabM25FieldConfig[];
}

export interface LabM25FormConfig {
  readonly fields: readonly LabM25FieldConfig[];
  readonly section: LabM25SectionConfig;
}

export const LAB_M25_SAMPLE_CONFIG: LabM25FormConfig = {
  fields: [
    { key: 'name', label: 'Name', type: 'text', required: true },
    { key: 'age', label: 'Age', type: 'number', min: 18 },
    { key: 'country', label: 'Country', type: 'select', required: true, options: ['ES', 'CO', 'MX'] },
  ],
  section: {
    key: 'contacts',
    label: 'Contacts',
    minRows: 1,
    fields: [
      { key: 'email', label: 'Email', type: 'text', required: true },
      { key: 'kind', label: 'Kind', type: 'select', options: ['work', 'home'] },
    ],
  },
};
