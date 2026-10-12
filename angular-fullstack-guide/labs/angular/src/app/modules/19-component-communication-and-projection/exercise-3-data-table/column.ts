import { Directive, TemplateRef, inject, input } from '@angular/core';

export interface CellContext<Row> {
  readonly $implicit: Row;
  readonly index: number;
}

// A column is declared as <ng-template labColumn ...> (custom cell) or <ng-container labColumn ...> (plain field).
@Directive({ selector: 'ng-template[labColumn], ng-container[labColumn]' })
export class Column<Row> {
  readonly header = input.required<string>();
  readonly field = input<keyof Row & string>();
  // Bound only so the compiler can infer Row for the context guard; the table never reads it.
  readonly rows = input.required<readonly Row[]>();
  readonly template = inject<TemplateRef<CellContext<Row>>>(TemplateRef, { optional: true });

  static ngTemplateContextGuard<Row>(_dir: Column<Row>, _ctx: unknown): _ctx is CellContext<Row> {
    return true;
  }
}
