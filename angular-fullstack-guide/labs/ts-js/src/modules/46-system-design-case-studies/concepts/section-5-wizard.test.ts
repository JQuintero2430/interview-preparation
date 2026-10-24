// Section 5 claims, about our model (wizard.ts), not a stepper's or a form library's: the wizard advances only from a
// valid step, a step hidden by an earlier answer is skipped and not validated, Back keeps later answers, a draft from an
// older schema is migrated before it is restored, and a restored draft lands on the first visible step not yet valid.
import { describe, expect, it } from 'vitest';
import { back, landingStep, next, restore, visibleSteps, type Answers, type Draft, type Migration, type Step, type WizardState } from './wizard';

const filled = (field: string) => (answers: Answers): boolean => (answers[field] ?? '') !== '';

// A claim wizard: the vehicle step belongs only to vehicle claims.
const steps: readonly Step[] = [
  { id: 'contact', isValid: filled('name') },
  { id: 'claimType', isValid: filled('claimType') },
  { id: 'vehicle', visibleWhen: (answers) => answers['claimType'] === 'vehicle', isValid: filled('plate') },
  { id: 'details', isValid: filled('description') },
  { id: 'review', isValid: () => true },
];
const ids = (list: readonly Step[]): string[] => list.map((step) => step.id);

// Schema 1 called the name field `fullName`; schema 2 renamed it.
const migrations: readonly Migration[] = [
  { from: 1, migrate: ({ fullName = '', ...rest }) => ({ ...rest, name: fullName }) },
];

describe('Section 5: wizard', () => {
  it('Section 5: the wizard advances only when the current step is valid', () => {
    const empty: WizardState = { stepId: 'contact', answers: {} };
    expect(next(steps, empty)).toBe(empty);
    expect(next(steps, { stepId: 'contact', answers: { name: 'Ada' } }).stepId).toBe('claimType');
  });

  it('Section 5: a step hidden by an earlier answer is skipped and not validated', () => {
    const home: Answers = { name: 'Ada', claimType: 'home' };
    expect(ids(visibleSteps(steps, home))).toEqual(['contact', 'claimType', 'details', 'review']);
    expect(next(steps, { stepId: 'claimType', answers: home }).stepId).toBe('details');
    const vehicle: Answers = { name: 'Ada', claimType: 'vehicle' };
    expect(next(steps, { stepId: 'claimType', answers: vehicle }).stepId).toBe('vehicle');
    expect(next(steps, { stepId: 'vehicle', answers: vehicle }).stepId).toBe('vehicle');
  });

  it('Section 5: going back keeps the answers of later steps', () => {
    const answers: Answers = { name: 'Ada', claimType: 'vehicle', plate: 'XY-12', description: 'Dent' };
    const atDetails: WizardState = { stepId: 'details', answers };
    const atClaimType = back(steps, back(steps, atDetails));
    expect(atClaimType.stepId).toBe('claimType');
    expect(atClaimType.answers).toBe(answers);
    expect(back(steps, { stepId: 'contact', answers }).stepId).toBe('contact');
  });

  it('Section 5: a draft from an older schema version is migrated before it is restored', () => {
    const saved: Draft = { schemaVersion: 1, answers: { fullName: 'Ada', claimType: 'home' } };
    const restored = restore(saved, migrations);
    expect(restored).toEqual({ schemaVersion: 2, answers: { name: 'Ada', claimType: 'home' } });
    expect(restore(restored, migrations)).toEqual(restored);
  });

  it('Section 5: a restored draft lands on the first visible step that is not yet valid', () => {
    const saved: Draft = { schemaVersion: 1, answers: { fullName: 'Ada', claimType: 'home' } };
    expect(landingStep(steps, restore(saved, migrations).answers)).toBe('details');
    expect(landingStep(steps, { name: 'Ada', claimType: 'home', description: 'Leak' })).toBe('review');
  });
});
