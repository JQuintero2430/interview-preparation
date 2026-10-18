// Reduced from the JSON reporter: `file` is a JSONReportSuite's file, `ms` the sum of its tests' result durations.
export interface TestFile {
  readonly file: string;
  readonly ms: number;
}

export type Planner = (files: readonly TestFile[], shards: number) => string[][];

// List scheduling: each file, in the order given, goes to the shard with the smallest load so far (lowest index on a tie).
function assign(ordered: readonly TestFile[], shards: number): string[][] {
  const plan: string[][] = Array.from({ length: shards }, () => []);
  const load: number[] = Array.from({ length: shards }, () => 0);
  for (const { file, ms } of ordered) {
    const target = load.indexOf(Math.min(...load));
    plan[target]?.push(file);
    load[target] = (load[target] ?? 0) + ms;
  }
  return plan;
}

const longestFirst = (a: TestFile, b: TestFile): number => b.ms - a.ms || (a.file < b.file ? -1 : a.file > b.file ? 1 : 0);

// Longest-processing-time-first: the same rule after sorting by duration, ties by file name.
export const planShards: Planner = (files, shards) => assign([...files].sort(longestFirst), shards);

// The alternative: no sort.
export const planInOrder: Planner = (files, shards) => assign(files, shards);
