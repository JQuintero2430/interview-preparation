// Shared helper for module 34 (HOUSE-31). Read-only to every module-34 task.
// Parses with jsdom's DOMParser, so the importing test runs in the default Node environment.

/** One `<trans-unit>` of an XLIFF 1.2 file. `target` is absent when the unit has no `<target>` element. */
export interface XliffUnit {
  id: string;
  source: string;
  target?: string;
}

// A variable specifier keeps node:fs out of the bundler's static graph (the lab has no @types/node).
const fsSpecifier = 'node:fs';
const jsdomSpecifier = 'jsdom';
const { JSDOM } = (await import(jsdomSpecifier)) as { JSDOM: new () => { window: { DOMParser: typeof DOMParser } } };
const { readFileSync } = (await import(fsSpecifier)) as { readFileSync: (path: string | URL, encoding: 'utf8') => string };

/** Reads the `<trans-unit>` elements of an XLIFF 1.2 file, in document order. */
export function readUnits(path: string | URL): XliffUnit[] {
  return parseUnits(readFileSync(path, 'utf8'));
}

function parseUnits(xml: string): XliffUnit[] {
  const doc = new (new JSDOM().window.DOMParser)().parseFromString(xml, 'application/xml');
  const error = doc.querySelector('parsererror');
  if (error) throw new Error(`not well-formed XML: ${error.textContent}`);
  return [...doc.getElementsByTagName('trans-unit')].map((unit) => {
    const target = unit.getElementsByTagName('target')[0]?.textContent ?? undefined;
    const result: XliffUnit = {
      id: unit.getAttribute('id') ?? '',
      source: unit.getElementsByTagName('source')[0]?.textContent ?? '',
    };
    if (target !== undefined) result.target = target;
    return result;
  });
}
