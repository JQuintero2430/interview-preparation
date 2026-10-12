import { NgTemplateOutlet } from '@angular/common';
import { Component, Directive, TemplateRef, contentChild, contentChildren, inject, input, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

interface Row {
  readonly id: number;
  readonly name: string;
}

// --- A column API: a marker directive on ng-template, found with contentChildren ---

@Directive({ selector: 'ng-template[labM19S4Col]' })
class Col {
  readonly header = input.required<string>();
  readonly tpl = inject(TemplateRef);

  static ngTemplateContextGuard(_directive: Col, _context: unknown): _context is { $implicit: Row } {
    return true;
  }
}

@Component({
  selector: 'lab-m19-s4-table',
  imports: [NgTemplateOutlet],
  template: `
    <table>
      <thead>
        <tr>
          @for (c of cols(); track c) {
            <th>{{ c.header() }}</th>
          }
        </tr>
      </thead>
      <tbody>
        @for (r of rows(); track r.id) {
          <tr>
            @for (c of cols(); track c) {
              <td><ng-container *ngTemplateOutlet="c.tpl; context: { $implicit: r }" /></td>
            }
          </tr>
        }
      </tbody>
    </table>
  `,
})
class Table {
  readonly rows = input.required<readonly Row[]>();
  readonly cols = contentChildren(Col);
  readonly tableField = 'table-field';
}

@Component({
  selector: 'lab-m19-s4-table-host',
  imports: [Table, Col],
  template: `
    <lab-m19-s4-table [rows]="rows">
      <ng-template labM19S4Col header="Name" let-row>
        [{{ row.name }}|{{ hostField() }}|{{ $any(this).tableField ?? 'n/a' }}]
      </ng-template>
      <ng-template labM19S4Col header="Id" let-row>{{ row.id }}</ng-template>
      <ng-template labM19S4Col header="Last" let-row>{{ row.name.length }}</ng-template>
    </lab-m19-s4-table>
  `,
})
class TableHost {
  readonly rows: readonly Row[] = [{ id: 1, name: 'Ann' }];
  readonly hostField = signal('host-field');
}

// --- ng-content inside an ng-template rendered by two outlets ---

@Component({
  selector: 'lab-m19-s4-twice',
  imports: [NgTemplateOutlet],
  template: `
    <ng-template #t><b><ng-content /></b></ng-template>
    <i><ng-container *ngTemplateOutlet="t" /></i>
    <u><ng-container *ngTemplateOutlet="t" /></u>
  `,
})
class Twice {}

@Component({
  selector: 'lab-m19-s4-twice-host',
  imports: [Twice],
  template: `<lab-m19-s4-twice>X</lab-m19-s4-twice>`,
})
class TwiceHost {}

// --- A template passed as an input, and one found with contentChild(TemplateRef) ---

@Component({
  selector: 'lab-m19-s4-panel',
  imports: [NgTemplateOutlet],
  template: `<ng-container *ngTemplateOutlet="body(); context: { $implicit: count() }" />`,
})
class Panel {
  readonly body = input.required<TemplateRef<{ $implicit: number }>>();
  readonly count = signal(3);
}

@Component({
  selector: 'lab-m19-s4-panel-host',
  imports: [Panel],
  template: `
    <ng-template #t let-n>n={{ n }}</ng-template>
    <lab-m19-s4-panel [body]="t" />
  `,
})
class PanelHost {}

@Component({
  selector: 'lab-m19-s4-slot-list',
  imports: [NgTemplateOutlet],
  template: `<ng-container *ngTemplateOutlet="empty()" />`,
})
class SlotList {
  readonly empty = contentChild.required(TemplateRef);
}

@Component({
  selector: 'lab-m19-s4-slot-host',
  imports: [SlotList],
  template: `<lab-m19-s4-slot-list><ng-template>nothing here</ng-template></lab-m19-s4-slot-list>`,
})
class SlotHost {}

function text(el: Element | null): string {
  return (el?.textContent ?? '').replace(/\s+/g, ' ').trim();
}

describe('Section 4: template-driven APIs', () => {
  it("Section 4: a template declared by the caller reads the caller's fields and the outlet's context", () => {
    const fixture = TestBed.createComponent(TableHost);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    expect(text(root.querySelector('td'))).toBe('[Ann|host-field|n/a]');

    fixture.componentInstance.hostField.set('changed');
    fixture.detectChanges();
    expect(text(root.querySelector('td'))).toBe('[Ann|changed|n/a]');
  });

  it('Section 4: contentChildren of a template directive lists the columns in declaration order', () => {
    const fixture = TestBed.createComponent(TableHost);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    expect([...root.querySelectorAll('th')].map((th) => text(th))).toEqual(['Name', 'Id', 'Last']);
    expect([...root.querySelectorAll('td')].map((td) => text(td)).slice(1)).toEqual(['1', '3']);
  });

  it('Section 4: ng-content inside an ng-template rendered twice projects into the last instance only', () => {
    const fixture = TestBed.createComponent(TwiceHost);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelectorAll('b').length).toBe(2);
    expect(text(root.querySelector('i b'))).toBe('');
    expect(text(root.querySelector('u b'))).toBe('X');
  });

  it('Section 4: a template passed as an input renders with ngTemplateOutlet and its context', () => {
    const fixture = TestBed.createComponent(PanelHost);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    expect(text(root)).toBe('n=3');

    const panel = fixture.debugElement.children[0]!.componentInstance as Panel;
    panel.count.set(4);
    fixture.detectChanges();
    expect(text(root)).toBe('n=4');
  });

  it('Section 4: contentChild of TemplateRef finds the ng-template written between the tags', () => {
    const fixture = TestBed.createComponent(SlotHost);
    fixture.detectChanges();
    expect(text(fixture.nativeElement)).toBe('nothing here');
  });
});
