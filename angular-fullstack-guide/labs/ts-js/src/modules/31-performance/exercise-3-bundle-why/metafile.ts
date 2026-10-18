// The subset of esbuild's metafile that Exercise 31.3 reads, declared here from the shape documented at
// https://esbuild.github.io/api/#metafile so that no lab file imports esbuild.

export type ImportKind =
  | 'entry-point'
  | 'import-statement'
  | 'require-call'
  | 'dynamic-import'
  | 'require-resolve'
  | 'import-rule'
  | 'composes-from'
  | 'url-token';

export interface MetafileImport {
  readonly path: string;
  readonly kind: ImportKind;
  readonly external?: boolean;
}

export interface MetafileInput {
  readonly bytes: number;
  readonly imports: readonly MetafileImport[];
}

export interface MetafileOutput {
  readonly bytes: number;
  readonly inputs: Readonly<Record<string, { readonly bytesInOutput: number }>>;
  readonly entryPoint?: string;
}

export interface Metafile {
  readonly inputs: Readonly<Record<string, MetafileInput>>;
  readonly outputs: Readonly<Record<string, MetafileOutput>>;
}
