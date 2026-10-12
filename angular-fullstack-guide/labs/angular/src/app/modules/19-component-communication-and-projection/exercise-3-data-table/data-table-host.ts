import { Component, signal } from '@angular/core';
import { Column } from './column';
import { DataTable } from './data-table';

export interface Person {
  readonly name: string;
  readonly age: number;
}

@Component({
  selector: 'lab-m19-table-host',
  imports: [DataTable, Column],
  template: `
    <lab-m19-data-table [rows]="people">
      <ng-template labColumn header="Name" [rows]="people" let-row let-i="index">{{ i }}:{{ row.name }}{{ suffix() }}</ng-template>
      @if (showAge()) {
        <ng-container labColumn header="Age" field="age" [rows]="people" />
      }
      <ng-container labColumn header="Plain" field="name" [rows]="people" />
    </lab-m19-data-table>
  `,
})
export class TableHost {
  readonly people: readonly Person[] = [
    { name: 'Ada', age: 36 },
    { name: 'Lin', age: 41 },
  ];
  readonly showAge = signal(true);
  readonly suffix = signal('!');
}
