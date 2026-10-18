/** The delay between two neighbours of the staggered list, in milliseconds. */
export const STEP_MS = 60;

/** One row of the list: a stable id for `track` and the text. */
export interface StaggerItem {
  readonly id: number;
  readonly label: string;
}

/** The rows "Show list" puts on the page. */
export const STAGGER_ITEMS: readonly StaggerItem[] = [
  { id: 1, label: 'Invoices' },
  { id: 2, label: 'Payments' },
  { id: 3, label: 'Refunds' },
  { id: 4, label: 'Reports' },
];
