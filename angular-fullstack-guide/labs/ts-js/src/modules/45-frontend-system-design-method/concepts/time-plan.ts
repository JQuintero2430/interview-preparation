// Section 2 model: how a slot's minutes are shared across the method's eight steps, and what a deep dive takes from
// them. Our model, not a published rubric and not any company's: the weights and priorities are this guide's
// suggestion (M45 section 2, F9's "requirements before designing ... notice your own design's failure modes" is why
// two steps are protected). Nothing here reads a clock or a random source; the slot is a number the caller passes.

export interface Step {
  readonly name: string;
  /** Relative share of the slot. */
  readonly weight: number;
  /** Higher is kept longer when a deep dive needs minutes. */
  readonly priority: number;
  /** A protected step never gives up minutes. */
  readonly protected: boolean;
}

export interface Slice {
  readonly name: string;
  readonly minutes: number;
}

export interface Plan {
  readonly slices: readonly Slice[];
  readonly deepDive: number;
}

/** Our suggested weights for the eight steps (section 1's list, in order). */
export const METHOD_STEPS: readonly Step[] = [
  { name: 'Requirements', weight: 15, priority: 8, protected: true },
  { name: 'Components', weight: 15, priority: 6, protected: false },
  { name: 'Data and flow', weight: 12, priority: 5, protected: false },
  { name: 'State', weight: 10, priority: 4, protected: false },
  { name: 'API', weight: 10, priority: 3, protected: false },
  { name: 'Performance', weight: 10, priority: 1, protected: false },
  { name: 'Accessibility', weight: 8, priority: 2, protected: false },
  { name: 'Failure modes', weight: 12, priority: 7, protected: true },
];

/** Largest-remainder rounding in integers: floors first, then one extra minute to the biggest remainders. */
function shares(slotMinutes: number, steps: readonly Step[]): number[] {
  const total = steps.reduce((sum, step) => sum + step.weight, 0);
  const floors = steps.map((step) => Math.floor((slotMinutes * step.weight) / total));
  const byRemainder = steps
    .map((step, index) => ({ index, remainder: (slotMinutes * step.weight) % total }))
    .sort((a, b) => b.remainder - a.remainder || a.index - b.index);
  const leftover = slotMinutes - floors.reduce((sum, minutes) => sum + minutes, 0);
  byRemainder.slice(0, leftover).forEach(({ index }) => {
    floors[index] = (floors[index] ?? 0) + 1;
  });
  return floors;
}

/** Unprotected step indexes, lowest priority first: the order in which a deep dive takes minutes. */
function cutOrder(steps: readonly Step[]): number[] {
  return steps
    .map((step, index) => ({ step, index }))
    .filter(({ step }) => !step.protected)
    .sort((a, b) => a.step.priority - b.step.priority)
    .map(({ index }) => index);
}

export function planTime(slotMinutes: number, steps: readonly Step[] = METHOD_STEPS, deepDive = 0): Plan {
  const minutes = shares(slotMinutes, steps);
  let owed = deepDive;
  for (const index of cutOrder(steps)) {
    const taken = Math.min(owed, minutes[index] ?? 0);
    minutes[index] = (minutes[index] ?? 0) - taken;
    owed -= taken;
  }
  if (owed > 0) throw new RangeError(`a ${deepDive}-minute deep dive needs ${owed} minutes the protected steps own`);
  return { slices: steps.map((step, index) => ({ name: step.name, minutes: minutes[index] ?? 0 })), deepDive };
}

export function minutesOf(plan: Plan, name: string): number {
  return plan.slices.find((slice) => slice.name === name)?.minutes ?? 0;
}

export function totalMinutes(plan: Plan): number {
  return plan.slices.reduce((sum, slice) => sum + slice.minutes, 0) + plan.deepDive;
}
