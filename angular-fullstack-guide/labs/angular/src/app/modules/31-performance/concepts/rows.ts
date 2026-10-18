/** One dashboard row. */
export interface LabM31Row {
  readonly id: number;
  readonly name: string;
  readonly amount: number;
}

/** How many rows the section 3 dashboard starts with. */
export const LAB_M31_ROW_COUNT = 100;

/**
 * Builds `count` rows named `Row 0`, `Row 1`, …, each with an amount of 1.
 * @param count how many rows to build
 */
export function makeRows(count: number): LabM31Row[] {
  return Array.from({ length: count }, (_, id) => ({ id, name: `Row ${id}`, amount: 1 }));
}

/**
 * The rows whose name contains the query (the "expensive" derivation of the dashboard).
 * @param rows the rows to filter
 * @param query the text a row's name must contain; empty keeps every row
 */
export function filterRows(rows: readonly LabM31Row[], query: string): LabM31Row[] {
  return rows.filter((row) => row.name.includes(query));
}
