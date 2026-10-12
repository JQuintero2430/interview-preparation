// Exercise 12.3: a model of the budget calculator in @angular/build 22.2.1 (`src/utils/bundle-calculator.js`, read), not the CLI.
// The input is what the application builder hands that calculator (`src/tools/esbuild/budget-stats.js`): its `.js` and `.css`
// output files, plus each component stylesheet as an extra entry. Raw bytes only; 1 kB = 1000 bytes. Messages keep the
// calculator's wording with plain byte counts in place of its formatting. One deliberate difference: an unreadable size throws
// here, where the calculator turns an unreadable threshold into NaN and ignores an unreadable baseline (0).

export type BudgetType = 'initial' | 'all' | 'allScript' | 'any' | 'anyScript' | 'anyComponentStyle' | 'bundle';

export interface Budget {
  readonly type: BudgetType;
  readonly name?: string;
  readonly baseline?: string;
  readonly maximumWarning?: string;
  readonly maximumError?: string;
  readonly minimumWarning?: string;
  readonly minimumError?: string;
  readonly warning?: string;
  readonly error?: string;
}

export interface OutputFile {
  readonly name: string;
  readonly size: number;
  readonly initial?: boolean;
  readonly chunkName?: string;
  readonly componentStyle?: boolean;
}

export interface BudgetResult {
  readonly severity: 'warning' | 'error';
  readonly label: string;
  readonly message: string;
}

type Direction = 'maximum' | 'minimum';
type ThresholdField = 'maximumWarning' | 'maximumError' | 'minimumWarning' | 'minimumError' | 'warning' | 'error';

interface Measured {
  readonly label: string;
  readonly size: number;
}

interface Threshold {
  readonly limit: number;
  readonly direction: Direction;
  readonly severity: BudgetResult['severity'];
}

const KILOBYTE = 1000;
const UNIT_BYTES = { b: 1, kb: KILOBYTE, mb: KILOBYTE ** 2, gb: KILOBYTE ** 3 };
const SIZE_PATTERN = /^(\d+(?:\.\d+)?)[ \t]*(%|[kmg]?b)?$/i;

// The calculator's order: each field in turn, and `warning`/`error` yield the minimum before the maximum.
const THRESHOLD_FIELDS: readonly (readonly [ThresholdField, readonly Direction[], BudgetResult['severity']])[] = [
  ['maximumWarning', ['maximum'], 'warning'],
  ['maximumError', ['maximum'], 'error'],
  ['minimumWarning', ['minimum'], 'warning'],
  ['minimumError', ['minimum'], 'error'],
  ['warning', ['minimum', 'maximum'], 'warning'],
  ['error', ['minimum', 'maximum'], 'error'],
];

const total = (files: readonly OutputFile[]): number => files.reduce((sum, file) => sum + file.size, 0);
const each = (files: readonly OutputFile[]): Measured[] => files.map(({ name, size }) => ({ label: name, size }));
const isScript = (file: OutputFile): boolean => file.name.endsWith('.js');
// Component stylesheets are extra assets, not chunks: only `anyComponentStyle` and the script types can see them.
const chunks = (files: readonly OutputFile[]): OutputFile[] => files.filter((file) => file.componentStyle !== true);

const MEASURES: Record<BudgetType, (files: readonly OutputFile[], budget: Budget) => Measured[]> = {
  initial: (files) => [
    {
      label: 'bundle initial',
      size: total(chunks(files).filter((file) => file.initial === true)),
    },
  ],
  all: (files) => [{ label: 'total', size: total(chunks(files)) }],
  allScript: (files) => [{ label: 'total scripts', size: total(files.filter(isScript)) }],
  any: (files) => each(chunks(files)),
  anyScript: (files) => each(files.filter(isScript)),
  anyComponentStyle: (files) => each(files.filter((file) => file.componentStyle === true)),
  bundle: (files, { name }) =>
    !name
      ? []
      : [
          {
            label: name,
            size: total(chunks(files).filter((file) => file.chunkName === name)),
          },
        ],
};

/**
 * Checks the budgets against the build's output files, as the calculator does.
 * @param budgets - The `budgets` array of a build configuration, in declaration order.
 * @param files - The output the builder measures: script and style files, and one entry per component stylesheet.
 * @returns One result per crossed threshold, in budget order; an empty array means the build passes its budgets.
 */
export function checkBudgets(budgets: readonly Budget[], files: readonly OutputFile[]): BudgetResult[] {
  return budgets.flatMap((budget) => {
    const thresholds = thresholdsOf(budget);
    return MEASURES[budget.type](files, budget).flatMap((measured) =>
      thresholds.flatMap((threshold) => check(threshold, measured)),
    );
  });
}

function thresholdsOf(budget: Budget): Threshold[] {
  return THRESHOLD_FIELDS.flatMap(([field, directions, severity]) => {
    const value = budget[field];
    if (!value) {
      return [];
    }
    return directions.map((direction) => ({
      direction,
      severity,
      limit: toBytes(value, budget.baseline, direction),
    }));
  });
}

// With a baseline every threshold is an offset from it, in bytes or as a percentage; without one a percentage is 0 bytes.
function toBytes(value: string, baseline: string | undefined, direction: Direction): number {
  const match = SIZE_PATTERN.exec(value.trim());
  if (match === null) {
    throw new Error(`Unreadable budget size: "${value}"`);
  }
  const base = baseline ? toBytes(baseline, undefined, 'maximum') : 0;
  const unit = (match[2] ?? 'b').toLowerCase();
  const amount = Number(match[1]) * (unit === '%' ? base / 100 : UNIT_BYTES[unit as keyof typeof UNIT_BYTES]);
  if (base === 0) {
    return amount;
  }
  return direction === 'maximum' ? base + amount : base - amount;
}

function check({ limit, direction, severity }: Threshold, { label, size }: Measured): BudgetResult[] {
  if (direction === 'maximum' ? size <= limit : size >= limit) {
    return [];
  }
  const verb = direction === 'maximum' ? 'exceeded maximum budget' : 'failed to meet minimum budget';
  const gap = Math.abs(size - limit);
  return [
    {
      severity,
      label,
      message: `${label} ${verb}. Budget ${limit} bytes was not met by ${gap} bytes with a total of ${size} bytes.`,
    },
  ];
}
