// Output question Q46.13: our wizard (concepts/wizard.ts, our model, not a stepper's or a form library's code) over a
// home claim, and a draft saved under schema 1 (the name field was `fullName`). Plain values only: no storage,
// router, clock or network.
import { landingStep, next, restore, visibleSteps, type Answers, type Draft, type Migration, type Step } from '../../modules/46-system-design-case-studies/concepts/wizard';
import { captureLogs } from '../capture';

const filled = (field: string) => (answers: Answers): boolean => (answers[field] ?? '') !== '';

const steps: readonly Step[] = [
  { id: 'contact', isValid: filled('name') },
  { id: 'claimType', isValid: filled('claimType') },
  { id: 'vehicle', visibleWhen: (answers) => answers['claimType'] === 'vehicle', isValid: filled('plate') },
  { id: 'details', isValid: filled('description') },
  { id: 'review', isValid: () => true },
];

const migrations: readonly Migration[] = [
  { from: 1, migrate: ({ fullName = '', ...rest }) => ({ ...rest, name: fullName }) },
];

describe('46 · Q46.13', () => {
  it('Q46.13 our wizard', async () => {
    const saved: Draft = { schemaVersion: 1, answers: { fullName: 'Ada', claimType: 'home' } };

    const lines = await captureLogs((log) => {
      const home: Answers = { name: 'Ada', claimType: 'home' };
      log(`visible: ${visibleSteps(steps, home).map((step) => step.id).join(', ')}`);
      log(`from claimType, next: ${next(steps, { stepId: 'claimType', answers: home }).stepId}`);

      const restored = restore(saved, migrations);
      log(`restored: v${restored.schemaVersion} ${JSON.stringify(restored.answers)}`);
      log(`lands on: ${landingStep(steps, restored.answers)}`);
      log(`unmigrated draft lands on: ${landingStep(steps, saved.answers)}`);
    });

    expect(lines).toEqual([
      'visible: contact, claimType, details, review',
      'from claimType, next: details',
      'restored: v2 {"claimType":"home","name":"Ada"}',
      'lands on: details',
      'unmigrated draft lands on: contact',
    ]);
  });
});
