import { readUnits } from './support/xliff';

// Section 6 claims: `ng extract-i18n` writes one trans-unit per message into `messages.xlf`, with the ID the
// message has (custom, or computed from the text and the meaning) and where it came from. The file is the
// committed output of `npx ng extract-i18n i18n-lab --output-path projects/i18n-lab/src/locale`, and the
// lab page is `projects/i18n-lab/src/app/m34/extract/extract.ts`. Node 24 (the file is read as text).
const fsSpecifier = 'node:fs';
const { readFileSync } = (await import(fsSpecifier)) as { readFileSync: (path: URL, encoding: 'utf8') => string };

const LAB = new URL('../../../../angular/projects/i18n-lab/', import.meta.url);
const PAGE = 'projects/i18n-lab/src/app/m34/extract/extract.ts';
const xliff = readFileSync(new URL('src/locale/messages.xlf', LAB), 'utf8');
const units = readUnits(new URL('src/locale/messages.xlf', LAB));

/** The raw XML of the trans-unit with this ID (readUnits keeps only id, source and target). */
function rawUnit(id: string): string {
  const start = xliff.indexOf(`<trans-unit id="${id}"`);
  expect(start, `unit ${id} is in messages.xlf`).toBeGreaterThanOrEqual(0);
  return xliff.slice(start, xliff.indexOf('</trans-unit>', start));
}

describe('E34 extraction (labs/angular/projects/i18n-lab/src/locale/messages.xlf)', () => {
  it('Section 6: the extracted file lists a custom ID as written', () => {
    expect(units.find((unit) => unit.id === 'm34.extract.title')?.source).toBe('Extraction lab');
  });

  it('Section 6: a message without an ID gets a numeric computed ID', () => {
    const unit = units.find((candidate) => candidate.source === 'Welcome back');

    expect(unit?.id).toMatch(/^\d+$/);
    expect(unit?.id).toBe('4200317694838753109');
  });

  it('Section 6: the same text with two meanings gives two units', () => {
    const close = units.filter((unit) => unit.source === 'Close');

    expect(close).toHaveLength(2);
    expect(new Set(close.map((unit) => unit.id)).size).toBe(2);
    expect(rawUnit(close[0]?.id ?? '')).toContain('<note priority="1" from="meaning">door</note>');
    expect(rawUnit(close[1]?.id ?? '')).toContain('<note priority="1" from="meaning">dialog</note>');
  });

  it('Section 6: the extracted unit records its source file and line', () => {
    const unit = rawUnit('m34.extract.title');
    const page = readFileSync(new URL('src/app/m34/extract/extract.ts', LAB), 'utf8');
    const line = page.split('\n').findIndex((text) => text.includes('Extraction lab')) + 1;

    expect(unit).toContain(`<context context-type="sourcefile">${PAGE}</context>`);
    expect(unit).toMatch(new RegExp(`<context context-type="linenumber">${line},\\d+</context>`));
  });
});
