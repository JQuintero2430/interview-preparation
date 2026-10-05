// Predict-whether-it-compiles. Every `@ts-expect-error` below sits on a line that MUST be rejected by tsc
// under this repo's tsconfig (strict, noUncheckedIndexedAccess). Lines without one MUST compile.
// vitest does not type-check: `npm run typecheck` is what proves these expectations.

export {}; // makes this file a module, so its top-level names stay file-local

const names: string[] = ['ada'];
const user = { role: 'admin' };
const directions = ['up', 'down'] as const;
const palette = { red: [255, 0, 0], green: '#0f0' } satisfies Record<string, string | number[]>;

class Meters {
  private readonly unit = 'm';
  describe() {
    return this.unit;
  }
}
class Feet {
  private readonly unit = 'm';
  describe() {
    return this.unit;
  }
}

type Point = { x: number; y: number };
type Vec = { x: number; y: number };

const mustNotCompile = [
  // 1. noUncheckedIndexedAccess: indexing may miss
  // @ts-expect-error - names[0] is string | undefined
  (): string => names[0],
  // 2. excess property check applies to fresh object literals
  // @ts-expect-error - 'y' does not exist in { x: number }
  (): { x: number } => ({ x: 1, y: 2 }),
  // 3. property types widen: role is string, not 'admin'
  // @ts-expect-error - string is not assignable to 'admin'
  (): 'admin' => user.role,
  // 4. as const makes the array a readonly tuple
  // @ts-expect-error - push does not exist on a readonly tuple
  (): number => directions.push('left'),
  // 5. unknown must be narrowed before use
  // @ts-expect-error - u is of type unknown
  (u: unknown): string => u.toFixed(),
  // 6. readonly arrays are not assignable to mutable ones
  // @ts-expect-error - readonly number[] is not number[]
  (ro: readonly number[]): number[] => ro,
  // 7. tuples have a known length
  // @ts-expect-error - no element at index 2
  (t: [string, number]) => t[2],
  // 8. satisfies keeps the narrow inferred type: red is number[], not string | number[]
  // @ts-expect-error - toUpperCase does not exist on number[]
  (): string => palette.red.toUpperCase(),
  // 9. private members make classes nominal
  // @ts-expect-error - separate declarations of private property 'unit'
  (m: Meters): Feet => m,
];

const mustCompile = [
  // 1. structurally identical type aliases are interchangeable
  (p: Point): Vec => p,
  // 2. a non-fresh object may carry extra properties
  (): { x: number } => {
    const wide = { x: 1, y: 2 };
    return wide;
  },
  // 3. satisfies keeps the narrow type, so string members work on `green`
  (): string => palette.green.toUpperCase(),
  // 4. a mutable array is assignable to a readonly one
  (arr: number[]): readonly number[] => arr,
  // 5. narrowing first makes unknown usable
  (u: unknown): string => (typeof u === 'number' ? u.toFixed() : ''),
];

test('the table of predictions has the shape the guide describes', () => {
  expect(mustNotCompile).toHaveLength(9);
  expect(mustCompile).toHaveLength(5);
  expect(new Meters().describe() + new Feet().describe()).toBe('mm');
});
