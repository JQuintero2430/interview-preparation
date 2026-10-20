// Section 12 claims, on our own code: select-migrations.ts (our selector, mirroring executeMigrations in @angular/cli
// 22.2.1) and update-guide.ts (our classifier, mirroring showUpdatePath in the Update Guide's source). Neither is the
// real thing. The first test reads @angular/core's installed migrations.json from labs/angular/node_modules, read-only
// through support/angular-node-modules.ts (cross-lab read, plan C10); the other data is invented and labeled so.
// No network, git, npm, ng or clock.
import { jsonEntries, jsonField, readInstalledJson } from '../support/angular-node-modules';
import { selectMigrations, type MigrationEntry } from './select-migrations';
import { classifySteps, type GuideStep } from './update-guide';

// The `schematics` map of a migration collection as our selector's entries; fields that are not the expected type are dropped.
function entriesOf(collection: unknown): MigrationEntry[] {
  return jsonEntries(jsonField(collection, 'schematics')).map(([name, entry]) => {
    const version = jsonField(entry, 'version');
    return {
      name,
      version: typeof version === 'string' ? version : '',
      optional: jsonField(entry, 'optional') === true,
      recommended: jsonField(entry, 'recommended') === true,
      hidden: jsonField(entry, 'hidden') === true,
      private: jsonField(entry, 'private') === true,
    };
  });
}

describe('Module 39 · section 12', () => {
  it('Section 12: our selector keeps 22.0.0 migrations for 21.2.3 to 22.2.1 and none for 22.0.0 to 22.2.1', () => {
    const core = entriesOf(readInstalledJson('@angular/core/schematics/migrations.json'));
    expect(core).toHaveLength(8);

    // every entry is 22.0.0, inside (21.2.3, 22.2.1]; equal versions keep the engine's name order
    expect(selectMigrations(core, '21.2.3', '22.2.1')).toEqual({
      required: [
        'can-match-snapshot-required',
        'change-detection-eager',
        'http-xhr-backend',
        'incremental-hydration',
        'model-output',
        'safe-optional-chaining',
        'strict-safe-navigation-narrow',
        'strict-templates-default',
      ],
      optional: [],
    });
    // 22.0.0 is not after 22.0.0: a patch update inside 22 selects nothing
    expect(selectMigrations(core, '22.0.0', '22.2.1')).toEqual({ required: [], optional: [] });
  });

  it('Section 12: our selector puts required migrations before optional ones, each sorted by version', () => {
    // Invented collection (not from any package), listed out of order on purpose.
    const invented: MigrationEntry[] = [
      { name: 'late-change', version: '21.1.0' },
      { name: 'opt-builder', version: '21.0.5', optional: true, recommended: true },
      { name: 'opt-another', version: '21.2.0', optional: true },
      { name: 'early-change', version: '21.0.1' },
      { name: 'next-change', version: '21.2.0-next.1' },
      { name: 'old-change', version: '20.3.0' },
    ];
    expect(selectMigrations(invented, '20.3.0', '21.2.0')).toEqual({
      required: ['early-change', 'late-change', 'next-change'],
      optional: [
        { name: 'opt-builder', checked: true },
        { name: 'opt-another', checked: false },
      ],
    });
  });

  it('Section 12: our classifier drops a step whose necessaryAsOf is not after the from version', () => {
    // Invented steps in the shape of recommendations.ts's `Step` (not the Guide's real data).
    const steps: GuideStep[] = [
      { step: 'due at from', possibleIn: 1700, necessaryAsOf: 1900, level: 1 },
      { step: 'possible before, due later', possibleIn: 1800, necessaryAsOf: 2000, level: 1 },
      { step: 'new in the range', possibleIn: 2000, necessaryAsOf: 2100, level: 2 },
      { step: 'possible at to, due later', possibleIn: 2100, necessaryAsOf: 2200, level: 2 },
      { step: 'advanced only', possibleIn: 2000, necessaryAsOf: 2100, level: 3 },
      { step: 'ngUpgrade only', possibleIn: 2000, necessaryAsOf: 2100, level: 1, ngUpgrade: true },
    ];
    const noOptions = { ngUpgrade: false, material: false, windows: false };
    expect(classifySteps(steps, 1900, 2100, 2, noOptions)).toEqual({
      before: ['possible before, due later'],
      during: ['new in the range'],
      after: ['possible at to, due later'],
    });
  });
});
