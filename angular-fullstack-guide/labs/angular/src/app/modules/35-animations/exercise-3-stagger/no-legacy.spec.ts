import { LabM35StaggerA } from '../../../../../projects/animations-lab/src/app/m35/exercise-3-stagger/a/stagger-a';
import { LabM35StaggerB } from '../../../../../projects/animations-lab/src/app/m35/exercise-3-stagger/b/stagger-b';
import { LabM35StaggerBefore } from '../../../../../projects/animations-lab/src/app/m35/exercise-3-stagger/before/stagger-before';

/** The compiled definition's `data.animation`: the legacy triggers a component declares (undefined when it has none). */
function declaredTriggers(component: object): unknown {
  const definition: unknown = Reflect.get(component, 'ɵcmp');
  if (typeof definition !== 'object' || definition === null || !('data' in definition))
    return undefined;
  const data = definition.data;
  return typeof data === 'object' && data !== null && 'animation' in data
    ? data.animation
    : undefined;
}

// The "animations" array of @Component is stored in the definition's data (read from ɵcmp, an internal name).
describe('Exercise 35.3: legacy metadata', () => {
  it('declares no legacy animations metadata', () => {
    // The control: the "before" component does declare its trigger, so the read finds metadata when it exists.
    expect(declaredTriggers(LabM35StaggerBefore)).toBeDefined();

    expect(declaredTriggers(LabM35StaggerA)).toBeUndefined();
    expect(declaredTriggers(LabM35StaggerB)).toBeUndefined();
  });
});
