import { AfterViewInit, ChangeDetectionStrategy, Component, input, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import {
  CdkCell,
  CdkCellDef,
  CdkColumnDef,
  CdkHeaderCell,
  CdkHeaderCellDef,
  CdkHeaderRow,
  CdkHeaderRowDef,
  CdkNoDataRow,
  CdkRow,
  CdkRowDef,
  CdkTable,
  CdkTableDataSourceInput,
} from '@angular/cdk/table';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource,
} from '@angular/material/table';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { BehaviorSubject, Observable, of } from 'rxjs';

interface Item {
  readonly id: number;
  readonly name: string;
  readonly qty: number;
}

const ITEMS: readonly Item[] = [
  { id: 1, name: 'Bolt', qty: 40 },
  { id: 2, name: 'Nut', qty: 25 },
  { id: 3, name: 'Washer', qty: 10 },
];

/** A data source that is not a Material class: it records every viewer it is connected to and disconnected from. */
class CountingSource extends DataSource<Item> {
  readonly connected: CollectionViewer[] = [];
  readonly disconnected: CollectionViewer[] = [];
  private readonly rows = new BehaviorSubject<readonly Item[]>(ITEMS);

  override connect(viewer: CollectionViewer): Observable<readonly Item[]> {
    this.connected.push(viewer);
    return this.rows;
  }

  override disconnect(viewer: CollectionViewer): void {
    this.disconnected.push(viewer);
  }

  emit(items: readonly Item[]): void {
    this.rows.next(items);
  }
}

/** Eager, so a plain `detectChanges` also refreshes rows the table creates when its source emits. */
@Component({
  selector: 'lab-m36-table',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [CdkTable, CdkColumnDef, CdkHeaderCellDef, CdkHeaderCell, CdkCellDef, CdkCell, CdkHeaderRowDef, CdkHeaderRow, CdkRowDef, CdkRow, CdkNoDataRow],
  template: `
    <table cdk-table [dataSource]="source()">
      <ng-container cdkColumnDef="id">
        <th cdk-header-cell *cdkHeaderCellDef>Id</th>
        <td cdk-cell *cdkCellDef="let row">{{ row.id }}</td>
      </ng-container>
      <ng-container cdkColumnDef="name">
        <th cdk-header-cell *cdkHeaderCellDef>Name</th>
        <td cdk-cell *cdkCellDef="let row">{{ row.name }}</td>
      </ng-container>
      <ng-container cdkColumnDef="qty">
        <th cdk-header-cell *cdkHeaderCellDef>Qty</th>
        <td cdk-cell *cdkCellDef="let row">{{ row.qty }}</td>
      </ng-container>
      <tr cdk-header-row *cdkHeaderRowDef="columns"></tr>
      <tr cdk-row *cdkRowDef="let row; columns: columns"></tr>
      <tr *cdkNoDataRow><td colspan="2">No items</td></tr>
    </table>
  `,
})
class LabM36Table {
  readonly source = input.required<CdkTableDataSourceInput<Item>>();
  readonly table = viewChild.required(CdkTable);
  protected readonly columns = ['name', 'qty'];
}

/** The Material table is the CDK table with a look; sorting and paging live in the data source. */
@Component({
  selector: 'lab-m36-sorted-table',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [MatTable, MatColumnDef, MatHeaderCellDef, MatHeaderCell, MatCellDef, MatCell, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatSort, MatSortHeader],
  template: `
    <table mat-table matSort [dataSource]="dataSource">
      <ng-container matColumnDef="name">
        <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
        <td mat-cell *matCellDef="let row">{{ row.name }}</td>
      </ng-container>
      <ng-container matColumnDef="qty">
        <th mat-header-cell *matHeaderCellDef mat-sort-header>Qty</th>
        <td mat-cell *matCellDef="let row">{{ row.qty }}</td>
      </ng-container>
      <tr mat-header-row *matHeaderRowDef="columns"></tr>
      <tr mat-row *matRowDef="let row; columns: columns"></tr>
    </table>
  `,
})
class LabM36SortedTable implements AfterViewInit {
  readonly dataSource = new MatTableDataSource<Item>([ITEMS[2], ITEMS[0], ITEMS[1]]);
  readonly table = viewChild.required(MatTable);
  protected readonly columns = ['name', 'qty'];
  private readonly sort = viewChild.required(MatSort);

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort();
  }
}

function headerTexts(root: HTMLElement): (string | undefined)[] {
  return Array.from(root.querySelectorAll('th')).map((cell) => cell.textContent?.trim());
}

function rowTexts(root: HTMLElement, rowSelector: string): string[][] {
  return Array.from(root.querySelectorAll(rowSelector)).map((row) =>
    Array.from(row.querySelectorAll('td')).map((cell) => cell.textContent?.trim() ?? ''),
  );
}

describe('Section 7: tables and long lists', () => {
  it('Section 7: the table renders one row per emitted item and only the listed columns', () => {
    // An array, an Observable and any object with connect and disconnect give the same rows.
    const sources: readonly CdkTableDataSourceInput<Item>[] = [ITEMS, of(ITEMS), { connect: () => of(ITEMS), disconnect: () => undefined }];
    for (const source of sources) {
      const fixture = TestBed.createComponent(LabM36Table);
      fixture.componentRef.setInput('source', source);
      fixture.detectChanges();
      const root: HTMLElement = fixture.nativeElement;

      expect(headerTexts(root)).toEqual(['Name', 'Qty']);
      expect(rowTexts(root, 'tr[cdk-row]')).toEqual([
        ['Bolt', '40'],
        ['Nut', '25'],
        ['Washer', '10'],
      ]);
      expect(root.querySelectorAll('td.cdk-column-name').length).toBe(3);
      expect(root.querySelector('.cdk-column-id')).toBeNull();
      expect(root.querySelector('.cdk-no-data-row')).toBeNull();
    }

    // Each emission replaces the rows.
    const emitted = new BehaviorSubject<readonly Item[]>(ITEMS);
    const fixture = TestBed.createComponent(LabM36Table);
    fixture.componentRef.setInput('source', emitted);
    fixture.detectChanges();
    emitted.next(ITEMS.slice(1));
    fixture.detectChanges();

    expect(rowTexts(fixture.nativeElement, 'tr[cdk-row]')).toEqual([
      ['Nut', '25'],
      ['Washer', '10'],
    ]);
  });

  it('Section 7: connect is called once on init and disconnect once on destroy', () => {
    const source = new CountingSource();
    const fixture = TestBed.createComponent(LabM36Table);
    fixture.componentRef.setInput('source', source);

    expect(source.connected.length).toBe(0);
    fixture.detectChanges();
    const table = fixture.componentInstance.table();

    // The table passes itself as the collection viewer, once, at the first content check.
    expect(source.connected.length).toBe(1);
    expect(source.connected[0]).toBe(table);
    expect(source.disconnected.length).toBe(0);

    // An emission renders a row; it does not connect again.
    source.emit(ITEMS.slice(0, 1));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('tr[cdk-row]').length).toBe(1);
    expect(source.connected.length).toBe(1);

    // A new data source disconnects the old one and connects the new one in the same pass.
    const next = new CountingSource();
    fixture.componentRef.setInput('source', next);
    fixture.detectChanges();
    expect(source.disconnected.length).toBe(1);
    expect(source.disconnected[0]).toBe(table);
    expect(next.connected.length).toBe(1);
    expect(next.connected[0]).toBe(table);

    // Destroying the table disconnects the current source only.
    fixture.destroy();
    expect(next.disconnected.length).toBe(1);
    expect(next.disconnected[0]).toBe(table);
    expect(source.disconnected.length).toBe(1);
  });

  it('Section 7: the no-data row shows for an empty emission', () => {
    const emitted = new BehaviorSubject<readonly Item[]>([]);
    const fixture = TestBed.createComponent(LabM36Table);
    fixture.componentRef.setInput('source', emitted);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    const noData = () => root.querySelectorAll('.cdk-no-data-row');

    expect(root.querySelectorAll('tr[cdk-row]').length).toBe(0);
    expect(noData().length).toBe(1);
    expect(noData()[0].textContent?.trim()).toBe('No items');
    expect(noData()[0].getAttribute('role')).toBe('row');

    emitted.next(ITEMS.slice(0, 1));
    fixture.detectChanges();
    expect(root.querySelectorAll('tr[cdk-row]').length).toBe(1);
    expect(noData().length).toBe(0);

    emitted.next([]);
    fixture.detectChanges();
    expect(root.querySelectorAll('tr[cdk-row]').length).toBe(0);
    expect(noData().length).toBe(1);
  });

  it('Section 7: MatSort reorders a MatTableDataSource', () => {
    const fixture = TestBed.createComponent(LabM36SortedTable);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    const names = () => rowTexts(root, 'tr[mat-row]').map((cells) => cells[0]);
    const nameHeader = root.querySelector<HTMLElement>('th[mat-header-cell]');

    // MatTable is the CDK table underneath.
    expect(fixture.componentInstance.table() instanceof CdkTable).toBe(true);
    expect(names()).toEqual(['Washer', 'Bolt', 'Nut']);
    expect(nameHeader?.getAttribute('aria-sort')).toBe('none');

    // The header cycles ascending, descending, then cleared, which restores the data order.
    nameHeader?.click();
    fixture.detectChanges();
    expect(names()).toEqual(['Bolt', 'Nut', 'Washer']);
    expect(nameHeader?.getAttribute('aria-sort')).toBe('ascending');

    nameHeader?.click();
    fixture.detectChanges();
    expect(names()).toEqual(['Washer', 'Nut', 'Bolt']);
    expect(nameHeader?.getAttribute('aria-sort')).toBe('descending');

    nameHeader?.click();
    fixture.detectChanges();
    expect(names()).toEqual(['Washer', 'Bolt', 'Nut']);
    expect(nameHeader?.getAttribute('aria-sort')).toBe('none');

    // The sort works on a copy: the source array keeps its order.
    expect(fixture.componentInstance.dataSource.data.map((item) => item.name)).toEqual(['Washer', 'Bolt', 'Nut']);
  });
});
