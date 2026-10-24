// Section 2 claims, about our model (time-plan.ts), not a published rubric: a 45-minute plan spends every minute and
// starts with requirements; rounding keeps the total equal to the slot; a deep dive takes minutes from the
// lowest-priority steps first; and the protected steps (requirements, failure modes) keep their minutes.
import { METHOD_STEPS, minutesOf, planTime, totalMinutes } from './time-plan';

describe('Section 2: time plan (our model)', () => {
  it('Section 2: a 45-minute plan allocates every minute and starts with requirements', () => {
    const plan = planTime(45);
    expect(plan.slices[0]?.name).toBe('Requirements');
    expect(plan.slices.map((slice) => slice.minutes)).toEqual([7, 7, 6, 5, 5, 5, 4, 6]);
    expect(totalMinutes(plan)).toBe(45);
  });

  it('Section 2: rounding never makes the plan longer or shorter than the slot', () => {
    for (let slot = 20; slot <= 90; slot++) {
      expect(totalMinutes(planTime(slot))).toBe(slot);
    }
    const uneven = [
      { name: 'A', weight: 1, priority: 1, protected: false },
      { name: 'B', weight: 1, priority: 2, protected: false },
      { name: 'C', weight: 1, priority: 3, protected: false },
    ];
    expect(planTime(10, uneven).slices.map((slice) => slice.minutes)).toEqual([4, 3, 3]);
  });

  it('Section 2: a 15-minute deep dive takes minutes from the lowest-priority steps first', () => {
    const base = planTime(45);
    const plan = planTime(45, METHOD_STEPS, 15);
    expect(minutesOf(plan, 'Performance')).toBe(0);
    expect(minutesOf(plan, 'Accessibility')).toBe(0);
    expect(minutesOf(plan, 'API')).toBe(0);
    expect(minutesOf(plan, 'State')).toBe(minutesOf(base, 'State') - 1);
    expect(minutesOf(plan, 'Components')).toBe(minutesOf(base, 'Components'));
    expect(plan.deepDive).toBe(15);
    expect(totalMinutes(plan)).toBe(45);
  });

  it('Section 2: requirements and failure modes keep their minutes under any deep dive', () => {
    const base = planTime(45);
    const cuttable = totalMinutes(base) - minutesOf(base, 'Requirements') - minutesOf(base, 'Failure modes');
    for (let dive = 0; dive <= cuttable; dive++) {
      const plan = planTime(45, METHOD_STEPS, dive);
      expect(minutesOf(plan, 'Requirements')).toBe(minutesOf(base, 'Requirements'));
      expect(minutesOf(plan, 'Failure modes')).toBe(minutesOf(base, 'Failure modes'));
    }
    expect(() => planTime(45, METHOD_STEPS, cuttable + 1)).toThrow(RangeError);
  });
});
