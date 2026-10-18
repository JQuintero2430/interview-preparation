import { Component } from '@angular/core';

/** One row of the report: a region and its sales per quarter. */
interface LabM31ReportRow {
  readonly region: string;
  readonly quarters: readonly number[];
  readonly total: number;
}

/** Regions and quarters of the generated report. */
const REGIONS = ['North', 'South', 'East', 'West', 'Central', 'Islands'];
const QUARTER_COUNT = 4;

/** Deterministic figures, so the panel renders the same numbers on every run. */
function quarterFigure(regionIndex: number, quarter: number): number {
  return ((regionIndex + 3) * 1_237 + (quarter + 1) * 811) % 9_000 + 1_000;
}

/** Builds the report rows with a total per region. */
function buildReport(): readonly LabM31ReportRow[] {
  return REGIONS.map((region, regionIndex) => {
    const quarters = Array.from({ length: QUARTER_COUNT }, (_, quarter) => quarterFigure(regionIndex, quarter));
    return { region, quarters, total: quarters.reduce((sum, value) => sum + value, 0) };
  });
}

/**
 * The "heavy" part of the loading lab page: a report table that only the `@defer` block
 * references, so the compiler puts it in its own lazy chunk.
 */
@Component({
  selector: 'lab-m31-heavy-panel',
  styles: `
    table {
      border-collapse: collapse;
    }
    th,
    td {
      padding: 4px 8px;
      border: 1px solid #ccc;
      text-align: right;
    }
  `,
  template: `
    <section aria-labelledby="m31-report-heading">
      <h2 id="m31-report-heading">Quarterly report</h2>
      <table>
        <thead>
          <tr>
            <th scope="col">Region</th>
            @for (quarter of quarterLabels; track quarter) {
              <th scope="col">{{ quarter }}</th>
            }
            <th scope="col">Total</th>
          </tr>
        </thead>
        <tbody>
          @for (row of rows; track row.region) {
            <tr>
              <th scope="row">{{ row.region }}</th>
              @for (value of row.quarters; track $index) {
                <td>{{ value }}</td>
              }
              <td>{{ row.total }}</td>
            </tr>
          }
        </tbody>
      </table>
    </section>
  `,
})
export class LabM31HeavyPanel {
  protected readonly quarterLabels = Array.from({ length: QUARTER_COUNT }, (_, quarter) => `Q${quarter + 1}`);
  protected readonly rows = buildReport();
}
