import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableHost } from './data-table-host';

const root = (fixture: ComponentFixture<unknown>): HTMLElement => fixture.nativeElement as HTMLElement;

const headers = (fixture: ComponentFixture<unknown>): string[] =>
  Array.from(root(fixture).querySelectorAll('th')).map((th) => th.textContent?.trim() ?? '');

const cells = (fixture: ComponentFixture<unknown>, row: number): string[] =>
  Array.from(root(fixture).querySelectorAll('tbody tr')[row].querySelectorAll('td')).map(
    (td) => td.textContent?.replace(/\s+/g, ' ').trim() ?? '',
  );

function render(): ComponentFixture<TableHost> {
  const fixture = TestBed.createComponent(TableHost);
  fixture.detectChanges();
  return fixture;
}

describe('E19.3 A data table with a template-driven column API', () => {
  it('one header per column, in declaration order', () => {
    expect(headers(render())).toEqual(['Name', 'Age', 'Plain']);
  });

  it('each cell renders its column template with $implicit and index', () => {
    const fixture = render();
    expect(cells(fixture, 0)[0]).toBe('0:Ada!');
    expect(cells(fixture, 1)[0]).toBe('1:Lin!');
  });

  it('a column without a template renders its field value', () => {
    const fixture = render();
    expect(cells(fixture, 0).slice(1)).toEqual(['36', 'Ada']);
    expect(cells(fixture, 1).slice(1)).toEqual(['41', 'Lin']);
  });

  it('adding or removing a column with an @if updates the headers', () => {
    const fixture = render();
    fixture.componentInstance.showAge.set(false);
    fixture.detectChanges();
    expect(headers(fixture)).toEqual(['Name', 'Plain']);
    expect(cells(fixture, 0)).toEqual(['0:Ada!', 'Ada']);
    fixture.componentInstance.showAge.set(true);
    fixture.detectChanges();
    expect(headers(fixture)).toEqual(['Name', 'Age', 'Plain']);
  });

  it("the cell templates read the declaring host's fields", () => {
    const fixture = render();
    fixture.componentInstance.suffix.set('?');
    fixture.detectChanges();
    expect(cells(fixture, 0)[0]).toBe('0:Ada?');
  });
});
