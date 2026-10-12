import { NgTemplateOutlet } from '@angular/common';
import { Component, contentChildren, input } from '@angular/core';
import { Column } from './column';

@Component({
  selector: 'lab-m19-data-table',
  imports: [NgTemplateOutlet],
  template: `
    <table>
      <thead>
        <tr>
          @for (col of columns(); track col) {
            <th>{{ col.header() }}</th>
          }
        </tr>
      </thead>
      <tbody>
        @for (row of rows(); track row; let i = $index) {
          <tr>
            @for (col of columns(); track col) {
              <td>
                @if (col.template; as template) {
                  <ng-container [ngTemplateOutlet]="template" [ngTemplateOutletContext]="{ $implicit: row, index: i }" />
                } @else {
                  {{ valueOf(row, col) }}
                }
              </td>
            }
          </tr>
        }
      </tbody>
    </table>
  `,
})
export class DataTable<Row extends object> {
  readonly rows = input.required<readonly Row[]>();
  protected readonly columns = contentChildren<Column<Row>>(Column);

  protected valueOf(row: Row, col: Column<Row>): unknown {
    const field = col.field();
    return field === undefined ? '' : row[field];
  }
}
