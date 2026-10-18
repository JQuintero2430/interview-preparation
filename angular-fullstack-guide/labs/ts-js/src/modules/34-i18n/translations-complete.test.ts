import { readUnits } from './support/xliff';

const LOCALE_DIR = new URL('../../../../angular/projects/i18n-lab/src/locale/', import.meta.url);
const file = (name: string): URL => new URL(name, LOCALE_DIR);
const source = readUnits(file('messages.xlf'));

describe('E34 translation files (labs/angular/projects/i18n-lab/src/locale)', () => {
  it('Smoke: every extracted message has a French and an Arabic translation', () => {
    expect(source.length).toBeGreaterThan(0);
    for (const locale of ['fr', 'ar']) {
      const targets = new Map(readUnits(file(`messages.${locale}.xlf`)).map((unit) => [unit.id, unit.target]));
      for (const unit of source) {
        expect(targets.get(unit.id), `${locale}: message ${unit.id}`).toBeTruthy();
      }
    }
  });
});
